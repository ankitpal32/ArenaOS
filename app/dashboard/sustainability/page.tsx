"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { LoadingBlock, NotConfiguredBlock, EmptyBlock, ErrorBlock } from "@/components/dashboard/DataState";
import { useRealtimeRow } from "@/hooks/useSupabaseData";
import type { SustainabilityMetric } from "@/lib/supabase/types";
import { Droplets, Zap, Recycle, Sparkles } from "lucide-react";

export default function SustainabilityPage() {
  const metric = useRealtimeRow<SustainabilityMetric>("sustainability_metrics", {
    orderBy: "event_date",
  });

  if (!metric.isSupabaseConfigured) {
    return (
      <DashboardShell title="Sustainability Tracker">
        <NotConfiguredBlock what="sustainability metrics" />
      </DashboardShell>
    );
  }

  if (metric.loading) {
    return (
      <DashboardShell title="Sustainability Tracker">
        <LoadingBlock label="Loading sustainability metrics…" />
      </DashboardShell>
    );
  }

  if (metric.error) {
    return (
      <DashboardShell title="Sustainability Tracker">
        <ErrorBlock message={metric.error} />
      </DashboardShell>
    );
  }

  if (!metric.data) {
    return (
      <DashboardShell title="Sustainability Tracker">
        <EmptyBlock label="No sustainability metrics recorded yet — seed supabase/seed.sql to populate this." />
      </DashboardShell>
    );
  }

  const m = metric.data;
  const waterPct = Math.round((m.water_litres / Math.max(m.water_target_litres, 1)) * 100);
  const energyPct = Math.round((m.energy_kwh / Math.max(m.energy_target_kwh, 1)) * 100);

  const tips: string[] = [];
  if (waterPct <= 90) tips.push(`Water usage is ${100 - waterPct}% below target — no action needed.`);
  else tips.push(`Water usage is at ${waterPct}% of today's target — keep an eye on concourse taps.`);
  if (energyPct >= 90) tips.push("Energy draw is close to today's target — consider pre-cooling concourse HVAC earlier.");
  else tips.push(`Energy usage is at ${energyPct}% of target, tracking on plan.`);
  if (m.waste_pct_diverted < 70) tips.push(`Waste diversion is at ${m.waste_pct_diverted}% — add more compost/recycling stations to close the gap.`);
  else tips.push(`Waste diversion is strong at ${m.waste_pct_diverted}% — on track for today's goal.`);

  return (
    <DashboardShell title="Sustainability Tracker">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-2">
            <Droplets size={18} className="text-[var(--arena-blue)]" />
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--arena-fog)]">
              Water usage
            </p>
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-[var(--arena-white)]">
            {m.water_litres.toLocaleString()} L
          </p>
          <p className="mt-1 text-xs text-[var(--arena-fog)]">
            of {m.water_target_litres.toLocaleString()} L daily target
          </p>
          <div className="mt-3">
            <ProgressBar pct={waterPct} tone="blue" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-[var(--arena-amber)]" />
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--arena-fog)]">
              Energy usage
            </p>
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-[var(--arena-white)]">
            {m.energy_kwh.toLocaleString()} kWh
          </p>
          <p className="mt-1 text-xs text-[var(--arena-fog)]">
            of {m.energy_target_kwh.toLocaleString()} kWh daily target
          </p>
          <div className="mt-3">
            <ProgressBar pct={energyPct} tone="amber" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Recycle size={18} className="text-[var(--arena-green)]" />
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--arena-fog)]">
              Waste diverted
            </p>
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-[var(--arena-white)]">
            {m.waste_pct_diverted}%
          </p>
          <p className="mt-1 text-xs text-[var(--arena-fog)]">from landfill via recycling & compost</p>
          <div className="mt-3">
            <ProgressBar pct={m.waste_pct_diverted} tone="green" />
          </div>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader
          eyebrow="Live"
          title="Ways to hit today's targets"
          action={<Sparkles size={18} className="text-[var(--arena-amber)]" />}
        />
        <div className="flex flex-col gap-3">
          {tips.map((tip) => (
            <div key={tip} className="flex items-start gap-2.5 rounded-lg border border-[var(--arena-line)] bg-[var(--arena-navy)] p-3">
              <Sparkles size={14} className="mt-0.5 shrink-0 text-[var(--arena-amber)]" />
              <p className="text-sm text-[var(--arena-fog)]">{tip}</p>
            </div>
          ))}
        </div>
      </Card>
    </DashboardShell>
  );
}
