import { createClient } from "@/lib/supabase/client";
import { createIncident, updateIncidentStatus } from "@/lib/supabase/queries";
import type { Incident } from "@/lib/supabase/types";

export const IncidentService = {
  async getAll(): Promise<Incident[]> {
    const supabase = createClient();
    if (!supabase) return [];
    const { data } = await supabase.from("incidents").select("*").order("created_at", { ascending: false });
    return data ?? [];
  },

  async getOpen(): Promise<Incident[]> {
    const all = await this.getAll();
    return all.filter((i) => i.status !== "resolved");
  },

  // Re-exported rather than reimplemented — see lib/supabase/queries.ts.
  create: createIncident,
  updateStatus: updateIncidentStatus,
};
