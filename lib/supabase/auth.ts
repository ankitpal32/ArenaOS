"use client";

import { createClient, isSupabaseConfigured, setRememberMe } from "./client";
import { logActivity } from "./queries";
import type { Role } from "@/types";

type AuthResult = { error: string | null };

const NOT_CONFIGURED_ERROR =
  "Database not connected. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in .env.local.";

export async function signIn(
  email: string,
  password: string,
  rememberMe = true
): Promise<AuthResult> {
  // Must be set before signInWithPassword() writes the session token, since
  // the custom storage adapter reads this flag on every write.
  setRememberMe(rememberMe);

  const supabase = createClient();
  if (!supabase) return { error: NOT_CONFIGURED_ERROR };

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (!error && data.user) {
    await logActivity(data.user.id, "login", {});
  }
  return { error: error?.message ?? null };
}

export async function signUp(
  email: string,
  password: string,
  fullName: string
): Promise<AuthResult & { needsEmailConfirmation: boolean }> {
  const supabase = createClient();
  if (!supabase) return { error: NOT_CONFIGURED_ERROR, needsEmailConfirmation: false };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
    },
  });
  // If email confirmation is required, Supabase returns a user but no
  // session yet. If it's disabled on the project, a session comes back
  // immediately and the caller can skip the "check your inbox" step.
  return {
    error: error?.message ?? null,
    needsEmailConfirmation: !error && !data.session,
  };
}

export async function signOut(): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) return { error: NOT_CONFIGURED_ERROR };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await logActivity(user.id, "logout", {});

  const { error } = await supabase.auth.signOut();
  return { error: error?.message ?? null };
}

/**
 * Ends every session for this user across all devices/browsers, not just
 * the current one (Supabase's "global" sign-out scope).
 */
export async function signOutAllDevices(): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) return { error: NOT_CONFIGURED_ERROR };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await logActivity(user.id, "logout_all_devices", {});

  const { error } = await supabase.auth.signOut({ scope: "global" });
  return { error: error?.message ?? null };
}

export async function sendPasswordReset(email: string): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) return { error: NOT_CONFIGURED_ERROR };

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
  });
  return { error: error?.message ?? null };
}

export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) return { error: NOT_CONFIGURED_ERROR };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error: error?.message ?? null };
}

/**
 * Starts Supabase's email-change flow: sends a confirmation link to the new
 * address before the change takes effect.
 */
export async function updateEmail(newEmail: string): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) return { error: NOT_CONFIGURED_ERROR };

  const { error } = await supabase.auth.updateUser({ email: newEmail });
  return { error: error?.message ?? null };
}

/**
 * Persists the chosen role to the signed-in user's profile row. Called from
 * /role-select after the user picks a role.
 */
export async function updateUserRole(role: Role): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) return { error: NOT_CONFIGURED_ERROR };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase.from("profiles").update({ role }).eq("id", user.id);
  if (!error) await logActivity(user.id, "role_selected", { role });
  return { error: error?.message ?? null };
}

export { isSupabaseConfigured };
