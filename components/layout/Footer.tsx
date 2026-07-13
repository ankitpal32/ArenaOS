import Link from "next/link";
import { Radar } from "lucide-react";

const COLUMNS = [
  {
    title: "Platform",
    links: ["Navigation", "Crowd Intelligence", "AI Assistant", "Emergency Response"],
  },
  {
    title: "Roles",
    links: ["Fans", "Volunteers", "Staff", "Organizers"],
  },
  {
    title: "Company",
    links: ["About", "Security", "Status", "Contact"],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--arena-line)] bg-[var(--arena-navy-light)]">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--arena-amber)] text-[#1a1206]">
                <Radar size={18} strokeWidth={2.5} />
              </span>
              <span className="font-display text-xl font-bold tracking-wide text-[var(--arena-white)]">
                ARENA<span className="text-[var(--arena-amber)]">OS</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--arena-fog)]">
              The operating layer for live events — one system for every gate,
              every crew, every fan in the building.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--arena-fog)]">
                {col.title}
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <span className="cursor-pointer text-sm text-[var(--arena-white)]/80 transition-colors hover:text-[var(--arena-amber)]">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[var(--arena-line)] pt-6 text-xs text-[var(--arena-fog)] md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} ArenaOS. Built for game day.</p>
          <p className="font-mono">SYSTEM STATUS: <span className="text-[var(--arena-green)]">ALL SERVICES OPERATIONAL</span></p>
        </div>
      </div>
    </footer>
  );
}
