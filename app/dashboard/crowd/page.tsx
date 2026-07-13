"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { LoadingBlock, NotConfiguredBlock, EmptyBlock, ErrorBlock } from "@/components/dashboard/DataState";
import { useRealtimeList } from "@/hooks/useSupabaseData";
import type { Gate, CrowdTrendPoint } from "@/lib/supabase/types";
import { AlertTriangle } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const toneMap: Record<string, "green" | "amber" | "red"> = {
  clear: "green",
  moderate: "amber",
  congested: "red",
};

export default function CrowdIntelligencePage() {
  const gates = useRealtimeList<Gate>("gates", { orderBy: "name" });
  const trend = useRealtimeList<CrowdTrendPoint>("crowd_trend_points", { orderBy: "recorded_at" });

  const notConfigured = !gates.isSupabaseConfigured;
  const congested = gates.data.filter((g) => g.status === "congested");
  const clearGates = gates.data.filter((g) => g.status === "clear").sort((a, b) => a.crowd_pct - b.crowd_pct);

  return (
    <DashboardShell title="Crowd Intelligence">
      {notConfigured ? (
        <NotConfiguredBlock what="crowd intelligence" />
      ) : (
        <>
          {congested.length > 0 && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-[var(--arena-red)]/30 bg-[var(--arena-red)]/10 px-4 py-3">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[var(--arena-red)]" />
              <p className="text-sm text-[var(--arena-white)]">
                <span className="font-semibold">{congested.length} gate(s) congested:</span>{" "}
                {congested.map((g) => g.name).join(", ")}. Consider opening an
                overflow lane or redirecting fans to nearby gates.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader eyebrow="Trend" title="Venue-wide crowd density" />
              {trend.loading ? (
                <LoadingBlock label="Loading trend…" />
              ) : trend.data.length === 0 ? (
                <EmptyBlock label="No crowd trend data recorded yet." />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend.data}>
                      <defs>
                        <linearGradient id="crowdFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--arena-amber)" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="var(--arena-amber)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="var(--arena-line)" vertical={false} />
                      <XAxis
                        dataKey="label"
                        stroke="var(--arena-fog)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="var(--arena-fog)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        width={32}
                        unit="%"
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--arena-panel)",
                          border: "1px solid var(--arena-line)",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        labelStyle={{ color: "var(--arena-fog)" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="pct"
                        stroke="var(--arena-amber)"
                        strokeWidth={2}
                        fill="url(#crowdFill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            <Card>
              <CardHeader eyebrow="Live" title="Redirect suggestion" />
              {congested.length === 0 ? (
                <p className="text-sm text-[var(--arena-fog)]">
                  No gates are congested right now — nothing to redirect.
                </p>
              ) : (
                <div className="flex items-start gap-3 rounded-lg border border-[var(--arena-amber)]/25 bg-[var(--arena-amber)]/8 p-4">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[var(--arena-amber)]" />
                  <p className="text-sm leading-relaxed text-[var(--arena-white)]">
                    {congested.map((g) => g.name).join(" and ")} {congested.length > 1 ? "are" : "is"} congested.{" "}
                    {clearGates.length > 0
                      ? `Redirect new arrivals to ${clearGates
                          .slice(0, 2)
                          .map((g) => g.name)
                          .join(" or ")}.`
                      : "No clear gates available right now."}
                  </p>
                </div>
              )}
            </Card>
          </div>

          <Card className="mt-5">
            <CardHeader eyebrow="By gate" title="Crowd percentage & wait times" />
            {gates.loading ? (
              <LoadingBlock label="Loading gates…" />
            ) : gates.error ? (
              <ErrorBlock message={gates.error} />
            ) : gates.data.length === 0 ? (
              <EmptyBlock label="No gates configured yet." />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {gates.data.map((gate) => (
                  <div
                    key={gate.id}
                    className="rounded-lg border border-[var(--arena-line)] bg-[var(--arena-navy)] p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-medium text-[var(--arena-white)]">{gate.name}</p>
                      <Badge tone={statusTone(gate.status)}>{gate.status}</Badge>
                    </div>
                    <ProgressBar pct={gate.crowd_pct} tone={toneMap[gate.status]} />
                    <div className="mt-2 flex justify-between font-mono text-[11px] text-[var(--arena-fog)]">
                      <span>{gate.crowd_pct}% full</span>
                      <span>{gate.wait_minutes} min wait</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
