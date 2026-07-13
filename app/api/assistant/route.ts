import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Gate, RouteRow, Match, WeatherSnapshot, Ticket, Profile } from "@/lib/supabase/types";

export const runtime = "nodejs";

function buildSystemPrompt(opts: {
  role: string;
  fullName: string | null;
  ticket: Ticket | null;
  match: Match | null;
  weather: WeatherSnapshot | null;
  gates: Gate[];
  routes: RouteRow[];
}) {
  const { role, fullName, ticket, match, weather, gates, routes } = opts;

  const gateLine = gates.length
    ? gates.map((g) => `${g.name} — ${g.status}, ${g.wait_minutes} min wait`).join("; ")
    : "No live gate data available.";
  const routeLine = routes.length
    ? routes.map((r) => `${r.label} (${r.eta_minutes} min, ${r.crowd_level} crowd)`).join("; ")
    : "No live route data available.";
  const matchLine = match
    ? `${match.home_team} vs ${match.away_team}, ${match.status}, score ${match.score_home}-${match.score_away}`
    : "No match currently live.";
  const weatherLine = weather
    ? `${weather.condition}, ${weather.temp_c}°C, wind ${weather.wind_kph} km/h, ${weather.precipitation_pct}% chance of rain`
    : "No weather data available.";
  const ticketLine = ticket
    ? `${ticket.event_name}${ticket.seat ? `, seat ${ticket.seat}` : ""}, status ${ticket.status}`
    : "No active ticket on file.";

  const roleGuidance: Record<string, string> = {
    fan: "Help them find their seat, gate, food, restrooms, and the best route in or out. Factor in current crowd levels and weather when relevant.",
    organizer:
      "Act as an operations copilot: analyze crowd, parking, weather, and incidents together, and recommend concrete actions (e.g. open an overflow lane, redirect volunteers).",
    volunteer:
      "Help them understand their current task priorities and the fastest way to nearby incidents. Be brief and operational.",
    staff:
      "Help them with operational/facilities/parking tasks. Be brief and operational.",
    security: "Focus on incidents, crowd risk, and coordination with nearby teams.",
    medical: "Focus on medical incidents, dispatch, and nearest routes to them.",
    admin: "You have full visibility. Answer analytically, referencing whichever data is most relevant to the question.",
  };

  return `You are the ArenaOS assistant, embedded in a live stadium operations
platform. The person asking is signed in as **${fullName ?? "a user"}**,
role: **${role}**. ${roleGuidance[role] ?? roleGuidance.fan}

Answer in short, practical sentences (2-4 sentences max). Stay in character
as a venue assistant — don't mention that you're an AI model. If you don't
have live data for something asked, say so plainly instead of guessing.

Live context:
- Ticket: ${ticketLine}
- Match: ${matchLine}
- Weather: ${weatherLine}
- Gates: ${gateLine}
- Routes: ${routeLine}`;
}

type ChatTurn = { role: string; content: string };

async function askGemini(apiKey: string, system: string, history: ChatTurn[], message: string) {
  // gemini-2.0-flash was shut down June 1, 2026 and now 404s on every
  // request. "gemini-flash-latest" is Google's auto-updating alias — using
  // an alias instead of a pinned version avoids this class of breakage
  // when Google retires a dated model in the future.
  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  const contents = [
    ...history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: { maxOutputTokens: 400 },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text: string | undefined = data.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("\n")
    .trim();
  return text;
}

async function askAnthropic(apiKey: string, system: string, history: ChatTurn[], message: string) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
      max_tokens: 400,
      system,
      messages: [
        ...history.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
        { role: "user", content: message },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text: string | undefined = data.content
    ?.filter((block: { type: string }) => block.type === "text")
    .map((block: { text: string }) => block.text)
    .join("\n")
    .trim();
  return text;
}

export async function POST(req: NextRequest) {
  let body: {
    message?: string;
    history?: ChatTurn[];
    context?: { gate?: string };
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  // Gemini is preferred when configured; Anthropic is used as a fallback so
  // existing setups keep working unchanged. Neither key set -> say so
  // plainly rather than faking a reply.
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!geminiKey && !anthropicKey) {
    return NextResponse.json(
      {
        reply:
          "The AI assistant isn't configured yet. Ask an admin to set GEMINI_API_KEY (preferred) or ANTHROPIC_API_KEY in .env.local.",
        source: "not-configured",
      },
      { status: 200 }
    );
  }

  // Pull live venue + user context from Supabase so answers are grounded in
  // real, role-specific data rather than generic scripted text.
  let gates: Gate[] = [];
  let routes: RouteRow[] = [];
  let match: Match | null = null;
  let weather: WeatherSnapshot | null = null;
  let ticket: Ticket | null = null;
  let profile: Profile | null = null;

  const supabase = await createClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const [gatesRes, routesRes, matchRes, weatherRes, profileRes] = await Promise.all([
      supabase.from("gates").select("*"),
      supabase.from("routes").select("*"),
      supabase.from("matches").select("*").in("status", ["live", "halftime"]).limit(1).maybeSingle(),
      supabase.from("weather_snapshots").select("*").order("recorded_at", { ascending: false }).limit(1).maybeSingle(),
      user ? supabase.from("profiles").select("*").eq("id", user.id).maybeSingle() : Promise.resolve({ data: null }),
    ]);
    gates = gatesRes.data ?? [];
    routes = routesRes.data ?? [];
    match = matchRes.data ?? null;
    weather = weatherRes.data ?? null;
    profile = profileRes.data ?? null;

    if (user) {
      const { data: ticketData } = await supabase
        .from("tickets")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();
      ticket = ticketData ?? null;
    }
  }

  const system = buildSystemPrompt({
    role: profile?.role ?? "fan",
    fullName: profile?.full_name ?? null,
    ticket,
    match,
    weather,
    gates,
    routes,
  });
  const history = (body.history ?? []).slice(-8);

  try {
    let reply: string | undefined;
    let source: string;

    if (geminiKey) {
      try {
        reply = await askGemini(geminiKey, system, history, message);
        source = "gemini";
      } catch (geminiErr) {
        console.error("Gemini call failed, falling back to Anthropic if available:", geminiErr);
        if (anthropicKey) {
          reply = await askAnthropic(anthropicKey, system, history, message);
          source = "anthropic-fallback";
        } else {
          throw geminiErr;
        }
      }
    } else {
      reply = await askAnthropic(anthropicKey!, system, history, message);
      source = "anthropic";
    }

    return NextResponse.json({
      reply: reply || "I didn't catch that — could you rephrase your question?",
      source,
    });
  } catch (err) {
    console.error("Assistant route error:", err);
    return NextResponse.json(
      { reply: "The assistant is temporarily unavailable. Please try again in a moment.", source: "error" },
      { status: 200 }
    );
  }
}
