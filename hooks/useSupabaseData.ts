"use client";

import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface ListOptions {
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
}

/**
 * Fetches every row of `table` and keeps the list live: any insert, update,
 * or delete on that table (from this client or any other) triggers a
 * refetch via Supabase Realtime. `notConfigured` (via `isSupabaseConfigured`)
 * lets pages render a clear "connect your database" state instead of
 * silently showing nothing.
 */
export function useRealtimeList<T>(table: string, opts?: ListOptions) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const orderBy = opts?.orderBy;
  const ascending = opts?.ascending;
  const limit = opts?.limit;

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    let query = supabase.from(table).select("*");
    if (orderBy) query = query.order(orderBy, { ascending: ascending ?? true });
    if (limit) query = query.limit(limit);

    query.then(({ data, error }) => {
      setError(error?.message ?? null);
      setData((data ?? []) as T[]);
      setLoading(false);
    });

    const channel = supabase
      .channel(`realtime:${table}:list`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => {
        setReloadToken((t) => t + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, orderBy, ascending, limit, reloadToken]);

  return {
    data,
    loading,
    error,
    refetch: () => setReloadToken((t) => t + 1),
    isSupabaseConfigured,
  };
}

/**
 * Fetches a single row (optionally filtered by `match`) and keeps it live
 * the same way `useRealtimeList` does. Useful for singleton tables like
 * `venue_stats`, or "latest row" tables like `sustainability_metrics`.
 */
export function useRealtimeRow<T>(
  table: string,
  opts?: { match?: [column: string, value: string | boolean]; orderBy?: string }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const matchColumn = opts?.match?.[0];
  const matchValue = opts?.match?.[1];
  const orderBy = opts?.orderBy;

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    let query = supabase.from(table).select("*");
    if (matchColumn !== undefined) query = query.eq(matchColumn, matchValue!);
    if (orderBy) query = query.order(orderBy, { ascending: false });

    query
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        setError(error?.message ?? null);
        setData((data ?? null) as T | null);
        setLoading(false);
      });

    const channel = supabase
      .channel(`realtime:${table}:row`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => {
        setReloadToken((t) => t + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, matchColumn, matchValue, orderBy, reloadToken]);

  return {
    data,
    loading,
    error,
    refetch: () => setReloadToken((t) => t + 1),
    isSupabaseConfigured,
  };
}
