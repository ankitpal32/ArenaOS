"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatWidget } from "@/components/dashboard/StatWidget";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { Badge, statusTone } from "@/components/ui/Badge";
import { LoadingBlock, NotConfiguredBlock, EmptyBlock, ErrorBlock } from "@/components/dashboard/DataState";
import { MatchWeatherWidget } from "@/components/dashboard/MatchWeatherWidget";
import { SimulationToggle } from "@/components/dashboard/SimulationToggle";
import { useRealtimeList, useRealtimeRow } from "@/hooks/useSupabaseData";
import type { Gate, Incident, VenueStats, CrowdTrendPoint } from "@/lib/supabase/types";
import {
  Users,
  Car,
  Bus,
  Siren,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function OrganizerDashboardPage() {
  const stats = useRealtimeRow<VenueStats>("venue_stats", { match: ["id", true] });
  const gates = useRealtimeList<Gate>("gates", { orderBy: "name" });
  const incidents = useRealtimeList<Incident>("incidents", { orderBy: "created_at", ascending: false });
  const trend = useRealtimeList<CrowdTrendPoint>("crowd_trend_points", { orderBy: "recorded_at" });

  const notConfigured = !stats.isSupabaseConfigured;
  const openIncidents = incidents.data.filter((i) => i.status !== "resolved").length;
  const busiestGate = [...gates.data].sort((a, b) => b.crowd_pct - a.crowd_pct)[0];
  const clearGates = gates.data.filter((g) => g.status === "clear");

  const recommendations: string[] = [];
  if (busiestGate && busiestGate.crowd_pct >= 85) {
    recommendations.push(`Open an overflow lane at ${busiestGate.name} — trending toward ${busiestGate.crowd_pct}%.`);
  }
  if (openIncidents > 0) {
    recommendations.push(`${openIncidents} incident(s) still open — check the Emergency Response module.`);
  }
  if (clearGates.length > 0 && busiestGate && busiestGate.crowd_pct >= 70) {
    recommendations.push(`Redirect arrivals toward ${clearGates[0].name}, currently clear.`);
  }
  if (recommendations.length === 0) {
    recommendations.push("No urgent recommendations — all gates and incidents look nominal.");
  }

  if (notConfigured) {
    return (
      <DashboardShell title="Organizer Control Center">
        <NotConfiguredBlock what="the organizer control center" />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Organizer Control Center">
      <div className="mb-5 flex flex-col gap-5">
        <SimulationToggle />
        <MatchWeatherWidget />
      </div>

      {stats.loading ? (
        <LoadingBlock label="Loading venue stats…" />
      ) : stats.error ? (
        <ErrorBlock message={stats.error} />
      ) : !stats.data ? (
        <EmptyBlock label="No venue stats yet — seed supabase/seed.sql to populate this." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatWidget
            label="Live attendance"
            value={`${stats.data.attendance_current.toLocaleString()} / ${stats.data.attendance_capacity.toLocaleString()}`}
            icon={Users}
            tone="var(--arena-amber)"
            trend={{
              direction: "up",
              value: `${Math.round((stats.data.attendance_current / Math.max(stats.data.attendance_capacity, 1)) * 100)}% of capacity`,
              good: true,
            }}
          />
          <StatWidget label="Parking full" value={`${stats.data.parking_full_pct}%`} icon={Car} tone="var(--arena-blue)" />
          <StatWidget label="Transport on time" value={`${stats.data.transport_on_time_pct}%`} icon={Bus} tone="var(--arena-green)" />
          <StatWidget label="Open incidents" value={String(openIncidents)} icon={Siren} tone="var(--arena-red)" />
          <StatWidget label="Incidents resolved" value={String(stats.data.incidents_resolved)} icon={Siren} tone="var(--arena-green)" />
          <StatWidget label="Volunteers active" value={String(stats.data.volunteers_active)} icon={HeartHandshake} tone="var(--arena-purple)" />
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader eyebrow="Analytics" title="Attendance flow" />
          {trend.loading ? (
            <LoadingBlock label="Loading trend…" />
          ) : trend.data.length === 0 ? (
            <EmptyBlock label="No crowd trend data recorded yet." />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend.data}>
                  <CartesianGrid stroke="var(--arena-line)" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--arena-fog)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--arena-fog)" fontSize={11} tickLine={false} axisLine={false} width={32} unit="%" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--arena-panel)",
                      border: "1px solid var(--arena-line)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "var(--arena-fog)" }}
                  />
                  <Line type="monotone" dataKey="pct" stroke="var(--arena-amber)" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader eyebrow="Live" title="Suggested actions" />
          <div className="flex flex-col gap-3">
            {recommendations.map((rec) => (
              <div key={rec} className="flex items-start gap-2.5 rounded-lg border border-[var(--arena-line)] bg-[var(--arena-navy)] p-3">
                <Sparkles size={14} className="mt-0.5 shrink-0 text-[var(--arena-amber)]" />
                <p className="text-sm text-[var(--arena-fog)]">{rec}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader eyebrow="By gate" title="Crowd distribution" />
          {gates.loading ? (
            <LoadingBlock label="Loading gates…" />
          ) : gates.data.length === 0 ? (
            <EmptyBlock label="No gates configured yet." />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gates.data.map((g) => ({ name: g.name.split(" — ")[0], pct: g.crowd_pct }))}>
                  <CartesianGrid stroke="var(--arena-line)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--arena-fog)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--arena-fog)" fontSize={11} tickLine={false} axisLine={false} width={32} unit="%" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--arena-panel)",
                      border: "1px solid var(--arena-line)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "var(--arena-fog)" }}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  />
                  <Bar dataKey="pct" fill="var(--arena-amber)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader eyebrow="Summary" title="Parking & transport" />
          {!stats.data ? (
            <EmptyBlock />
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-[var(--arena-white)]">Parking capacity</span>
                  <span className="font-mono text-xs text-[var(--arena-fog)]">{stats.data.parking_full_pct}%</span>
                </div>
                <ProgressBar pct={stats.data.parking_full_pct} tone="blue" />
              </div>
              <div>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-[var(--arena-white)]">Transport on-time rate</span>
                  <span className="font-mono text-xs text-[var(--arena-fog)]">{stats.data.transport_on_time_pct}%</span>
                </div>
                <ProgressBar pct={stats.data.transport_on_time_pct} tone="green" />
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader eyebrow="Live" title="Incident overview" />
        {incidents.loading ? (
          <LoadingBlock label="Loading incidents…" />
        ) : incidents.error ? (
          <ErrorBlock message={incidents.error} />
        ) : incidents.data.length === 0 ? (
          <EmptyBlock label="No incidents reported." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--arena-line)] font-mono text-[11px] uppercase tracking-wide text-[var(--arena-fog)]">
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Location</th>
                  <th className="py-2 pr-4">Reported</th>
                  <th className="py-2 pr-4">Priority</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {incidents.data.map((inc) => (
                  <tr key={inc.id} className="border-b border-[var(--arena-line)]/60 last:border-0">
                    <td className="py-2.5 pr-4 capitalize text-[var(--arena-white)]">
                      {inc.type.replace("-", " ")}
                    </td>
                    <td className="py-2.5 pr-4 text-[var(--arena-fog)]">{inc.location}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-[var(--arena-fog)]">
                      {new Date(inc.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-2.5 pr-4">
                      <Badge tone={statusTone(inc.priority)}>{inc.priority}</Badge>
                    </td>
                    <td className="py-2.5">
                      <Badge tone={statusTone(inc.status)}>{inc.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardShell>
  );
}
