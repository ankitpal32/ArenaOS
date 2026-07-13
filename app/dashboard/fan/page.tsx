"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingBlock, NotConfiguredBlock, EmptyBlock, ErrorBlock } from "@/components/dashboard/DataState";
import { MatchWeatherWidget } from "@/components/dashboard/MatchWeatherWidget";
import { useRealtimeList } from "@/hooks/useSupabaseData";
import type { Gate } from "@/lib/supabase/types";
import {
  DoorOpen,
  Compass,
  UtensilsCrossed,
  Bus,
  LifeBuoy,
  Sparkles,
  MapPin,
  Timer,
} from "lucide-react";

const QUICK_ACTIONS = [
  { label: "Navigate", icon: Compass, href: "/dashboard/navigation", tone: "var(--arena-blue)" },
  { label: "Food", icon: UtensilsCrossed, href: "/dashboard/assistant?role=fan", tone: "var(--arena-amber)" },
  { label: "Transport", icon: Bus, href: "/dashboard/transport", tone: "var(--arena-green)" },
  { label: "Help", icon: LifeBuoy, href: "/dashboard/assistant?role=fan", tone: "var(--arena-red)" },
];

export default function FanDashboardPage() {
  const gates = useRealtimeList<Gate>("gates", { orderBy: "crowd_pct" });
  const notConfigured = !gates.isSupabaseConfigured;

  const clearest = gates.data[0];
  const busiest = [...gates.data].sort((a, b) => b.crowd_pct - a.crowd_pct)[0];
  const avgWait = gates.data.length
    ? Math.round(gates.data.reduce((sum, g) => sum + g.wait_minutes, 0) / gates.data.length)
    : null;
  const anyCongested = gates.data.some((g) => g.status === "congested");

  return (
    <DashboardShell title="Fan Dashboard">
      <div className="mb-5">
        <MatchWeatherWidget />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2" glow>
          <CardHeader eyebrow="Live venue snapshot" title="No ticket linked to your account yet" />
          {notConfigured ? (
            <NotConfiguredBlock what="venue conditions" />
          ) : gates.loading ? (
            <LoadingBlock label="Loading venue conditions…" />
          ) : gates.error ? (
            <ErrorBlock message={gates.error} />
          ) : gates.data.length === 0 ? (
            <EmptyBlock label="No gate data available yet." />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-[var(--arena-line)] bg-[var(--arena-navy)] p-4 text-center">
                <DoorOpen className="mx-auto text-[var(--arena-green)]" size={20} />
                <p className="mt-2 font-display text-lg font-semibold text-[var(--arena-white)]">
                  {clearest?.name.split(" — ")[0] ?? "—"}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wide text-[var(--arena-fog)]">
                  Recommended gate
                </p>
              </div>
              <div className="rounded-lg border border-[var(--arena-line)] bg-[var(--arena-navy)] p-4 text-center">
                <Timer className="mx-auto text-[var(--arena-blue)]" size={20} />
                <p className="mt-2 font-display text-lg font-semibold text-[var(--arena-white)]">
                  {avgWait ?? "—"} min
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wide text-[var(--arena-fog)]">
                  Average wait
                </p>
              </div>
              <div className="rounded-lg border border-[var(--arena-line)] bg-[var(--arena-navy)] p-4 text-center">
                <MapPin className="mx-auto text-[var(--arena-red)]" size={20} />
                <p className="mt-2 font-display text-lg font-semibold text-[var(--arena-white)]">
                  {busiest?.name.split(" — ")[0] ?? "—"}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wide text-[var(--arena-fog)]">
                  Busiest gate
                </p>
              </div>
              <div className="rounded-lg border border-[var(--arena-line)] bg-[var(--arena-navy)] p-4 text-center">
                <Badge tone={anyCongested ? "red" : "green"}>{anyCongested ? "Busy" : "Doors open"}</Badge>
                <p className="mt-2 font-display text-lg font-semibold text-[var(--arena-white)]">
                  Live
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wide text-[var(--arena-fog)]">
                  Stadium status
                </p>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader eyebrow="Shortcuts" title="Quick actions" />
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Button
                key={action.label}
                href={action.href}
                variant="secondary"
                className="flex-col gap-2 py-4"
              >
                <action.icon size={20} style={{ color: action.tone }} />
                {action.label}
              </Button>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader eyebrow="Live venue map" title="Mini map" />
          <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-lg border border-[var(--arena-line)] bg-[var(--arena-navy)]">
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "linear-gradient(var(--arena-fog) 1px, transparent 1px), linear-gradient(90deg, var(--arena-fog) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <div className="relative flex flex-col items-center gap-2 text-center px-6">
              <MapPin className="text-[var(--arena-amber)]" size={28} />
              <p className="text-sm text-[var(--arena-fog)]">
                {clearest
                  ? `${clearest.name} is the least crowded gate right now — ${clearest.wait_minutes} min wait.`
                  : "Live gate data will appear here once available."}
              </p>
            </div>
            {clearest && <span className="absolute right-16 top-12 h-2.5 w-2.5 rounded-full bg-[var(--arena-green)] pulse-dot" />}
            <span className="absolute bottom-14 left-20 h-2.5 w-2.5 rounded-full bg-[var(--arena-amber)] pulse-dot" />
          </div>
        </Card>

        <Card>
          <CardHeader eyebrow="Nearby" title="Gate conditions" />
          {notConfigured ? (
            <NotConfiguredBlock what="gate conditions" />
          ) : gates.data.length === 0 ? (
            <EmptyBlock />
          ) : (
            <div className="flex flex-col gap-3">
              {gates.data.slice(0, 4).map((gate) => (
                <div key={gate.id} className="flex items-center justify-between text-sm">
                  <span className="text-[var(--arena-white)]">{gate.name}</span>
                  <span className="font-mono text-xs text-[var(--arena-fog)]">
                    {gate.wait_minutes} min
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader
          eyebrow="ArenaOS Assistant"
          title="Ask ArenaOS anything"
          action={
            <Button href="/dashboard/assistant?role=fan" variant="ghost">
              Open full chat
            </Button>
          }
        />
        <div className="flex items-center gap-3 rounded-lg border border-[var(--arena-line)] bg-[var(--arena-navy)] px-4 py-3">
          <Sparkles size={18} className="text-[var(--arena-amber)]" />
          <p className="text-sm text-[var(--arena-fog)]">
            Try &quot;Where&apos;s the nearest restroom?&quot; or &quot;What&apos;s the best route to
            the exit?&quot;
          </p>
        </div>
      </Card>
    </DashboardShell>
  );
}
