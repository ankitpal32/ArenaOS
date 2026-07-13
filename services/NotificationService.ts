import { createClient } from "@/lib/supabase/client";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/supabase/queries";
import type { Notification } from "@/lib/supabase/types";

export const NotificationService = {
  async getForUser(userId: string): Promise<Notification[]> {
    const supabase = createClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return data ?? [];
  },

  async send(userId: string, type: string, title: string, body?: string) {
    const supabase = createClient();
    if (!supabase) return { error: "Database not connected." };
    const { error } = await supabase.from("notifications").insert({ user_id: userId, type, title, body });
    return { error: error?.message ?? null };
  },

  markRead: markNotificationRead,
  markAllRead: markAllNotificationsRead,
};
