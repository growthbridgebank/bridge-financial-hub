import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

/**
 * All reads below go through the browser Supabase client, so the existing
 * Row Level Security policies apply and a user can only ever read their own
 * rows. No service-role key, no cross-user queries.
 */

export type CustomerProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string | null;
  phone: string | null;
  kyc_status: string;
  status: string;
  two_factor_enabled: boolean;
};

export type CustomerAccount = {
  id: string;
  display_name: string;
  type: "checking" | "savings" | "investment" | "rewards";
  current_cents: number;
  available_cents: number;
  currency: string;
  status: string;
  account_last4: string | null;
  apy: number | null;
};

export type CustomerTransaction = {
  id: string;
  amount_cents: number;
  description: string;
  merchant: string | null;
  posted_at: string;
  status: string;
  type: string;
  direction: "credit" | "debit";
  category: string;
  provider_reference: string | null;
};

export type CustomerCard = {
  id: string;
  cardholder_name: string;
  last4: string | null;
  status: string;
  design: string;
  exp_month: number | null;
  exp_year: number | null;
  account_id: string | null;
};

export type CustomerGoal = {
  id: string;
  name: string;
  category: string;
  current_cents: number;
  target_cents: number;
  target_date: string | null;
};

async function requireUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Not signed in");
  return data.user.id;
}

export function useCustomerProfile() {
  return useQuery({
    queryKey: ["customer", "profile"],
    queryFn: async (): Promise<CustomerProfile | null> => {
      const userId = await requireUserId();
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id,first_name,last_name,email,username,phone,kyc_status,status,two_factor_enabled",
        )
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data as CustomerProfile | null;
    },
  });
}

export function useCustomerAccounts() {
  return useQuery({
    queryKey: ["customer", "accounts"],
    queryFn: async (): Promise<CustomerAccount[]> => {
      const userId = await requireUserId();
      const { data, error } = await supabase
        .from("accounts")
        .select(
          "id,display_name,type,current_cents,available_cents,currency,status,account_last4,apy",
        )
        .eq("user_id", userId)
        .order("opened_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CustomerAccount[];
    },
  });
}

export function useCustomerTransactions(limit = 25) {
  return useQuery({
    queryKey: ["customer", "transactions", limit],
    queryFn: async (): Promise<CustomerTransaction[]> => {
      const userId = await requireUserId();
      const { data, error } = await supabase
        .from("transactions")
        .select(
          "id,amount_cents,description,merchant,posted_at,status,type,direction,category,provider_reference",
        )
        .eq("user_id", userId)
        .order("posted_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as CustomerTransaction[];
    },
  });
}

export function useCustomerCards() {
  return useQuery({
    queryKey: ["customer", "cards"],
    queryFn: async (): Promise<CustomerCard[]> => {
      const userId = await requireUserId();
      const { data, error } = await supabase
        .from("cards")
        .select("id,cardholder_name,last4,status,design,exp_month,exp_year,account_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CustomerCard[];
    },
  });
}

export function useCustomerInvestments() {
  return useQuery({
    queryKey: ["customer", "investments"],
    queryFn: async () => {
      const userId = await requireUserId();
      const { data, error } = await supabase
        .from("investment_accounts")
        .select("id,portfolio_value_cents,cash_cents,day_change_cents,total_return_cents,custodian")
        .eq("user_id", userId);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCustomerRewards() {
  return useQuery({
    queryKey: ["customer", "rewards"],
    queryFn: async () => {
      const userId = await requireUserId();
      const { data, error } = await supabase
        .from("reward_transactions")
        .select("id,amount_cents,description,type,status,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCustomerGoals() {
  return useQuery({
    queryKey: ["customer", "goals"],
    queryFn: async (): Promise<CustomerGoal[]> => {
      const userId = await requireUserId();
      const { data, error } = await supabase
        .from("goals")
        .select("id,name,category,current_cents,target_cents,target_date")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CustomerGoal[];
    },
  });
}

export function useCustomerLoans() {
  return useQuery({
    queryKey: ["customer", "loans"],
    queryFn: async () => {
      const userId = await requireUserId();
      const { data, error } = await supabase
        .from("loans")
        .select("id,amount_cents,purpose,status,term_months,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Sum helpers -------------------------------------------------------- */

export function sumAccounts(
  accounts: CustomerAccount[] | undefined,
  type?: CustomerAccount["type"],
) {
  return (accounts ?? [])
    .filter((account) => (type ? account.type === type : true))
    .reduce((total, account) => total + (account.current_cents ?? 0), 0);
}

export function primaryCurrency(accounts: CustomerAccount[] | undefined) {
  return accounts?.[0]?.currency ?? "USD";
}
