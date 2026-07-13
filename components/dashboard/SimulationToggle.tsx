"use client";

import { useEffect, useRef, useState } from "react";
import { SimulationService } from "@/services";
import { Play, Pause, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function SimulationToggle() {
  const [running, setRunning] = useState(false);
  const [intervalSec, setIntervalSec] = useState(5);
  const [lastChanges, setLastChanges] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function runTick() {
    const res = await SimulationService.tick();
    if (!res.ok) setError(res.error ?? "Simulation failed.");
    else {
      setError(null);
      setLastChanges(res.changes ?? []);
    }
  }

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(runTick, intervalSec * 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, intervalSec]);

  return (
    <Card className="border-[var(--arena-amber)]/25">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-[var(--arena-amber)]" />
          <p className="text-sm font-medium text-[var(--arena-white)]">Simulation engine</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="font-mono text-[11px] text-[var(--arena-fog)]">Every</label>
          <select
            value={intervalSec}
            onChange={(e) => setIntervalSec(Number(e.target.value))}
            className="rounded-md border border-[var(--arena-line)] bg-[var(--arena-navy)] px-2 py-1 text-xs text-[var(--arena-white)]"
          >
            {[3, 5, 10, 30].map((s) => (
              <option key={s} value={s}>
                {s}s
              </option>
            ))}
          </select>
          <button
            onClick={() => setRunning((r) => !r)}
            className="flex items-center gap-1.5 rounded-md bg-[var(--arena-amber)] px-3 py-1.5 font-mono text-[11px] font-semibold text-[#1a1206]"
          >
            {running ? <Pause size={12} /> : <Play size={12} />}
            {running ? "Stop" : "Start"}
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-[var(--arena-red)]">{error}</p>}
      {!error && lastChanges.length > 0 && (
        <p className="mt-2 font-mono text-[11px] text-[var(--arena-fog)]">
          Last tick: {lastChanges.join(", ")}
        </p>
      )}
      <p className="mt-2 text-xs text-[var(--arena-fog)]">
        Randomly but realistically nudges live gate, parking, shuttle, weather,
        and crowd-trend data — every open dashboard updates via Supabase
        Realtime as it writes. Organizer/admin only.
      </p>
    </Card>
  );
}
