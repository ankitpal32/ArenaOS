"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { LoadingBlock, NotConfiguredBlock, EmptyBlock, ErrorBlock } from "@/components/dashboard/DataState";
import { useRealtimeList } from "@/hooks/useSupabaseData";
import type { ParkingLot, Shuttle, Gate } from "@/lib/supabase/types";
import { Car, Bus, Train, DoorOpen, Clock } from "lucide-react";

const crowdTone: Record<string, "green" | "amber" | "red"> = {
  low: "green",
  medium: "amber",
  high: "red",
};

export default function TransportPage() {
  const lots = useRealtimeList<ParkingLot>("parking_lots", { orderBy: "name" });
  const shuttles = useRealtimeList<Shuttle>("shuttles", { orderBy: "eta_minutes" });
  const gates = useRealtimeList<Gate>("gates", { orderBy: "crowd_pct" });

  const notConfigured = !lots.isSupabaseConfigured;
  const clearestGate = gates.data[0];
  const soonestShuttle = shuttles.data[0];

  return (
    <DashboardShell title="Transportation Assistant">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader eyebrow="Parking" title="Lot status" action={<Car size={18} className="text-[var(--arena-fog)]" />} />
          {notConfigured ? (
            <NotConfiguredBlock what="parking status" />
          ) : lots.loading ? (
            <LoadingBlock label="Loading lots…" />
          ) : lots.error ? (
            <ErrorBlock message={lots.error} />
          ) : lots.data.length === 0 ? (
            <EmptyBlock label="No parking lots configured yet." />
          ) : (
            <div className="flex flex-col gap-4">
              {lots.data.map((lot) => (
                <div key={lot.id}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-[var(--arena-white)]">{lot.name}</span>
                    <span className="font-mono text-xs text-[var(--arena-fog)]">
                      {lot.pct}% · {lot.status}
                    </span>
                  </div>
                  <ProgressBar pct={lot.pct} tone={lot.pct > 85 ? "red" : lot.pct > 60 ? "amber" : "green"} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader eyebrow="Shuttle & metro" title="Departures" action={<Bus size={18} className="text-[var(--arena-fog)]" />} />
          {notConfigured ? (
            <NotConfiguredBlock what="shuttle departures" />
          ) : shuttles.loading ? (
            <LoadingBlock label="Loading shuttles…" />
          ) : shuttles.error ? (
            <ErrorBlock message={shuttles.error} />
          ) : shuttles.data.length === 0 ? (
            <EmptyBlock label="No shuttle routes configured yet." />
          ) : (
            <div className="flex flex-col gap-3">
              {shuttles.data.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--arena-line)] bg-[var(--arena-navy)] p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <Train size={17} className="text-[var(--arena-blue)]" />
                    <div>
                      <p className="text-sm font-medium text-[var(--arena-white)]">{s.route}</p>
                      <p className="flex items-center gap-1 font-mono text-[11px] text-[var(--arena-fog)]">
                        <Clock size={11} /> {s.eta_minutes} min
                      </p>
                    </div>
                  </div>
                  <Badge tone={crowdTone[s.crowd_level]}>{s.crowd_level} crowd</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader
          eyebrow="Live"
          title="Best exit route right now"
          action={<DoorOpen size={18} className="text-[var(--arena-fog)]" />}
        />
        {notConfigured ? (
          <NotConfiguredBlock what="an exit recommendation" />
        ) : (
          <p className="text-sm leading-relaxed text-[var(--arena-fog)]">
            {clearestGate
              ? `Exit via ${clearestGate.name} — currently the least crowded gate (${clearestGate.wait_minutes} min wait).`
              : "No live gate data available yet."}{" "}
            {soonestShuttle
              ? `The ${soonestShuttle.route} shuttle departs in ${soonestShuttle.eta_minutes} min.`
              : ""}
          </p>
        )}
      </Card>
    </DashboardShell>
  );
}
