"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { LoadingBlock, NotConfiguredBlock, EmptyBlock, ErrorBlock } from "@/components/dashboard/DataState";
import { useRealtimeList } from "@/hooks/useSupabaseData";
import type { RouteRow } from "@/lib/supabase/types";
import {
  Search,
  MapPin,
  Clock,
  Accessibility,
  Navigation2,
} from "lucide-react";
import clsx from "clsx";

const crowdTone: Record<string, "green" | "amber" | "red"> = {
  low: "green",
  medium: "amber",
  high: "red",
};

export default function NavigationPage() {
  const routes = useRealtimeList<RouteRow>("routes", { orderBy: "eta_minutes" });
  const [destination, setDestination] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const notConfigured = !routes.isSupabaseConfigured;
  const selectedRoute =
    routes.data.find((r) => r.id === selected) ?? routes.data[0];

  return (
    <DashboardShell title="Navigation">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-1">
          <Card>
            <CardHeader eyebrow="Where to" title="Search destination" />
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--arena-fog)]"
              />
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Gate 14, Section 208, restroom…"
                className="pl-9"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Gate 14", "My seat", "Restroom", "Exit", "Food court"].map((s) => (
                <button
                  key={s}
                  onClick={() => setDestination(s)}
                  className="rounded-full border border-[var(--arena-line)] px-3 py-1 font-mono text-[11px] text-[var(--arena-fog)] transition-colors hover:text-[var(--arena-white)]"
                >
                  {s}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader eyebrow="Route options" title={destination || "Nearby routes"} />
            {notConfigured ? (
              <NotConfiguredBlock what="routes" />
            ) : routes.loading ? (
              <LoadingBlock label="Loading routes…" />
            ) : routes.error ? (
              <ErrorBlock message={routes.error} />
            ) : routes.data.length === 0 ? (
              <EmptyBlock label="No routes configured yet." />
            ) : (
              <div className="flex flex-col gap-3">
                {routes.data.map((route) => (
                  <button
                    key={route.id}
                    onClick={() => setSelected(route.id)}
                    className={clsx(
                      "w-full rounded-lg border p-4 text-left transition-colors",
                      selectedRoute?.id === route.id
                        ? "border-[var(--arena-amber)] bg-[var(--arena-amber)]/8"
                        : "border-[var(--arena-line)] bg-[var(--arena-navy)] hover:border-[var(--arena-fog)]/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[var(--arena-white)]">
                        {route.label}
                      </p>
                      {route.accessible && (
                        <Accessibility size={15} className="text-[var(--arena-cyan)]" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-[var(--arena-fog)]">
                      {route.description}
                    </p>
                    <div className="mt-2.5 flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 font-mono text-xs text-[var(--arena-fog)]">
                        <Clock size={12} /> {route.eta_minutes} min
                      </span>
                      <Badge tone={crowdTone[route.crowd_level]}>
                        {route.crowd_level} crowd
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card className="lg:col-span-2">
          <CardHeader eyebrow="Live" title="Route preview" />
          <div className="relative flex h-[420px] items-center justify-center overflow-hidden rounded-lg border border-[var(--arena-line)] bg-[var(--arena-navy)]">
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "linear-gradient(var(--arena-fog) 1px, transparent 1px), linear-gradient(90deg, var(--arena-fog) 1px, transparent 1px)",
                backgroundSize: "36px 36px",
              }}
            />
            <svg viewBox="0 0 400 300" className="relative h-full w-full max-w-md">
              <path
                d="M 40 250 Q 140 260 180 180 T 340 60"
                fill="none"
                stroke="var(--arena-amber)"
                strokeWidth="3"
                strokeDasharray="8 6"
                strokeLinecap="round"
              />
              <circle cx="40" cy="250" r="7" fill="var(--arena-blue)" />
              <circle cx="340" cy="60" r="7" fill="var(--arena-green)" />
            </svg>
            <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-lg border border-[var(--arena-line)] bg-[var(--arena-panel)] px-3 py-2 font-mono text-[11px] text-[var(--arena-fog)]">
              <MapPin size={13} className="text-[var(--arena-blue)]" /> You are here
            </div>
            <div className="absolute right-5 top-5 flex items-center gap-2 rounded-lg border border-[var(--arena-line)] bg-[var(--arena-panel)] px-3 py-2 font-mono text-[11px] text-[var(--arena-fog)]">
              <Navigation2 size={13} className="text-[var(--arena-green)]" />
              {destination || selectedRoute?.label || "Select a route"}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-[var(--arena-line)] p-3 text-center">
              <Clock size={16} className="mx-auto text-[var(--arena-fog)]" />
              <p className="mt-1.5 font-display text-lg font-semibold text-[var(--arena-white)]">
                {selectedRoute ? `${selectedRoute.eta_minutes} min` : "—"}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-wide text-[var(--arena-fog)]">ETA</p>
            </div>
            <div className="rounded-lg border border-[var(--arena-line)] p-3 text-center">
              <Accessibility size={16} className="mx-auto text-[var(--arena-fog)]" />
              <p className="mt-1.5 font-display text-lg font-semibold capitalize text-[var(--arena-white)]">
                {selectedRoute ? (selectedRoute.accessible ? "Yes" : "No") : "—"}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-wide text-[var(--arena-fog)]">Accessible</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
