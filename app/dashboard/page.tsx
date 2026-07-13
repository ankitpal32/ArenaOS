"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatWidget } from "@/components/dashboard/StatWidget";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { LoadingBlock, NotConfiguredBlock, EmptyBlock, ErrorBlock } from "@/components/dashboard/DataState";
import { useRealtimeList, useRealtimeRow } from "@/hooks/useSupabaseData";
import type { Gate, Incident, VenueStats } from "@/lib/supabase/types";
import { Users, Siren, Bus, HeartHandshake } from "lucide-react";

export default function DashboardOverviewPage() {
  const gates = useRealtimeList<Gate>("gates", { orderBy: "name" });
  const incidents = useRealtimeList<Incident>("incidents", { orderBy: "created_at", ascending: false });
  const stats = useRealtimeRow<VenueStats>("venue_stats", { match: ["id", true] });

  const notConfigured = !gates.isSupabaseConfigured;
  const openIncidents = incidents.data.filter((i) => i.status !== "resolved").length;

  return (
    <DashboardShell title="Overview">
      {notConfigured ? (
        <NotConfiguredBlock what="live venue stats" />
      ) : stats.loading ? (
        <LoadingBlock label="Loading venue stats…" />
      ) : stats.error ? (
        <ErrorBlock message={stats.error} />
      ) : !stats.data ? (
        <EmptyBlock label="No venue stats yet — seed supabase/seed.sql to populate this." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatWidget
            label="Attendance"
            value={stats.data.attendance_current.toLocaleString()}
            icon={Users}
            tone="var(--arena-amber)"
            trend={{
              direction: "up",
              value: `${Math.round(
                (stats.data.attendance_current / Math.max(stats.data.attendance_capacity, 1)) * 100
              )}% of capacity`,
              good: true,
            }}
          />
          <StatWidget
            label="Open incidents"
            value={String(openIncidents)}
            icon={Siren}
            tone="var(--arena-red)"
            trend={{ direction: "down", value: `${stats.data.incidents_resolved} resolved today`, good: true }}
          />
          <StatWidget
            label="Transport on time"
            value={`${stats.data.transport_on_time_pct}%`}
            icon={Bus}
            tone="var(--arena-blue)"
            trend={{ direction: "up", value: "shuttles running smooth", good: true }}
          />
          <StatWidget
            label="Volunteers active"
            value={String(stats.data.volunteers_active)}
            icon={HeartHandshake}
            tone="var(--arena-green)"
          />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader eyebrow="Live" title="Gate status" />
          {notConfigured ? (
            <NotConfiguredBlock what="gate status" />
          ) : gates.loading ? (
            <LoadingBlock label="Loading gates…" />
          ) : gates.error ? (
            <ErrorBlock message={gates.error} />
          ) : gates.data.length === 0 ? (
            <EmptyBlock label="No gates configured yet." />
          ) : (
            <div className="flex flex-col gap-4">
              {gates.data.map((gate) => (
                <div key={gate.id}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="text-sm text-[var(--arena-white)]">{gate.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[var(--arena-fog)]">
                        {gate.wait_minutes} min wait
                      </span>
                      <Badge tone={statusTone(gate.status)}>{gate.status}</Badge>
                    </div>
                  </div>
                  <ProgressBar
                    pct={gate.crowd_pct}
                    tone={gate.status === "clear" ? "green" : gate.status === "moderate" ? "amber" : "red"}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader eyebrow="Recent" title="Incidents" />
          {notConfigured ? (
            <NotConfiguredBlock what="incidents" />
          ) : incidents.loading ? (
            <LoadingBlock label="Loading incidents…" />
          ) : incidents.error ? (
            <ErrorBlock message={incidents.error} />
          ) : incidents.data.length === 0 ? (
            <EmptyBlock label="No incidents reported." />
          ) : (
            <div className="flex flex-col gap-3">
              {incidents.data.slice(0, 4).map((inc) => (
                <div
                  key={inc.id}
                  className="rounded-lg border border-[var(--arena-line)] bg-[var(--arena-navy)] p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium capitalize text-[var(--arena-white)]">
                      {inc.type.replace("-", " ")}
                    </p>
                    <Badge tone={statusTone(inc.status)}>{inc.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-[var(--arena-fog)]">
                    {inc.location} · {new Date(inc.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
