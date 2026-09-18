import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Ctx = {
  supabase: any;
  userId: string;
  claims?: any;
};

async function requireStaff(context: Ctx) {
  console.log("[ADMIN DEBUG] Checking staff access:", {
    userId: context.userId,
  });

  const { data, error } = await context.supabase.rpc("is_staff", {
    _user_id: context.userId,
  });

  console.log("[ADMIN DEBUG] is_staff result:", {
    userId: context.userId,
    data,
    error: error?.message ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Not authorized");
  }

  const { data: roles, error: rolesError } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId);

  if (rolesError) {
    throw new Error(rolesError.message);
  }

  const roleList = (roles ?? []).map(
    (r: { role: string }) => r.role,
  );

  console.log("[ADMIN DEBUG] User roles:", {
    userId: context.userId,
    roles: roleList,
  });

  return roleList;
}

async function profileMap(
  context: Ctx,
  ids: (string | null | undefined)[],
) {
  const unique = [...new Set(ids.filter(Boolean))] as string[];

  if (!unique.length) {
    return {} as Record<
      string,
      { name: string; email: string }
    >;
  }

  const { data, error } = await context.supabase
    .from("profiles")
    .select("id, first_name, last_name, email")
    .in("id", unique);

  if (error) {
    throw new Error(error.message);
  }

  const map: Record<
    string,
    { name: string; email: string }
  > = {};

  for (const p of data ?? []) {
    map[p.id] = {
      name:
        `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() ||
        p.email,
      email: p.email,
    };
  }

  return map;
}

/**
 * Get the authenticated staff/admin session.
 *
 * Temporary diagnostic logging is included here so we can verify
 * that the JWT user ID matches the user that has the admin role.
 */
export const getAdminSession = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as Ctx;

    console.log("[ADMIN DEBUG] Authentication context:", {
      userId: ctx.userId,
      email: ctx.claims?.email ?? null,
      claims: ctx.claims
        ? {
            sub: ctx.claims.sub ?? null,
            email: ctx.claims.email ?? null,
          }
        : null,
    });

    const roles = await requireStaff(ctx);

    console.log("[ADMIN DEBUG] Staff check passed:", {
      userId: ctx.userId,
      email: ctx.claims?.email ?? null,
      roles,
    });

    const { data: canAct, error } = await ctx.supabase.rpc(
      "can_admin_act",
      {
        _user_id: ctx.userId,
      },
    );

    console.log("[ADMIN DEBUG] can_admin_act result:", {
      userId: ctx.userId,
      canAct,
      error: error?.message ?? null,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      roles,
      canAct: !!canAct,
      email: ctx.claims?.email ?? null,
    };
  });

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as Ctx;

    await requireStaff(ctx);

    const count = async (
      table: string,
      apply: (q: any) => any = (q) => q,
    ) => {
      const { count: c, error } = await apply(
        ctx.supabase.from(table).select("id", {
          count: "exact",
          head: true,
        }),
      );

      if (error) {
        throw new Error(error.message);
      }

      return c ?? 0;
    };

    const [
      customers,
      pendingKyc,
      totalAccounts,
      pendingDeposits,
      pendingWithdrawals,
      pendingTransfers,
      pendingLoans,
    ] = await Promise.all([
      count("profiles"),

      count("kyc_submissions", (q) =>
        q.in("status", [
          "pending",
          "in_review",
          "unverified",
        ]),
      ),

      count("accounts"),

      count("transactions", (q) =>
        q
          .eq("direction", "credit")
          .in("status", ["pending", "processing"]),
      ),

      count("transactions", (q) =>
        q
          .eq("direction", "debit")
          .in("status", ["pending", "processing"]),
      ),

      count("transfers", (q) =>
        q.in("status", [
          "pending",
          "under_review",
          "processing",
        ]),
      ),

      count("loans", (q) =>
        q.in("status", ["pending", "under_review"]),
      ),
    ]);

    const { data: recentTxns, error: txnError } =
      await ctx.supabase
        .from("transactions")
        .select(
          "id, user_id, description, type, direction, amount, currency, status, reference, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(8);

    if (txnError) {
      throw new Error(txnError.message);
    }

    const { data: recentActions, error: auditError } =
      await ctx.supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);

    if (auditError) {
      throw new Error(auditError.message);
    }

    const names = await profileMap(
      ctx,
      (recentTxns ?? []).map((t: any) => t.user_id),
    );

    return {
      stats: {
        customers,
        pendingKyc,
        totalAccounts,
        pendingDeposits,
        pendingWithdrawals,
        pendingTransfers,
        pendingLoans,
      },

      recentTxns: (recentTxns ?? []).map((t: any) => ({
        ...t,
        customer: names[t.user_id]?.name ?? "—",
      })),

      recentActions: recentActions ?? [],
    };
  });

export const listCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        search: z.string().trim().max(120).default(""),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const ctx = context as Ctx;

    await requireStaff(ctx);

    let q = ctx.supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (data.search) {
      const s = `%${data.search}%`;

      q = q.or(
        `email.ilike.${s},first_name.ilike.${s},last_name.ilike.${s},username.ilike.${s}`,
      );
    }

    const { data: rows, error } = await q;

    if (error) {
      throw new Error(error.message);
    }

    return rows ?? [];
  });

export const getCustomerDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        userId: z.string().uuid(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const ctx = context as Ctx;

    await requireStaff(ctx);

    const {
      data: profile,
      error: profileError,
    } = await ctx.supabase
      .from("profiles")
      .select("*")
      .eq("id", data.userId)
      .maybeSingle();

    if (profileError) {
      throw new Error(profileError.message);
    }

    if (!profile) {
      throw new Error("Customer not found");
    }

    const [
      { data: accounts, error: accountsError },
      { data: transactions, error: transactionsError },
      { data: loans, error: loansError },
      { data: kyc, error: kycError },
    ] = await Promise.all([
      ctx.supabase
        .from("accounts")
        .select("*")
        .eq("user_id", data.userId),

      ctx.supabase
        .from("transactions")
        .select("*")
        .eq("user_id", data.userId)
        .order("created_at", { ascending: false })
        .limit(50),

      ctx.supabase
        .from("loans")
        .select("*")
        .eq("user_id", data.userId)
        .order("created_at", { ascending: false }),

      ctx.supabase
        .from("kyc_submissions")
        .select("*")
        .eq("user_id", data.userId)
        .order("created_at", { ascending: false }),
    ]);

    if (accountsError) {
      throw new Error(accountsError.message);
    }

    if (transactionsError) {
      throw new Error(transactionsError.message);
    }

    if (loansError) {
      throw new Error(loansError.message);
    }

    if (kycError) {
      throw new Error(kycError.message);
    }

    return {
      profile,
      accounts: accounts ?? [],
      transactions: transactions ?? [],
      loans: loans ?? [],
      kyc: kyc ?? [],
    };
  });

export const listKyc = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        status: z.string().default("pending"),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const ctx = context as Ctx;

    await requireStaff(ctx);

    let q = ctx.supabase
      .from("kyc_submissions")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(200);

    if (data.status === "pending") {
      q = q.in("status", [
        "unverified",
        "pending",
        "in_review",
      ]);
    } else if (data.status === "approved") {
      q = q.eq("status", "verified");
    } else if (data.status === "rejected") {
      q = q.eq("status", "rejected");
    } else if (data.status !== "all") {
      q = q.eq("status", data.status);
    }

    const { data: rows, error } = await q;

    if (error) {
      throw new Error(error.message);
    }

    const names = await profileMap(
      ctx,
      (rows ?? []).map((r: any) => r.user_id),
    );

    return (rows ?? []).map((r: any) => ({
      ...r,
      customer: names[r.user_id]?.name ?? "—",
      customerEmail: names[r.user_id]?.email ?? "",
    }));
  });

export const reviewKyc = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        userId: z.string().uuid(),
        decision: z.enum([
          "verified",
          "rejected",
          "in_review",
        ]),
        reason: z
          .string()
          .trim()
          .max(400)
          .optional()
          .or(z.literal("")),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const ctx = context as Ctx;

    await requireStaff(ctx);

    const { error } = await ctx.supabase.rpc(
      "admin_review_kyc",
      {
        _user_id: data.userId,
        _decision: data.decision,
        _reason: data.reason || null,
      },
    );

    if (error) {
      throw new Error(error.message);
    }

    return { ok: true };
  });

export const listAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        search: z.string().trim().max(120).default(""),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const ctx = context as Ctx;

    await requireStaff(ctx);

    let q = ctx.supabase
      .from("accounts")
      .select("*")
      .order("opened_at", { ascending: false })
      .limit(300);

    if (data.search) {
      q = q.or(
        `display_name.ilike.%${data.search}%,account_last4.ilike.%${data.search}%`,
      );
    }

    const { data: rows, error } = await q;

    if (error) {
      throw new Error(error.message);
    }

    const names = await profileMap(
      ctx,
      (rows ?? []).map((r: any) => r.user_id),
    );

    return (rows ?? []).map((r: any) => ({
      ...r,
      customer: names[r.user_id]?.name ?? "—",
      customerEmail: names[r.user_id]?.email ?? "",
    }));
  });

export const setAccountStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        accountId: z.string().uuid(),
        status: z.enum([
          "pending",
          "active",
          "frozen",
          "closed",
        ]),
        reason: z
          .string()
          .trim()
          .max(400)
          .optional()
          .or(z.literal("")),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const ctx = context as Ctx;

    await requireStaff(ctx);

    const { error } = await ctx.supabase.rpc(
      "admin_set_account_status",
      {
        _account_id: data.accountId,
        _status: data.status,
        _reason: data.reason || null,
      },
    );

    if (error) {
      throw new Error(error.message);
    }

    return { ok: true };
  });

export const setCustomerStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        userId: z.string().uuid(),
        status: z.string(),
        reason: z
          .string()
          .trim()
          .max(400)
          .optional()
          .or(z.literal("")),
      })
      .parse(i),
  )
  .handler(async () => {
    throw new Error(
      "Customer profile status is not available because the profiles table has no status column.",
    );
  });

export const listLedger = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        search: z.string().trim().max(120).default(""),
        status: z.string().default("all"),
        type: z.string().default("all"),
        direction: z.string().default("all"),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const ctx = context as Ctx;

    await requireStaff(ctx);

    let q = ctx.supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);

    if (data.status !== "all") {
      q = q.eq("status", data.status);
    }

    if (data.type !== "all") {
      q = q.eq("type", data.type);
    }

    if (data.direction !== "all") {
      q = q.eq("direction", data.direction);
    }

    if (data.search) {
      q = q.or(
        `description.ilike.%${data.search}%,reference.ilike.%${data.search}%`,
      );
    }

    const { data: rows, error } = await q;

    if (error) {
      throw new Error(error.message);
    }

    const names = await profileMap(
      ctx,
      (rows ?? []).map((r: any) => r.user_id),
    );

    return (rows ?? []).map((r: any) => ({
      ...r,
      customer: names[r.user_id]?.name ?? "—",
      customerEmail: names[r.user_id]?.email ?? "",
    }));
  });

export const reviewTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        id: z.string().uuid(),
        approve: z.boolean(),
        reason: z
          .string()
          .trim()
          .max(400)
          .optional()
          .or(z.literal("")),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const ctx = context as Ctx;

    await requireStaff(ctx);

    const { error } = await ctx.supabase.rpc(
      "admin_review_transaction",
      {
        _txn_id: data.id,
        _approve: data.approve,
        _reason: data.reason || null,
      },
    );

    if (error) {
      throw new Error(error.message);
    }

    return { ok: true };
  });

export const listTransfers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        status: z.string().default("pending"),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const ctx = context as Ctx;

    await requireStaff(ctx);

    let q = ctx.supabase
      .from("transfers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (data.status === "pending") {
      q = q.in("status", [
        "pending",
        "under_review",
        "processing",
      ]);
    } else if (data.status !== "all") {
      q = q.eq("status", data.status);
    }

    const { data: rows, error } = await q;

    if (error) {
      throw new Error(error.message);
    }

    const names = await profileMap(
      ctx,
      (rows ?? []).map((r: any) => r.sender_user_id),
    );

    return (rows ?? []).map((r: any) => ({
      ...r,
      customer:
        names[r.sender_user_id]?.name ?? "—",
      customerEmail:
        names[r.sender_user_id]?.email ?? "",
    }));
  });

export const reviewTransfer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        id: z.string().uuid(),
        approve: z.boolean(),
        reason: z
          .string()
          .trim()
          .max(400)
          .optional()
          .or(z.literal("")),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const ctx = context as Ctx;

    await requireStaff(ctx);

    const { error } = await ctx.supabase.rpc(
      "admin_review_transfer",
      {
        _transfer_id: data.id,
        _approve: data.approve,
        _reason: data.reason || null,
      },
    );

    if (error) {
      throw new Error(error.message);
    }

    return { ok: true };
  });

export const listLoans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        status: z.string().default("pending"),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const ctx = context as Ctx;

    await requireStaff(ctx);

    let q = ctx.supabase
      .from("loans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (data.status === "pending") {
      q = q.in("status", [
        "pending",
        "under_review",
      ]);
    } else if (data.status !== "all") {
      q = q.eq("status", data.status);
    }

    const { data: rows, error } = await q;

    if (error) {
      throw new Error(error.message);
    }

    const names = await profileMap(
      ctx,
      (rows ?? []).map((r: any) => r.user_id),
    );

    return (rows ?? []).map((r: any) => ({
      ...r,
      customer: names[r.user_id]?.name ?? "—",
      customerEmail: names[r.user_id]?.email ?? "",
    }));
  });

export const reviewLoan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum([
          "under_review",
          "approved",
          "rejected",
          "active",
          "paid",
          "defaulted",
          "cancelled",
        ]),
        reason: z
          .string()
          .trim()
          .max(400)
          .optional()
          .or(z.literal("")),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const ctx = context as Ctx;

    await requireStaff(ctx);

    const { error } = await ctx.supabase.rpc(
      "admin_review_loan",
      {
        _loan_id: data.id,
        _status: data.status,
        _reason: data.reason || null,
      },
    );

    if (error) {
      throw new Error(error.message);
    }

    return { ok: true };
  });

export const listAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        search: z.string().trim().max(120).default(""),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const ctx = context as Ctx;

    await requireStaff(ctx);

    let q = ctx.supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);

    if (data.search) {
      q = q.or(
        `action.ilike.%${data.search}%,actor_email.ilike.%${data.search}%,entity.ilike.%${data.search}%`,
      );
    }

    const { data: rows, error } = await q;

    if (error) {
      throw new Error(error.message);
    }

    return rows ?? [];
  });
