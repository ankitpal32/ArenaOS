import { createClient } from "@/lib/supabase/client";
import type { Match } from "@/lib/supabase/types";

export const MatchService = {
  async getCurrent(): Promise<Match | null> {
    const supabase = createClient();
    if (!supabase) return null;
    const { data } = await supabase
      .from("matches")
      .select("*")
      .in("status", ["live", "halftime"])
      .order("starts_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data ?? null;
  },

  async getAll(): Promise<Match[]> {
    const supabase = createClient();
    if (!supabase) return [];
    const { data } = await supabase.from("matches").select("*").order("starts_at", { ascending: false });
    return data ?? [];
  },

  async updateScore(id: string, scoreHome: number, scoreAway: number) {
    const supabase = createClient();
    if (!supabase) return { error: "Database not connected." };
    const { error } = await supabase.from("matches").update({ score_home: scoreHome, score_away: scoreAway }).eq("id", id);
    return { error: error?.message ?? null };
  },
};
