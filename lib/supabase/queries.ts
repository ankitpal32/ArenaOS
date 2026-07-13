"use client";

import { createClient } from "./client";
import type { IncidentType, IncidentPriority } from "./types";

type Result = { error: string | null };

export async function createIncident(input: {
  type: IncidentType;
  location: string;
  summary?: string;
  priority?: IncidentPriority;
}): Promise<Result> {
  const supabase = createClient();
  if (!supabase) return { error: "Database not connected." };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("incidents").insert({
    type: input.type,
    location: input.location,
    summary: input.summary,
    priority: input.priority ?? "medium",
    reported_by: user?.id ?? null,
  });

  if (!error && user) {
    await logActivity(user.id, "incident_reported", { type: input.type, location: input.location });
  }

  return { error: error?.message ?? null };
}

export async function updateIncidentStatus(
  id: string,
  status: "open" | "in-progress" | "resolved"
): Promise<Result> {
  const supabase = createClient();
  if (!supabase) return { error: "Database not connected." };

  const { error } = await supabase
    .from("incidents")
    .update({
      status,
      resolved_at: status === "resolved" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (!error) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) await logActivity(user.id, "incident_status_updated", { id, status });
  }

  return { error: error?.message ?? null };
}

export async function logActivity(
  userId: string,
  action: string,
  metadata: Record<string, unknown> = {}
): Promise<Result> {
  const supabase = createClient();
  if (!supabase) return { error: null };

  const { error } = await supabase.from("activity_log").insert({
    user_id: userId,
    action,
    metadata,
  });
  return { error: error?.message ?? null };
}

export async function updateProfile(
  userId: string,
  updates: { full_name?: string; avatar_url?: string }
): Promise<Result> {
  const supabase = createClient();
  if (!supabase) return { error: "Database not connected." };

  const { error } = await supabase.from("profiles").update(updates).eq("id", userId);
  if (!error) await logActivity(userId, "profile_updated", updates);
  return { error: error?.message ?? null };
}

/**
 * Uploads an avatar image to the `avatars` storage bucket and returns its
 * public URL. Create a public "avatars" bucket in Supabase Storage before
 * using this (Storage > New bucket > name it "avatars" > Public bucket: on).
 */
export async function uploadAvatar(userId: string, file: File): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient();
  if (!supabase) return { url: null, error: "Database not connected." };

  const ext = file.name.split(".").pop();
  const path = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, cacheControl: "3600" });
  if (uploadError) return { url: null, error: uploadError.message };

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

type PreferencesUpdate = {
  notify_email?: boolean;
  notify_push?: boolean;
  voice_guidance?: boolean;
  live_captions?: boolean;
  language?: string;
  profile_visible?: boolean;
};

export async function updatePreferences(userId: string, updates: PreferencesUpdate): Promise<Result> {
  const supabase = createClient();
  if (!supabase) return { error: "Database not connected." };

  const { error } = await supabase.from("user_preferences").update(updates).eq("user_id", userId);
  if (!error) await logActivity(userId, "preferences_updated", updates);
  return { error: error?.message ?? null };
}

export async function markNotificationRead(id: string): Promise<Result> {
  const supabase = createClient();
  if (!supabase) return { error: "Database not connected." };

  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
  return { error: error?.message ?? null };
}

export async function markAllNotificationsRead(userId: string): Promise<Result> {
  const supabase = createClient();
  if (!supabase) return { error: "Database not connected." };

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
  return { error: error?.message ?? null };
}

/**
 * Permanently deletes the signed-in user's account. Calls a server route
 * (app/api/account/delete/route.ts) since deleting an auth user requires
 * the service-role key, which must never run in the browser.
 */
export async function deleteAccount(): Promise<Result> {
  try {
    const res = await fetch("/api/account/delete", { method: "POST" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: body.error ?? "Failed to delete account." };
    }
    return { error: null };
  } catch {
    return { error: "Failed to delete account." };
  }
}
