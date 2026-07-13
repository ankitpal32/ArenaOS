import { createClient } from "@/lib/supabase/client";
import type { Ticket } from "@/lib/supabase/types";

export const TicketService = {
  async getForUser(userId: string): Promise<Ticket[]> {
    const supabase = createClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from("tickets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return data ?? [];
  },

  async getActiveForUser(userId: string): Promise<Ticket | null> {
    const tickets = await this.getForUser(userId);
    return tickets.find((t) => t.status === "active") ?? null;
  },
};
