/**
 * Single source of truth for reading + validating the Supabase env vars,
 * shared by client.ts, server.ts, and middleware.ts so all three agree on
 * exactly the same rules.
 *
 * Why this exists: NEXT_PUBLIC_SUPABASE_URL being *set but wrong* (typo,
 * stale/deleted project, a localhost value left over from local dev, etc.)
 * previously wasn't caught anywhere — the browser would just try to fetch
 * it and fail with a raw `ERR_NAME_NOT_RESOLVED` / `Failed to fetch`, which
 * gives no hint about what's actually wrong. Validating the URL shape here
 * means a bad value now cleanly falls back to this app's existing "Database
 * not connected" UI instead of crashing with a browser network error, and
 * logs exactly what's wrong with it.
 */

function isValidHttpUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Supabase's newer projects issue a "publishable" key instead of the
// legacy "anon" key. Prefer the new name, fall back to the old one so
// existing setups keep working unchanged.
const rawAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const urlIsValid = isValidHttpUrl(rawUrl);

if (rawUrl && !urlIsValid) {
  // Set but malformed — this is almost always the cause of
  // ERR_NAME_NOT_RESOLVED / "Failed to fetch" errors in the browser.
  console.error(
    `[supabase] NEXT_PUBLIC_SUPABASE_URL is set but is not a valid URL: "${rawUrl}". ` +
      `It must look like https://<project-ref>.supabase.co with no quotes or trailing whitespace.`
  );
}

export const supabaseUrl = urlIsValid ? rawUrl : undefined;
export const supabaseAnonKey = rawAnonKey || undefined;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
