import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        first_name: z.string().trim().min(1).max(60),
        last_name: z.string().trim().min(1).max(60),
        phone: z.string().trim().max(20).optional().or(z.literal("")),
        address_line1: z.string().trim().max(160).optional().or(z.literal("")),
        city: z.string().trim().max(80).optional().or(z.literal("")),
        state: z.string().trim().max(60).optional().or(z.literal("")),
        postal_code: z.string().trim().max(12).optional().or(z.literal("")),
        country: z.string().trim().max(60).optional().or(z.literal("")),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone || null,
        address_line1: data.address_line1 || null,
        city: data.city || null,
        state: data.state || null,
        postal_code: data.postal_code || null,
        country: data.country || null,
      })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("accounts")
      .select("*")
      .eq("user_id", context.userId)
      .order("opened_at", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getAccountDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ accountId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: account, error } = await context.supabase
      .from("accounts")
      .select("*")
      .eq("id", data.accountId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!account) throw new Error("Account not found");
    const { data: transactions, error: txnError } = await context.supabase
      .from("transactions")
      .select("*")
      .eq("account_id", data.accountId)
      .order("posted_at", { ascending: false })
      .limit(200);
    if (txnError) throw new Error(txnError.message);
    return { account, transactions: transactions ?? [] };
  });

export const createTestAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        type: z.enum(["checking", "savings"]),
        displayName: z.string().trim().min(2).max(60),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const last4 = String(Math.floor(1000 + Math.random() * 9000));
    const { data: account, error } = await context.supabase
      .from("accounts")
      .insert({
        user_id: context.userId,
        type: data.type,
        display_name: data.displayName,
        account_last4: last4,
        routing_last4: "0210",
        status: "active",
        source: "test",
        available_cents: 0,
        current_cents: 0,
        apy: data.type === "savings" ? 4.1 : null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return account;
  });

export const getRecentTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ limit: z.number().int().min(1).max(100).default(10) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("transactions")
      .select("*, accounts(display_name, type, account_last4)")
      .eq("user_id", context.userId)
      .order("posted_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getMyTransfers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("transfers")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createTestTransfer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        fromAccountId: z.string().uuid(),
        toAccountId: z.string().uuid(),
        amountCents: z.number().int().positive().max(100_000_000),
        memo: z.string().trim().max(140).optional().or(z.literal("")),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    if (data.fromAccountId === data.toAccountId) throw new Error("Choose two different accounts");
    const { supabase, userId } = context;

    const { data: from } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", data.fromAccountId)
      .eq("user_id", userId)
      .eq("source", "test")
      .maybeSingle();
    const { data: to } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", data.toAccountId)
      .eq("user_id", userId)
      .eq("source", "test")
      .maybeSingle();
    if (!from || !to) throw new Error("Test transfers move funds between your own test accounts only");
    if (from.available_cents < data.amountCents) throw new Error("Insufficient available balance");

    const { data: transfer, error } = await supabase
      .from("transfers")
      .insert({
        user_id: userId,
        from_account_id: from.id,
        to_account_id: to.id,
        amount_cents: data.amountCents,
        memo: data.memo || null,
        status: "completed",
        source: "test",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    const fromBalance = from.current_cents - data.amountCents;
    const toBalance = to.current_cents + data.amountCents;
    await supabase
      .from("accounts")
      .update({ current_cents: fromBalance, available_cents: fromBalance })
      .eq("id", from.id);
    await supabase
      .from("accounts")
      .update({ current_cents: toBalance, available_cents: toBalance })
      .eq("id", to.id);

    await supabase.from("transactions").insert([
      {
        user_id: userId,
        account_id: from.id,
        description: `Transfer to ${to.display_name}`,
        type: "transfer",
        category: "transfer",
        direction: "debit",
        amount_cents: data.amountCents,
        running_balance_cents: fromBalance,
        status: "completed",
        source: "test",
      },
      {
        user_id: userId,
        account_id: to.id,
        description: `Transfer from ${from.display_name}`,
        type: "transfer",
        category: "transfer",
        direction: "credit",
        amount_cents: data.amountCents,
        running_balance_cents: toBalance,
        status: "completed",
        source: "test",
      },
    ]);
    return transfer;
  });

export const addTestFunds = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        accountId: z.string().uuid(),
        amountCents: z.number().int().positive().max(10_000_000),
        description: z.string().trim().min(2).max(80).default("Test deposit"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: account } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", data.accountId)
      .eq("user_id", userId)
      .eq("source", "test")
      .maybeSingle();
    if (!account) throw new Error("Test funds can only be added to a test account");
    const balance = account.current_cents + data.amountCents;
    await supabase
      .from("accounts")
      .update({ current_cents: balance, available_cents: balance })
      .eq("id", account.id);
    const { error } = await supabase.from("transactions").insert({
      user_id: userId,
      account_id: account.id,
      description: data.description,
      type: "deposit",
      category: "income",
      direction: "credit",
      amount_cents: data.amountCents,
      running_balance_cents: balance,
      status: "completed",
      source: "test",
    });
    if (error) throw new Error(error.message);
    return { ok: true, balance };
  });

export const getMyGoals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("goals")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().trim().min(2).max(80),
        category: z.string().trim().min(2).max(40).default("custom"),
        targetCents: z.number().int().positive().max(1_000_000_000),
        currentCents: z.number().int().min(0).max(1_000_000_000).default(0),
        targetDate: z.string().optional().or(z.literal("")),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      name: data.name,
      category: data.category,
      target_cents: data.targetCents,
      current_cents: data.currentCents,
      target_date: data.targetDate || null,
    };
    if (data.id) {
      const { error } = await context.supabase
        .from("goals")
        .update(payload)
        .eq("id", data.id)
        .eq("user_id", context.userId);
      if (error) throw new Error(error.message);
      return { ok: true };
    }
    const { error } = await context.supabase.from("goals").insert({ ...payload, user_id: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("goals").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyCards = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("cards")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getMyRewards = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("reward_transactions")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getMyInvestments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: accounts, error } = await context.supabase
      .from("investment_accounts")
      .select("*")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    const ids = (accounts ?? []).map((a) => a.id);
    const { data: holdings } = ids.length
      ? await context.supabase.from("investment_holdings").select("*").in("investment_account_id", ids)
      : { data: [] };
    const { data: activity } = ids.length
      ? await context.supabase
          .from("investment_transactions")
          .select("*")
          .in("investment_account_id", ids)
          .order("occurred_at", { ascending: false })
          .limit(50)
      : { data: [] };
    return { accounts: accounts ?? [], holdings: holdings ?? [], activity: activity ?? [] };
  });

export const getMyNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("notifications")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getMySecurityEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("security_events")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const logSecurityEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ eventType: z.string().trim().min(2).max(60), detail: z.string().trim().max(300).optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("security_events").insert({
      user_id: context.userId,
      event_type: data.eventType,
      detail: data.detail ?? null,
      user_agent: typeof navigator === "undefined" ? null : null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        subject: z.string().trim().min(4).max(120),
        category: z.string().trim().min(2).max(40).default("general"),
        body: z.string().trim().min(10).max(2000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: ticket, error } = await context.supabase
      .from("support_tickets")
      .insert({ user_id: context.userId, subject: data.subject, category: data.category })
      .select()
      .single();
    if (error) throw new Error(error.message);
    const { error: msgError } = await context.supabase.from("ticket_messages").insert({
      ticket_id: ticket.id,
      user_id: context.userId,
      body: data.body,
      from_staff: false,
    });
    if (msgError) throw new Error(msgError.message);
    return ticket;
  });
