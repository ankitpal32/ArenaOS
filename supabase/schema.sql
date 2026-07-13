-- ArenaOS database schema (pure DDL — no RLS/policies here)
--
-- Run this first, then supabase/rls.sql, then optionally supabase/seed.sql.
-- In the Supabase SQL editor: paste and run each file in that order.
-- Via CLI: supabase db push  (if these live in supabase/migrations),
-- or just paste each file into the SQL editor manually for a quick setup.

-- 1. Profiles — extends Supabase auth.users with an ArenaOS role
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'fan'
    check (role in ('fan', 'volunteer', 'staff', 'organizer', 'security', 'medical')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Gates — live crowd/status per gate
create table if not exists public.gates (
  id text primary key,
  name text not null,
  crowd_pct int not null default 0,
  wait_minutes int not null default 0,
  status text not null default 'clear'
    check (status in ('clear', 'moderate', 'congested')),
  updated_at timestamptz not null default now()
);

-- 3. Incidents — reported by volunteers/staff, tracked by organizers
create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  type text not null
    check (type in ('lost-child', 'medical', 'fire', 'security')),
  location text not null,
  summary text,
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  status text not null default 'open'
    check (status in ('open', 'in-progress', 'resolved')),
  reported_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- 4. Routes — precomputed navigation options between common destinations
create table if not exists public.routes (
  id text primary key,
  label text not null,
  description text,
  eta_minutes int not null,
  crowd_level text not null default 'low'
    check (crowd_level in ('low', 'medium', 'high')),
  accessible boolean not null default false
);

-- 5. Sustainability metrics — one row per event/day
create table if not exists public.sustainability_metrics (
  id uuid primary key default gen_random_uuid(),
  event_date date not null default current_date,
  water_litres int not null default 0,
  water_target_litres int not null default 0,
  energy_kwh int not null default 0,
  energy_target_kwh int not null default 0,
  waste_pct_diverted int not null default 0
);

-- 6. Venue stats — one singleton row of live organizer-facing metrics
create table if not exists public.venue_stats (
  id boolean primary key default true check (id),
  attendance_current int not null default 0,
  attendance_capacity int not null default 0,
  parking_full_pct int not null default 0,
  transport_on_time_pct int not null default 0,
  incidents_resolved int not null default 0,
  volunteers_active int not null default 0,
  updated_at timestamptz not null default now()
);

-- 7. Crowd trend — time-series points for the venue-wide density chart
create table if not exists public.crowd_trend_points (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  pct int not null,
  recorded_at timestamptz not null default now()
);

-- 8. Notifications — per-user notification feed
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- 9. User preferences — one row per user
create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  voice_guidance boolean not null default true,
  live_captions boolean not null default false,
  notify_email boolean not null default true,
  notify_push boolean not null default true,
  updated_at timestamptz not null default now()
);

-- 10. Activity log — audit trail of important user actions
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Extend the signup trigger to also provision preferences + first activity
-- log entry, in addition to the profile row it already creates.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');

  insert into public.user_preferences (user_id)
  values (new.id);

  insert into public.activity_log (user_id, action, metadata)
  values (new.id, 'signup', jsonb_build_object('email', new.email));

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- 11. Parking lots — live capacity per lot
create table if not exists public.parking_lots (
  id text primary key,
  name text not null,
  pct int not null default 0,
  status text not null default 'Open',
  accessible boolean not null default false
);

-- 12. Shuttles — live departures
create table if not exists public.shuttles (
  id text primary key,
  route text not null,
  eta_minutes int not null,
  crowd_level text not null default 'low'
    check (crowd_level in ('low', 'medium', 'high'))
);

-- 13. Schema extensions for settings/profile/theme/tickets
alter table public.profiles add column if not exists avatar_url text;
alter table public.user_preferences add column if not exists theme text not null default 'dark' check (theme in ('light', 'dark'));
alter table public.user_preferences add column if not exists language text not null default 'en';
alter table public.user_preferences add column if not exists profile_visible boolean not null default true;

-- 14. Tickets — minimal real table backing "My Tickets" in the user menu.
-- The full booking/payment/QR flow is a separate build; this table lets
-- "My Tickets" show real (currently empty, until booking exists) data
-- instead of a fake placeholder screen.
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_name text not null,
  seat text,
  status text not null default 'active' check (status in ('active', 'used', 'cancelled')),
  qr_code text,
  created_at timestamptz not null default now()
);

-- 15. Admin role + production-integration additions
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('fan', 'volunteer', 'staff', 'organizer', 'security', 'medical', 'admin'));

-- 16. Matches — match/event overview shown to organizer + fan
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  home_team text not null,
  away_team text not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'halftime', 'finished')),
  starts_at timestamptz not null,
  score_home int not null default 0,
  score_away int not null default 0,
  venue_section text
);

-- 17. Weather snapshots — latest conditions
create table if not exists public.weather_snapshots (
  id uuid primary key default gen_random_uuid(),
  condition text not null,
  temp_c numeric not null,
  wind_kph numeric not null default 0,
  precipitation_pct int not null default 0,
  recorded_at timestamptz not null default now()
);

-- 18. Volunteer/staff task assignments
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  assignee_id uuid references public.profiles (id) on delete cascade,
  role_target text not null check (role_target in ('volunteer', 'staff')),
  task text not null,
  location text,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'pending' check (status in ('pending', 'in-progress', 'done')),
  created_at timestamptz not null default now()
);

-- Helper for admin-elevated RLS policies
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;
