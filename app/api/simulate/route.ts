import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function jitter(value: number, spread: number, min = 0, max = 100) {
  const next = value + (Math.random() * 2 - 1) * spread;
  return Math.round(Math.max(min, Math.min(max, next)));
}

export async function POST() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Database not connected." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Sign in required to run the simulation." }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || !["organizer", "admin"].includes(profile.role)) {
    return NextResponse.json({ ok: false, error: "Only organizers or admins can run the simulation." }, { status: 403 });
  }

  const changes: string[] = [];

  // Gates
  const { data: gates } = await supabase.from("gates").select("*");
  for (const gate of gates ?? []) {
    const pct = jitter(gate.crowd_pct, 8);
    const wait = Math.max(0, Math.round(gate.wait_minutes + (Math.random() * 4 - 2)));
    const status = pct >= 85 ? "congested" : pct >= 55 ? "moderate" : "clear";
    await supabase
      .from("gates")
      .update({ crowd_pct: pct, wait_minutes: wait, status, updated_at: new Date().toISOString() })
      .eq("id", gate.id);
  }
  if (gates?.length) changes.push(`${gates.length} gate(s) updated`);

  // Parking lots
  const { data: lots } = await supabase.from("parking_lots").select("*");
  for (const lot of lots ?? []) {
    const pct = jitter(lot.pct, 5);
    const status = pct >= 90 ? "Nearly full" : pct >= 70 ? "Filling up" : "Open";
    await supabase.from("parking_lots").update({ pct, status }).eq("id", lot.id);
  }
  if (lots?.length) changes.push(`${lots.length} parking lot(s) updated`);

  // Shuttles
  const { data: shuttles } = await supabase.from("shuttles").select("*");
  for (const s of shuttles ?? []) {
    const eta = Math.max(1, Math.round(s.eta_minutes + (Math.random() * 3 - 1.5)));
    await supabase.from("shuttles").update({ eta_minutes: eta }).eq("id", s.id);
  }
  if (shuttles?.length) changes.push(`${shuttles.length} shuttle(s) updated`);

  // Crowd trend — append one new point derived from the average gate load
  if (gates?.length) {
    const avgPct = Math.round(gates.reduce((sum, g) => sum + g.crowd_pct, 0) / gates.length);
    const label = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    await supabase.from("crowd_trend_points").insert({ label, pct: avgPct });
    changes.push("crowd trend point added");
  }

  // Weather — small random drift
  const { data: weather } = await supabase
    .from("weather_snapshots")
    .select("*")
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (weather) {
    await supabase.from("weather_snapshots").insert({
      condition: weather.condition,
      temp_c: Math.round((weather.temp_c + (Math.random() * 1 - 0.5)) * 10) / 10,
      wind_kph: Math.max(0, Math.round(weather.wind_kph + (Math.random() * 2 - 1))),
      precipitation_pct: jitter(weather.precipitation_pct, 5),
    });
    changes.push("weather updated");
  }

  return NextResponse.json({ ok: true, changes });
}
