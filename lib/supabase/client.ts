"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from "./env";

export { isSupabaseConfigured };

const REMEMBER_ME_KEY = "arenaos-remember-me";

/**
 * Sets the "Remember me" preference, read by the custom storage adapter
 * below. Must be called *before* signIn() for it to take effect on that
 * session — see lib/supabase/auth.ts.
 */
export function setRememberMe(remember: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REMEMBER_ME_KEY, String(remember));
}

/**
 * Custom storage adapter that decides, on every read/write, whether the
 * Supabase session token lives in localStorage (persists across browser
 * restarts — "remember me" checked) or sessionStorage (cleared when the
 * tab/browser closes — unchecked). The remember-me flag itself always
 * lives in localStorage since it's just a tiny preference, not a secret.
 */
const rememberAwareStorage = {
  getItem(key: string) {
    if (typeof window === "undefined") return null;
    const remember = window.localStorage.getItem(REMEMBER_ME_KEY) !== "false";
    return (remember ? window.localStorage : window.sessionStorage).getItem(key);
  },
  setItem(key: string, value: string) {
    if (typeof window === "undefined") return;
    const remember = window.localStorage.getItem(REMEMBER_ME_KEY) !== "false";
    (remember ? window.localStorage : window.sessionStorage).setItem(key, value);
  },
  removeItem(key: string) {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
};

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Returns a singleton Supabase client for use in client components.
 * Returns `null` when the project hasn't been configured with real
 * credentials — every call site should fall back to a "not connected"
 * state in that case.
 */
export function createClient() {
  if (!isSupabaseConfigured) return null;
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: { storage: rememberAwareStorage },
    });
  }
  return browserClient;
}
