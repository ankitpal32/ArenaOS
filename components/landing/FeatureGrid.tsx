import {
  Compass,
  Waves,
  Sparkles,
  LayoutDashboard,
  Siren,
  Bus,
  type LucideIcon,
} from "lucide-react";

const FEATURES: {
  icon: LucideIcon;
  title: string;
  description: string;
  tone: string;
}[] = [
  {
    icon: Compass,
    title: "Navigation",
    description:
      "Turn-by-turn guidance to any seat, gate, or restroom — with least-crowded and accessible route options built in.",
    tone: "var(--arena-blue)",
  },
  {
    icon: Waves,
    title: "Crowd Intelligence",
    description:
      "Live density by gate and concourse, with early warnings before a queue turns into a bottleneck.",
    tone: "var(--arena-cyan)",
  },
  {
    icon: Sparkles,
    title: "Fan Assistant",
    description:
      "A conversational assistant that answers 'where's my seat' and 'where's the nearest restroom' in seconds.",
    tone: "var(--arena-amber)",
  },
  {
    icon: LayoutDashboard,
    title: "Organizer Copilot",
    description:
      "One control center for attendance, parking, transport, and incidents — with AI recommendations, not just charts.",
    tone: "var(--arena-purple)",
  },
  {
    icon: Siren,
    title: "Emergency Support",
    description:
      "Lost child, medical, and fire workflows that route the nearest responder and guide them step by step.",
    tone: "var(--arena-red)",
  },
  {
    icon: Bus,
    title: "Transport",
    description:
      "Parking status, shuttle timing, and exit recommendations that update as the venue empties out.",
    tone: "var(--arena-green)",
  },
];

export function FeatureGrid() {
  return (
    <section id="modules" className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--arena-amber)]">
          Modules
        </p>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-[var(--arena-white)] sm:text-5xl">
          Six systems, one feed
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[var(--arena-fog)]">
          Every module reads from the same live venue state, so a gate closure
          or a medical call updates fans, staff, and organizers at once.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-xl border border-[var(--arena-line)] bg-[var(--arena-panel)] p-6 transition-colors hover:border-[var(--arena-fog)]/50"
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-lg"
              style={{ background: `${feature.tone}1f`, color: feature.tone }}
            >
              <feature.icon size={20} strokeWidth={2} />
            </div>
            <h3 className="mt-5 font-display text-xl font-semibold text-[var(--arena-white)]">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--arena-fog)]">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
