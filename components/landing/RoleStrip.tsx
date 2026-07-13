import { ROLES } from "@/data/mockData";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function RoleStrip() {
  return (
    <section id="platform" className="border-y border-[var(--arena-line)] bg-[var(--arena-navy-light)]">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--arena-amber)]">
            Built for every badge
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-[var(--arena-white)] sm:text-5xl">
            The same system, six different jobs
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--arena-fog)]">
            ArenaOS reshapes itself around the badge you&apos;re wearing — a fan
            sees a map, a medic sees a dispatch queue.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {ROLES.map((role) => {
            const Icon = (Icons[role.icon as keyof typeof Icons] ??
              Icons.CircleUser) as LucideIcon;
            return (
              <div
                key={role.id}
                className="flex flex-col items-center rounded-xl border border-[var(--arena-line)] bg-[var(--arena-panel)] px-4 py-7 text-center transition-transform hover:-translate-y-1"
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full"
                  style={{ background: `${role.color}1f`, color: role.color }}
                >
                  <Icon size={20} strokeWidth={2} />
                </div>
                <p className="mt-3 font-display text-base font-semibold text-[var(--arena-white)]">
                  {role.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function OrganizerCTA() {
  return (
    <section id="organizers" className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--arena-line)] bg-[var(--arena-panel)] px-8 py-16 text-center sm:px-16">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[var(--arena-amber)]/10 blur-3xl" />
        <p className="relative font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--arena-amber)]">
          For organizers
        </p>
        <h2 className="relative mt-3 font-display text-4xl font-bold tracking-tight text-[var(--arena-white)] sm:text-5xl">
          Run the whole venue from one screen
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-base leading-relaxed text-[var(--arena-fog)]">
          Attendance, incidents, parking, and transport — with AI
          recommendations surfaced before you&apos;d think to ask.
        </p>
        <div className="relative mt-8 flex justify-center gap-3">
          <Button href="/signup" variant="primary" className="px-7 py-3 text-base">
            Get started
          </Button>
        </div>
      </div>
    </section>
  );
}
