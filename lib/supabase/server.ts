import { createServerClient } from "@supabase/ssr";
import { createClient as createRawClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./types";
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from "./env";

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export { isSupabaseConfigured };

/**
 * Server-side client that reads/writes the user's session via cookies.
 * Use this in Server Components, Route Handlers, and Server Actions.
 * Returns `null` when Supabase isn't configured — callers should fall back
 * to a "not connected" state in that case.
 *
 * Must be awaited: `const supabase = await createClient()`.
 */
export async function createClient() {
  if (!isSupabaseConfigured) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // `set` is called from a Server Component during rendering, where
          // cookies can't be written. This is safe to ignore as long as
          // proxy.ts (see lib/supabase/middleware.ts) refreshes sessions.
        }
      },
    },
  });
}

/**
 * Privileged client using the secret service-role key. Bypasses Row Level
 * Security — only ever use this in server-only code (Route Handlers, Server
 * Actions), never expose it to the browser. Used for trusted operations
 * like provisioning a profile right after signup and account deletion.
 */
export function createServiceRoleClient() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createRawClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
