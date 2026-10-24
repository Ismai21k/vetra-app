import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "./auth";

type Tables = Database["public"]["Tables"];
export type TableName =
  | "animals"
  | "health_records"
  | "reminders"
  | "activities"
  | "transactions"
  | "consultation_requests"
  | "community_posts";
export type Row<T extends TableName> = Tables[T]["Row"];
export type Insert<T extends TableName> = Tables[T]["Insert"];

const orderCol: Record<TableName, string> = {
  animals: "created_at",
  health_records: "record_date",
  reminders: "due_date",
  activities: "activity_date",
  transactions: "tx_date",
  consultation_requests: "created_at",
  community_posts: "created_at",
};

export function useList<T extends TableName>(table: T) {
  const { session } = useAuth();
  return useQuery({
    queryKey: [table, session?.user.id],
    queryFn: async () => {
      if (!session) return [] as Row<T>[];
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order(orderCol[table], { ascending: table === "reminders" })
        .limit(1000);
      if (error) throw error;
      return data as unknown as Row<T>[];
    },
  });
}

export function useInsert<T extends TableName>(table: T) {
  const qc = useQueryClient();
  const { session } = useAuth();
  return useMutation({
    mutationFn: async (row: Insert<T>) => {
      if (!session) throw new Error("Please sign up or log in to save.");
      const { data, error } = await supabase.from(table).insert(row as never).select().single();
      if (error) throw error;
      return data as unknown as Row<T>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdate<T extends TableName>(table: T) {
  const qc = useQueryClient();
  const { session } = useAuth();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Row<T>> & { id: string }) => {
      if (!session) throw new Error("Please sign up or log in to save.");
      const { error } = await supabase.from(table).update(patch as never).eq("id" as never, id as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDelete<T extends TableName>(table: T) {
  const qc = useQueryClient();
  const { session } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!session) throw new Error("Please sign up or log in to save.");
      const { error } = await supabase.from(table).delete().eq("id" as never, id as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useProfile() {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["profile", session?.user.id],
    enabled: !!session,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", session!.user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export const todayISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

/** Days from today (local) to an ISO date. Negative = past. */
export function daysUntil(iso: string, from = todayISO()) {
  const a = Date.parse(from + "T00:00:00Z");
  const b = Date.parse(iso + "T00:00:00Z");
  return Math.round((b - a) / 86400000);
}

export function reminderState(r: { status: string; due_date: string }, from = todayISO()) {
  if (r.status !== "pending") return r.status as "done" | "missed" | "cancelled";
  return daysUntil(r.due_date, from) < 0 ? "overdue" : "upcoming";
}

export function sumTransactions(rows: { kind: string; amount: number | string }[]) {
  let income = 0, expense = 0;
  for (const r of rows) {
    const v = Number(r.amount);
    if (r.kind === "income") income += v; else expense += v;
  }
  return { income, expense, net: income - expense };
}

export const formatMoney = (n: number, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

export const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const speciesEmoji: Record<string, string> = {
  cattle: "🐄", goat: "🐐", sheep: "🐑", poultry: "🐔", fish: "🐟", other: "🐾",
};
