-- ArenaOS seed data
-- Run after supabase/schema.sql and supabase/rls.sql. Mirrors the values in
-- data/mockData.ts so the app looks identical whether it's reading mock
-- data or real Supabase rows.
--
-- Safe to re-run: each insert upserts on primary key.

insert into public.gates (id, name, crowd_pct, wait_minutes, status) values
  ('g1', 'Gate 4 — North', 38, 3, 'clear'),
  ('g2', 'Gate 9 — East', 71, 9, 'moderate'),
  ('g3', 'Gate 14 — South', 92, 17, 'congested'),
  ('g4', 'Gate 21 — West', 54, 6, 'moderate'),
  ('g5', 'Gate 2 — Concourse A', 22, 2, 'clear'),
  ('g6', 'Gate 18 — Concourse C', 85, 14, 'congested')
on conflict (id) do update set
  name = excluded.name,
  crowd_pct = excluded.crowd_pct,
  wait_minutes = excluded.wait_minutes,
  status = excluded.status,
  updated_at = now();

insert into public.routes (id, label, description, eta_minutes, crowd_level, accessible) values
  ('r1', 'Fastest route', 'Via Concourse A and the north stairwell.', 4, 'medium', false),
  ('r2', 'Least crowded', 'Via the west ramp, avoiding Gate 14 backlog.', 7, 'low', true),
  ('r3', 'Accessible route', 'Elevator access via Concourse B, step-free throughout.', 9, 'low', true)
on conflict (id) do update set
  label = excluded.label,
  description = excluded.description,
  eta_minutes = excluded.eta_minutes,
  crowd_level = excluded.crowd_level,
  accessible = excluded.accessible;

insert into public.sustainability_metrics
  (event_date, water_litres, water_target_litres, energy_kwh, energy_target_kwh, waste_pct_diverted)
values
  (current_date, 128400, 150000, 38200, 45000, 61)
on conflict do nothing;

-- Incidents reference `reported_by`, which needs a real auth.users id, so
-- they're seeded without one here (organizer/staff/security/medical demo
-- accounts can create realistic ones through the Emergency Response module
-- once you've signed up at least one account).
insert into public.incidents (id, type, location, summary, priority, status, created_at) values
  (gen_random_uuid(), 'medical', 'Section 114, Row J', 'Attendee reported dizziness, medic dispatched.', 'high', 'in-progress', now() - interval '18 minutes'),
  (gen_random_uuid(), 'lost-child', 'Gate 9 concourse', 'Child separated from guardian, description logged.', 'high', 'open', now() - interval '25 minutes'),
  (gen_random_uuid(), 'security', 'Parking Lot C', 'Altercation de-escalated, no further action needed.', 'low', 'resolved', now() - interval '40 minutes')
on conflict (id) do nothing;

insert into public.venue_stats
  (id, attendance_current, attendance_capacity, parking_full_pct, transport_on_time_pct, incidents_resolved, volunteers_active)
values
  (true, 41280, 48000, 78, 94, 11, 64)
on conflict (id) do update set
  attendance_current = excluded.attendance_current,
  attendance_capacity = excluded.attendance_capacity,
  parking_full_pct = excluded.parking_full_pct,
  transport_on_time_pct = excluded.transport_on_time_pct,
  incidents_resolved = excluded.incidents_resolved,
  volunteers_active = excluded.volunteers_active,
  updated_at = now();

insert into public.crowd_trend_points (label, pct, recorded_at) values
  ('17:00', 20, now() - interval '3 hours 30 minutes'),
  ('18:00', 45, now() - interval '2 hours 30 minutes'),
  ('19:00', 68, now() - interval '1 hour 30 minutes'),
  ('19:30', 79, now() - interval '1 hour'),
  ('20:00', 86, now() - interval '30 minutes'),
  ('20:30', 74, now());

insert into public.parking_lots (id, name, pct, status, accessible) values
  ('p1', 'Lot A', 92, 'Nearly full', false),
  ('p2', 'Lot B', 54, 'Open', false),
  ('p3', 'Lot C', 78, 'Filling up', false),
  ('p4', 'Lot D — Accessible', 31, 'Open', true)
on conflict (id) do update set
  name = excluded.name, pct = excluded.pct, status = excluded.status, accessible = excluded.accessible;

insert into public.shuttles (id, route, eta_minutes, crowd_level) values
  ('s1', 'Downtown Express', 4, 'medium'),
  ('s2', 'North Park & Ride', 11, 'low'),
  ('s3', 'Metro Connector', 2, 'high')
on conflict (id) do update set
  route = excluded.route, eta_minutes = excluded.eta_minutes, crowd_level = excluded.crowd_level;

insert into public.matches (home_team, away_team, status, starts_at, score_home, score_away, venue_section) values
  ('Falcons', 'Ravens', 'live', now() - interval '35 minutes', 2, 1, 'Main Pitch')
on conflict do nothing;

insert into public.weather_snapshots (condition, temp_c, wind_kph, precipitation_pct) values
  ('Partly cloudy', 19, 14, 10)
on conflict do nothing;
