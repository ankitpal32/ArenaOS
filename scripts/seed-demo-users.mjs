#!/usr/bin/env node
/**
 * Seeds real Supabase Auth users for every non-admin role, so each
 * dashboard has real data under real RLS instead of everything running as
 * whichever single account exists.
 *
 * Why this has to be a script and not more SQL: Supabase Auth passwords
 * are hashed by GoTrue, not by Postgres — you can't safely INSERT a
 * working user into auth.users by hand. The Admin API
 * (supabase.auth.admin.createUser) is the supported way to create real
 * login-able users programmatically.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-demo-users.mjs
 *
 * (Node 20.6+ supports --env-file natively. On older Node, export the vars
 * yourself first, or `set -a; source .env.local; set +a` before running.)
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY — this script must only ever be run
 * locally/by a trusted operator, never shipped to the browser or a public
 * CI job without protecting the key.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";

// Fallback .env.local loader for Node versions without --env-file, so this
// script "just works" either way.
if (!process.env.NEXT_PUBLIC_SUPABASE_URL && existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Run with: node --env-file=.env.local scripts/seed-demo-users.mjs"
  );
  process.exit(1);
}

const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_PASSWORD = "ArenaOS-Demo-2026!";

const DEMO_USERS = [
  { email: "organizer@arenaos.demo", role: "organizer", fullName: "Jordan Reyes (Organizer)" },
  { email: "fan@arenaos.demo", role: "fan", fullName: "Sam Patel (Fan)" },
  { email: "volunteer@arenaos.demo", role: "volunteer", fullName: "Alex Kim (Volunteer)" },
  { email: "staff@arenaos.demo", role: "staff", fullName: "Riley Chen (Staff)" },
];

async function findExistingUser(email) {
  // listUsers doesn't filter by email server-side in older API versions,
  // so page through — fine for a small demo-seed script.
  let page = 1;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email === email);
    if (found) return found;
    if (data.users.length < 200) return null;
    page++;
  }
}

async function ensureUser({ email, role, fullName }) {
  let user = await findExistingUser(email);

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error) throw error;
    user = data.user;
    console.log(`  created auth user: ${email}`);
  } else {
    console.log(`  auth user already exists: ${email}`);
  }

  // The DB trigger (handle_new_user) creates the profile row automatically
  // on new-user insert. Upsert here too so re-running this script is safe
  // and so the role is always correct even if the trigger already ran with
  // the default 'fan' role.
  const { error: profileError } = await admin
    .from("profiles")
    .upsert({ id: user.id, email, full_name: fullName, role }, { onConflict: "id" });
  if (profileError) throw profileError;
  console.log(`  profile role set to: ${role}`);

  return user;
}

async function seedRoleData(users) {
  const fan = users.find((u) => u.role === "fan");
  const volunteer = users.find((u) => u.role === "volunteer");
  const staff = users.find((u) => u.role === "staff");

  if (fan) {
    const { data: existing } = await admin
      .from("tickets")
      .select("id")
      .eq("user_id", fan.id)
      .eq("event_name", "ArenaOS Season Opener")
      .maybeSingle();
    if (existing) {
      console.log("  fan ticket already seeded, skipping");
    } else {
      const { error } = await admin.from("tickets").insert({
        user_id: fan.id,
        event_name: "ArenaOS Season Opener",
        seat: "Section 114, Row J, Seat 22",
        status: "active",
        qr_code: `ARENAOS-${fan.id.slice(0, 8)}`,
      });
      if (error) console.warn("  (ticket seed skipped)", error.message);
      else console.log("  seeded a ticket for the fan account");
    }
  }

  if (volunteer) {
    const { data: existing } = await admin
      .from("assignments")
      .select("id")
      .eq("assignee_id", volunteer.id)
      .maybeSingle();
    if (existing) {
      console.log("  volunteer task already seeded, skipping");
    } else {
      const { error } = await admin.from("assignments").insert({
        assignee_id: volunteer.id,
        role_target: "volunteer",
        task: "Check in on Gate 9 queue",
        location: "Gate 9",
        priority: "medium",
        status: "pending",
      });
      if (error) console.warn("  (volunteer assignment seed skipped)", error.message);
      else console.log("  seeded a task for the volunteer account");
    }
  }

  if (staff) {
    const { data: existing } = await admin
      .from("assignments")
      .select("id")
      .eq("assignee_id", staff.id)
      .maybeSingle();
    if (existing) {
      console.log("  staff task already seeded, skipping");
    } else {
      const { error } = await admin.from("assignments").insert({
        assignee_id: staff.id,
        role_target: "staff",
        task: "Restock Concourse A first-aid kits",
        location: "Concourse A",
        priority: "low",
        status: "pending",
      });
      if (error) console.warn("  (staff assignment seed skipped)", error.message);
      else console.log("  seeded a task for the staff account");
    }
  }
}

async function main() {
  console.log(`Seeding demo users against ${url}\n`);

  const created = [];
  for (const spec of DEMO_USERS) {
    console.log(`${spec.role}:`);
    const user = await ensureUser(spec);
    created.push({ ...spec, id: user.id });
  }

  console.log("\nSeeding role-specific demo data…");
  await seedRoleData(created);

  console.log("\nDone. Log in with any of these (password is the same for all):\n");
  console.log(`  password: ${DEMO_PASSWORD}\n`);
  for (const u of created) {
    console.log(`  ${u.role.padEnd(10)} ${u.email}`);
  }
  console.log(
    "\nEach account's dashboard now shows its own real data under real RLS " +
      "— not the admin account previewing a role."
  );
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message ?? err);
  process.exit(1);
});
