import { createClient } from "@/lib/supabase/client";
import type { WeatherSnapshot } from "@/lib/supabase/types";

export const WeatherService = {
  async getLatest(): Promise<WeatherSnapshot | null> {
    const supabase = createClient();
    if (!supabase) return null;
    const { data } = await supabase
      .from("weather_snapshots")
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data ?? null;
  },

  async record(condition: string, tempC: number, windKph: number, precipitationPct: number) {
    const supabase = createClient();
    if (!supabase) return { error: "Database not connected." };
    const { error } = await supabase
      .from("weather_snapshots")
      .insert({ condition, temp_c: tempC, wind_kph: windKph, precipitation_pct: precipitationPct });
    return { error: error?.message ?? null };
  },
};
