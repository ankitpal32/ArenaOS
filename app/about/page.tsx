import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Radar, Compass, Waves, Siren } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-20 lg:px-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--arena-amber)]">
            About
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-[var(--arena-white)] sm:text-5xl">
            One system for every gate, every crew, every fan.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--arena-fog)]">
            ArenaOS is a live venue operations platform. Gate status, crowd
            density, incidents, and navigation all read from one shared
            database in real time — so a gate closure or a medical call
            updates fans, staff, and organizers at the same moment.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: Compass, label: "Navigation", tone: "var(--arena-blue)" },
              { icon: Waves, label: "Crowd intelligence", tone: "var(--arena-cyan)" },
              { icon: Siren, label: "Emergency response", tone: "var(--arena-red)" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-2 rounded-xl border border-[var(--arena-line)] bg-[var(--arena-panel)] p-6 text-center"
              >
                <item.icon size={22} style={{ color: item.tone }} />
                <p className="text-sm text-[var(--arena-white)]">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-3 rounded-xl border border-[var(--arena-line)] bg-[var(--arena-navy-light)] p-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--arena-amber)] text-[#1a1206]">
              <Radar size={18} strokeWidth={2.5} />
            </span>
            <p className="text-sm text-[var(--arena-fog)]">
              Built for live events — from local matches to full-capacity stadiums.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
