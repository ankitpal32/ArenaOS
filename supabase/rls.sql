-- ArenaOS Row Level Security policies
-- Run this after supabase/schema.sql.

-- Helper: look up the current user's role without recursive RLS checks.
create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- 1. Profiles ----------------------------------------------------------
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Organizers can view all profiles"
  on public.profiles for select
  using (public.current_user_role() = 'organizer');

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 2. Gates ---------------------------------------------------------------
-- Read-only for every signed-in user; only trusted server code (using the
-- service-role key) should write gate updates from sensor feeds.
alter table public.gates enable row level security;

create policy "Signed-in users can read gates"
  on public.gates for select
  using (auth.role() = 'authenticated');

-- 3. Incidents -------------------------------------------------------------
alter table public.incidents enable row level security;

create policy "Signed-in users can read incidents"
  on public.incidents for select
  using (auth.role() = 'authenticated');

create policy "Signed-in users can report incidents"
  on public.incidents for insert
  with check (auth.role() = 'authenticated');

create policy "Responders and organizers can update incidents"
  on public.incidents for update
  using (
    public.current_user_role() in ('volunteer', 'staff', 'security', 'medical', 'organizer')
  );

-- 4. Routes ------------------------------------------------------------------
alter table public.routes enable row level security;

create policy "Signed-in users can read routes"
  on public.routes for select
  using (auth.role() = 'authenticated');

-- 5. Sustainability metrics ----------------------------------------------
alter table public.sustainability_metrics enable row level security;

create policy "Staff and organizers can read sustainability metrics"
  on public.sustainability_metrics for select
  using (public.current_user_role() in ('staff', 'organizer'));

-- 6. Venue stats ---------------------------------------------------------
alter table public.venue_stats enable row level security;

create policy "Signed-in users can read venue stats"
  on public.venue_stats for select
  using (auth.role() = 'authenticated');

-- 7. Crowd trend points ---------------------------------------------------
alter table public.crowd_trend_points enable row level security;

create policy "Signed-in users can read crowd trend"
  on public.crowd_trend_points for select
  using (auth.role() = 'authenticated');

-- 8. Notifications ---------------------------------------------------------
alter table public.notifications enable row level security;

create policy "Users can read their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- 9. User preferences -------------------------------------------------------
alter table public.user_preferences enable row level security;

create policy "Users can read their own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can update their own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);

create policy "Users can insert their own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

-- 10. Activity log ------------------------------------------------------
alter table public.activity_log enable row level security;

create policy "Users can read their own activity"
  on public.activity_log for select
  using (auth.uid() = user_id);

create policy "Organizers can read all activity"
  on public.activity_log for select
  using (public.current_user_role() = 'organizer');

create policy "Signed-in users can log their own activity"
  on public.activity_log for insert
  with check (auth.uid() = user_id);

-- 11. Parking lots ---------------------------------------------------------
alter table public.parking_lots enable row level security;

create policy "Signed-in users can read parking lots"
  on public.parking_lots for select
  using (auth.role() = 'authenticated');

-- 12. Shuttles -----------------------------------------------------------
alter table public.shuttles enable row level security;

create policy "Signed-in users can read shuttles"
  on public.shuttles for select
  using (auth.role() = 'authenticated');

-- 13. Tickets ---------------------------------------------------------------
alter table public.tickets enable row level security;

create policy "Users can read their own tickets"
  on public.tickets for select
  using (auth.uid() = user_id);

create policy "Organizers can read all tickets"
  on public.tickets for select
  using (public.current_user_role() = 'organizer');

-- 14. Matches / weather — public read for signed-in users -------------------
alter table public.matches enable row level security;
create policy "Signed-in users can read matches" on public.matches for select using (auth.role() = 'authenticated');

alter table public.weather_snapshots enable row level security;
create policy "Signed-in users can read weather" on public.weather_snapshots for select using (auth.role() = 'authenticated');

-- 15. Assignments ------------------------------------------------------------
alter table public.assignments enable row level security;
create policy "Assignees can read their own assignments" on public.assignments for select using (auth.uid() = assignee_id);
create policy "Assignees can update their own assignments" on public.assignments for update using (auth.uid() = assignee_id);
create policy "Organizers can manage all assignments" on public.assignments for all using (public.current_user_role() = 'organizer');

-- 16. Admin — full read access across every table ---------------------------
create policy "Admins can read all profiles" on public.profiles for select using (public.is_admin());
create policy "Admins can read all incidents" on public.incidents for select using (public.is_admin());
create policy "Admins can read all tickets" on public.tickets for select using (public.is_admin());
create policy "Admins can read all notifications" on public.notifications for select using (public.is_admin());
create policy "Admins can read all activity" on public.activity_log for select using (public.is_admin());
create policy "Admins can read all assignments" on public.assignments for select using (public.is_admin());

-- 17. Simulation engine write access — organizer/admin only ----------------
create policy "Organizers can update gates" on public.gates for update using (public.current_user_role() in ('organizer', 'admin'));
create policy "Organizers can update parking lots" on public.parking_lots for update using (public.current_user_role() in ('organizer', 'admin'));
create policy "Organizers can update shuttles" on public.shuttles for update using (public.current_user_role() in ('organizer', 'admin'));
create policy "Organizers can insert crowd trend points" on public.crowd_trend_points for insert with check (public.current_user_role() in ('organizer', 'admin'));
create policy "Organizers can insert weather snapshots" on public.weather_snapshots for insert with check (public.current_user_role() in ('organizer', 'admin'));
