import { createClient } from "@/lib/supabase/client";
import { updateProfile, uploadAvatar } from "@/lib/supabase/queries";
import type { Profile } from "@/lib/supabase/types";

export const ProfileService = {
  async getById(id: string): Promise<Profile | null> {
    const supabase = createClient();
    if (!supabase) return null;
    const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
    return data ?? null;
  },

  // Admin-only in practice: RLS only allows this to return rows when the
  // caller's own profile has role = 'admin' (see supabase/rls.sql).
  async getAll(): Promise<Profile[]> {
    const supabase = createClient();
    if (!supabase) return [];
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    return data ?? [];
  },

  update: updateProfile,
  uploadAvatar,
};
