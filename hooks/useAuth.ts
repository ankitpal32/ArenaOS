"use client";

import { useAuthContext } from "@/contexts/AuthContext";

/**
 * Exposes the current Supabase user, session, and profile (which includes
 * the ArenaOS role) anywhere in the client tree. Falls back to
 * `loading: false, user: null` when Supabase isn't configured, so
 * components can render their existing mock/demo behavior unchanged.
 *
 *   const { user, profile, loading, signOut } = useAuth();
 */
export function useAuth() {
  return useAuthContext();
}
