import { createClient } from "@/lib/supabase/client";
import type { Gate, CrowdTrendPoint } from "@/lib/supabase/types";

/**
 * Data-access layer for crowd/gate state. Realtime binding lives in
 * hooks/useSupabaseData.ts (useRealtimeList/useRealtimeRow) — this module
 * is the plain-function layer other services and one-off scripts (like the
 * simulation engine) call directly, so business logic lives in one place.
 */
export const CrowdService = {
  async getGates(): Promise<Gate[]> {
    const supabase = createClient();
    if (!supabase) return [];
    const { data } = await supabase.from("gates").select("*").order("name");
    return data ?? [];
  },

  async getTrend(): Promise<CrowdTrendPoint[]> {
    const supabase = createClient();
    if (!supabase) return [];
    const { data } = await supabase.from("crowd_trend_points").select("*").order("recorded_at");
    return data ?? [];
  },

  async setGateCrowd(id: string, crowdPct: number, waitMinutes: number) {
    const supabase = createClient();
    if (!supabase) return { error: "Database not connected." };
    const status = crowdPct >= 85 ? "congested" : crowdPct >= 55 ? "moderate" : "clear";
    const { error } = await supabase
      .from("gates")
      .update({ crowd_pct: crowdPct, wait_minutes: waitMinutes, status, updated_at: new Date().toISOString() })
      .eq("id", id);
    return { error: error?.message ?? null };
  },

  async addTrendPoint(label: string, pct: number) {
    const supabase = createClient();
    if (!supabase) return { error: "Database not connected." };
    const { error } = await supabase.from("crowd_trend_points").insert({ label, pct });
    return { error: error?.message ?? null };
  },
};
