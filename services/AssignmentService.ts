import { createClient } from "@/lib/supabase/client";
import type { Assignment } from "@/lib/supabase/types";

export const AssignmentService = {
  async getForUser(userId: string): Promise<Assignment[]> {
    const supabase = createClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from("assignments")
      .select("*")
      .eq("assignee_id", userId)
      .order("created_at", { ascending: false });
    return data ?? [];
  },

  async setStatus(id: string, status: "pending" | "in-progress" | "done") {
    const supabase = createClient();
    if (!supabase) return { error: "Database not connected." };
    const { error } = await supabase.from("assignments").update({ status }).eq("id", id);
    return { error: error?.message ?? null };
  },

  async create(input: {
    assigneeId?: string;
    roleTarget: "volunteer" | "staff";
    task: string;
    location?: string;
    priority?: "low" | "medium" | "high";
  }) {
    const supabase = createClient();
    if (!supabase) return { error: "Database not connected." };
    const { error } = await supabase.from("assignments").insert({
      assignee_id: input.assigneeId,
      role_target: input.roleTarget,
      task: input.task,
      location: input.location,
      priority: input.priority ?? "medium",
    });
    return { error: error?.message ?? null };
  },
};
