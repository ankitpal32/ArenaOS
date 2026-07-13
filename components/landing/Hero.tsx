import { Button } from "@/components/ui/Button";
import { ArrowRight, Radio } from "lucide-react";

export function Hero() {
  return (
    <section className="floodlight relative overflow-hidden border-b border-[var(--arena-line)]">
      {/* pitch-line grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(var(--arena-fog) 1px, transparent 1px), linear-gradient(90deg, var(--arena-fog) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      {/* floodlight beam sweep — signature element */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[520px] w-[220px] -translate-x-1/2 bg-gradient-to-b from-[var(--arena-amber)]/25 via-[var(--arena-amber)]/5 to-transparent blur-2xl floodlight-sweep" />

      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-10 lg:pb-32 lg:pt-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--arena-line)] bg-[var(--arena-panel)]/80 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--arena-fog)]">
            <Radio size={13} className="text-[var(--arena-amber)] pulse-dot" />
            Live at 41,280 attendees right now
          </div>

          <h1 className="mt-7 font-display text-5xl font-bold leading-[1.05] tracking-tight text-[var(--arena-white)] sm:text-6xl lg:text-7xl">
            One control layer
            <br />
            for <span className="text-[var(--arena-amber)]">game day</span>.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--arena-fog)]">
            ArenaOS turns every gate, sensor, and radio call into one live
            picture — so fans find their seat, crews clear a bottleneck, and
            organizers see it all before it becomes a problem.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button href="/signup" variant="primary" className="px-7 py-3 text-base">
              Get started <ArrowRight size={17} />
            </Button>
            <Button href="/login" variant="secondary" className="px-7 py-3 text-base">
              Log in to your venue
            </Button>
          </div>
        </div>

        {/* live scoreboard strip */}
        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--arena-line)] bg-[var(--arena-line)] sm:grid-cols-4">
          {[
            { label: "Gates monitored", value: "24" },
            { label: "Avg. wait time", value: "6 min" },
            { label: "Incidents resolved", value: "11" },
            { label: "Volunteers active", value: "64" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[var(--arena-navy-light)] px-5 py-6 text-center"
            >
              <p className="font-mono text-2xl font-semibold text-[var(--arena-amber)]">
                {stat.value}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--arena-fog)]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
