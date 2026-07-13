-- ArenaOS — fix for "Could not find table 'public.<table>' in the schema
-- cache" errors when the tables genuinely exist in Postgres.
--
-- This happens when PostgREST (Supabase's auto-generated API layer) hasn't
-- picked up tables created earlier in the same session, OR when the tables
-- were created without the standard grants PostgREST's `anon`/
-- `authenticated` roles need to even see them in the API.
--
-- Safe to re-run any time. Run this in the Supabase SQL editor.

-- 1. Force PostgREST to reload its schema cache immediately.
notify pgrst, 'reload schema';

-- 2. Defensive grants — normally applied automatically when tables are
-- created via the SQL editor as the `postgres` role, but re-asserting them
-- costs nothing and rules out a missing-grant cause entirely. RLS policies
-- (supabase/rls.sql) still control which *rows* are visible; this only
-- controls whether the table is reachable at all.
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on
  public.profiles,
  public.venue_stats,
  public.gates,
  public.incidents,
  public.matches,
  public.tickets,
  public.notifications,
  public.routes,
  public.shuttles,
  public.parking_lots,
  public.sustainability_metrics,
  public.crowd_trend_points,
  public.activity_log,
  public.assignments,
  public.weather_snapshots,
  public.user_preferences
to anon, authenticated;

-- 3. Make sure future tables get the same grants automatically, so this
-- class of issue can't recur after the next migration.
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;

-- 4. Reload again after granting, just in case grants themselves triggered
-- a cache-relevant change.
notify pgrst, 'reload schema';
