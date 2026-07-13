# ArenaOS

**One control layer for game day.** ArenaOS is a stadium operating system — a real-time platform where navigation, crowd intelligence, incident response, and organizer operations all read from the same live database, so a gate closure or a medical call updates fans, staff, and organizers at the same moment.

Built with **Next.js 16 (App Router) + TypeScript + Tailwind CSS + Supabase**.

---

## Table of contents

- [What this actually is](#what-this-actually-is)
- [Roles](#roles)
- [Features](#features)
- [What's real vs. what's not built yet](#whats-real-vs-whats-not-built-yet)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [How to run it](#how-to-run-it)
- [How to check it out / vibe with it](#how-to-check-it-out--vibe-with-it)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)

---

## What this actually is

ArenaOS started as a UI prototype and has been progressively turned into a genuine full-stack app: **every dashboard reads live from Supabase with realtime subscriptions** — there is no mock data left in the business logic. Loading, empty, error, and "database not connected" states exist everywhere instead of placeholder content.

It's designed around one idea: a stadium has many people doing different jobs (fans, volunteers, staff, organizers, security, medics) who all need *different views of the same reality*. So the whole app is one Supabase schema, with six-to-seven role-specific dashboards layered on top of it.

## Roles

| Role | What they see |
|---|---|
| **Fan** | Live venue snapshot, recommended gate, match + weather, AI assistant, navigation, transport, accessibility |
| **Volunteer** | Assigned tasks, emergency workflows, crowd intelligence |
| **Staff** | Assigned tasks, crowd intelligence, transport, sustainability |
| **Organizer** | Full control center — attendance, incidents, parking, transport, volunteers, AI recommendations, simulation engine, match + weather |
| **Security** | Crowd intelligence, emergency response |
| **Medical** | Emergency response |
| **Admin** | Everything, for every user — plus a **"Preview as"** switcher in the sidebar that lets an admin see any other role's dashboard instantly, without logging out |

Role is chosen at signup (`/role-select`) and stored on the user's Supabase profile — it's not a UI toggle, it's a real column that drives real Row Level Security policies.

## Features

**Landing & auth**
- Marketing landing page with animated hero, feature grid, role strip
- Login / signup with live email validation, show/hide password, a real password-strength meter, confirm-password matching, and a working "Remember me" (switches between localStorage and sessionStorage)
- Forgot password → reset password, full Supabase Auth flow including email confirmation detection
- Branded HTML email templates (`supabase/email-templates/`) for signup confirmation, password reset, email change, magic link, and welcome email

**Core modules** (all Supabase-backed, all realtime)
- Live gate status & crowd intelligence, with a density trend chart
- Navigation with route options (fastest / least-crowded / accessible)
- Emergency Response — report and resolve real incidents by type (lost child, medical, fire, security), with an AI-guided step-by-step workflow per type
- Organizer Control Center — attendance, parking, transport, incidents table, AI-generated recommendations computed from live data
- Transport (parking lots + shuttles), Sustainability tracker, Accessibility assistant (persisted per-user preferences)
- Match overview + weather widgets on the Organizer and Fan dashboards

**AI Assistant**
- Real Anthropic API integration (`app/api/assistant/route.ts`), not a chatbot demo — falls back to a clear "not configured" message rather than fake scripted replies if no API key is set
- Context-aware per role: the system prompt is built server-side from the signed-in user's actual role, active ticket, the live match, current weather, and live gate/route data

**Admin**
- Full-visibility overview: every user, every incident, every ticket, every match, every parking zone, every assignment, recent AI/activity history
- "Preview as" role switcher — real admins can see any dashboard exactly as that role would, without a second login

**Simulation engine**
- Organizer/admin-only toggle that ticks every few seconds (configurable), nudging gate crowd levels, parking, shuttle ETAs, weather, and the crowd trend chart with realistic random deltas
- Writes go through Supabase, so **every other open dashboard updates instantly via Realtime** — this is the easiest way to see the "connected platform" behavior live

**Account & settings**
- Profile page (avatar, bio info, recent activity, booked tickets)
- Settings: edit profile + real avatar upload (Supabase Storage), change password, change email (real confirmation flow), notification/theme/language/privacy preferences, connected accounts (marked "coming soon" — not faked), logout-all-devices, delete-account (real, server-side, cascades through the schema)
- Notification bell + full notifications page, realtime, mark-read/mark-all-read
- Light/dark theme, zero-flicker, persisted to Supabase per-user

**Architecture**
- `services/` — one file per domain (Crowd, Parking/Transport, Incident, Ticket, Profile, Notification, Match, Weather, Assignment, AI, Simulation), all thin wrappers so business logic lives in exactly one place
- `hooks/useSupabaseData.ts` — two generic hooks (`useRealtimeList`, `useRealtimeRow`) power realtime reads across the entire app
- `contexts/` — Auth, Theme, Admin-preview, each with a single shared subscription
- Every data-bearing component has loading / empty / error / "not connected" states (`components/dashboard/DataState.tsx`)

## What's real vs. what's not built yet

This project has been deliberately honest about scope rather than faking things. Explicitly **not** built (and not pretended to be):

- Ticket **booking** flow (seat selection → payment → QR generation). The `tickets` table and "My Tickets" page are real and wired up, but nothing writes a row yet — it's an honest empty state until a booking flow exists.
- Payments (Stripe/Razorpay/Cashfree) — no fake payment UI exists.
- Tournament/venue/match *creation* tooling for organizers (matches currently come from the database directly, not an organizer-facing form).
- Interface translation — the language preference is saved but nothing is actually translated yet (the Settings page says so explicitly).
- Connected accounts (Google/Apple) — shown as "coming soon", not implemented as fake buttons.

If you want any of these, they're the logical next slice — ask and they'll be built the same way as everything else: real schema, real RLS, real pages.

## Architecture

```
Next.js App Router (Next 16 — middleware.ts is proxy.ts, see proxy.ts)
        │
        ├─ Client components ── hooks/useSupabaseData.ts ── Supabase Realtime
        │                       (useRealtimeList / useRealtimeRow)
        │
        ├─ services/ ─────────── one module per domain, calls lib/supabase/client.ts
        │
        ├─ Server routes ─────── lib/supabase/server.ts (cookie-based session)
        │   /api/assistant           lib/supabase/queries.ts (writes)
        │   /api/simulate
        │   /api/account/delete ──── uses SUPABASE_SERVICE_ROLE_KEY (server-only)
        │
        └─ Supabase Postgres ─── schema.sql → rls.sql → storage.sql → seed.sql
```

Auth uses `@supabase/ssr` with a custom storage adapter (for the real "Remember me" behavior) and a root `proxy.ts` that refreshes the session and redirects unauthenticated visitors away from `/dashboard/*`.

## Project structure

```
app/
  page.tsx                  Landing page
  login/ signup/ forgot-password/ reset-password/ role-select/
  help/ about/
  dashboard/
    page.tsx                Overview (role-aware)
    fan/ organizer/ admin/ crowd/ navigation/ emergency/
    accessibility/ transport/ sustainability/ assistant/
    profile/ settings/ tickets/ notifications/
  api/
    assistant/route.ts       AI, context-aware, real Anthropic call
    simulate/route.ts        Simulation engine tick
    account/delete/route.ts  Real account deletion (service-role)
  auth/callback/route.ts     Exchanges Supabase email-link codes for a session
  layout.tsx                 Providers + no-flicker theme script
  proxy.ts (repo root)       Session refresh + route protection

components/
  landing/ layout/ dashboard/ assistant/ ui/

services/                    Domain data-access layer (see Features)
hooks/                       useAuth, useSupabaseData
contexts/                    AuthContext, ThemeContext, AdminPreviewContext
lib/supabase/                client.ts server.ts middleware.ts auth.ts queries.ts types.ts
data/mockData.ts             UI-only config (role labels/icons, AI suggested questions) — NOT business data
types/                       Shared app types

supabase/
  schema.sql                 Tables + triggers (run 1st)
  rls.sql                    Row Level Security policies (run 2nd)
  storage.sql                Avatars bucket + policies (run 3rd)
  seed.sql                   Demo data (run 4th, optional)
  email-templates/           Branded HTML for Supabase Auth emails
```

## How to run it

```bash
npm install
cp .env.local.example .env.local   # fill in as described below
npm run dev
```

Open `http://localhost:3000`. With an empty `.env.local`, the app still runs — every page shows a clear "Database not connected" state instead of crashing or faking data.

To get real data flowing:

1. Create a project at [supabase.com](https://supabase.com)
2. In the Supabase SQL editor, run **in this order**: `supabase/schema.sql` → `supabase/rls.sql` → `supabase/storage.sql` → `supabase/seed.sql`
3. From Project Settings → API, put into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the **publishable** key)
   - `SUPABASE_SERVICE_ROLE_KEY` (the **secret** key — needed for account deletion; never expose to the browser)
4. (Optional) add `ANTHROPIC_API_KEY` to turn on the real AI assistant
5. (Optional) paste the templates in `supabase/email-templates/` into Supabase Dashboard → Authentication → Email Templates

## How to check it out / vibe with it

The fastest way to feel the "connected platform" part of this — not just click through static pages:

1. **Sign up two accounts** in two browser tabs (or one normal + one incognito) — one as `organizer`, one as `fan`.
2. On the organizer tab, go to **Organizer Control Center** and hit **Start** on the Simulation Engine card (top of the page).
3. Watch the fan tab: gate wait times, crowd status, and the crowd trend chart update **without refreshing** — that's Supabase Realtime pushing the simulation's writes straight into both open dashboards.
4. Go to **Emergency Response** as the fan (or a volunteer/security account) and report an incident. Switch to the organizer tab — it shows up in the incident table immediately.
5. Make one of your accounts `admin` directly in the Supabase Table Editor (`profiles.role = 'admin'`), reload, and use the **"Preview as"** dropdown at the top of the sidebar to jump between every role's dashboard without logging out.
6. Open the **AI Assistant** and ask "where should I enter?" — the answer is grounded in whatever gates/routes/match/weather rows are actually in your database right now, not scripted text (requires `ANTHROPIC_API_KEY`).
7. Toggle light/dark from the navbar or profile menu — no flash on refresh, and it's remembered per-account if you're signed in.

That loop (simulate → watch it propagate → report an incident → watch it propagate → ask the AI something informed by it) is the whole point of the project.

## Environment variables

See `.env.local.example` for the full annotated list. Summary:

| Variable | Required for |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Any real data (everything degrades to "not connected" without it) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same |
| `SUPABASE_SERVICE_ROLE_KEY` | Account deletion (server-only, never sent to the browser) |
| `ANTHROPIC_API_KEY` | Real AI assistant replies |
| `ANTHROPIC_MODEL` | Optional, defaults to `claude-sonnet-5` |

## Scripts

```bash
npm run dev      # local dev server
npm run build    # production build
npm run start    # run the production build
npm run lint     # eslint — this repo builds and lints clean
```
