import { createClient } from "@/lib/supabase/client";
import type { ParkingLot, Shuttle } from "@/lib/supabase/types";

export const ParkingService = {
  async getLots(): Promise<ParkingLot[]> {
    const supabase = createClient();
    if (!supabase) return [];
    const { data } = await supabase.from("parking_lots").select("*").order("name");
    return data ?? [];
  },

  async getShuttles(): Promise<Shuttle[]> {
    const supabase = createClient();
    if (!supabase) return [];
    const { data } = await supabase.from("shuttles").select("*").order("eta_minutes");
    return data ?? [];
  },

  async setLotPct(id: string, pct: number) {
    const supabase = createClient();
    if (!supabase) return { error: "Database not connected." };
    const status = pct >= 90 ? "Nearly full" : pct >= 70 ? "Filling up" : "Open";
    const { error } = await supabase.from("parking_lots").update({ pct, status }).eq("id", id);
    return { error: error?.message ?? null };
  },
};

// TransportService — separate export so callers reflect the domain name
// used in the rest of the app (transport = parking + shuttles + exits).
export const TransportService = ParkingService;
