import Link from "next/link";
import { Radar } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-full flex-1">
      <div className="absolute right-6 top-6 z-10">
        <ThemeToggle />
      </div>

      {/* Illustration panel — brand-consistent stadium/floodlight motif,
          hidden on small screens to keep the form the priority there. */}
      <div className="floodlight relative hidden w-[42%] shrink-0 overflow-hidden border-r border-[var(--arena-line)] bg-[var(--arena-navy-light)] lg:flex lg:items-center lg:justify-center">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(var(--arena-fog) 1px, transparent 1px), linear-gradient(90deg, var(--arena-fog) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-[480px] w-[200px] -translate-x-1/2 bg-gradient-to-b from-[var(--arena-amber)]/25 via-[var(--arena-amber)]/5 to-transparent blur-2xl floodlight-sweep" />

        <div className="relative flex flex-col items-center px-12 text-center">
          <svg width="220" height="140" viewBox="0 0 220 140" fill="none" className="mb-8">
            <ellipse cx="110" cy="100" rx="100" ry="32" stroke="var(--arena-line)" strokeWidth="2" />
            <ellipse cx="110" cy="100" rx="70" ry="20" stroke="var(--arena-amber)" strokeWidth="1.5" opacity="0.6" />
            <line x1="18" y1="70" x2="4" y2="20" stroke="var(--arena-fog)" strokeWidth="2" />
            <line x1="202" y1="70" x2="216" y2="20" stroke="var(--arena-fog)" strokeWidth="2" />
            <circle cx="4" cy="16" r="6" fill="var(--arena-amber)" opacity="0.8" />
            <circle cx="216" cy="16" r="6" fill="var(--arena-amber)" opacity="0.8" />
          </svg>
          <p className="font-display text-2xl font-semibold leading-snug text-[var(--arena-white)]">
            One control layer
            <br />
            for game day.
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--arena-fog)]">
            Live gates, crowd intelligence, and emergency response — all in
            one place, updating in real time.
          </p>
        </div>
      </div>

      <div className="floodlight relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05] lg:hidden"
          style={{
            backgroundImage:
              "linear-gradient(var(--arena-fog) 1px, transparent 1px), linear-gradient(90deg, var(--arena-fog) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        <div className="relative w-full max-w-md animate-auth-in">
          <Link href="/" className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--arena-amber)] text-[#1a1206]">
              <Radar size={18} strokeWidth={2.5} />
            </span>
            <span className="font-display text-xl font-bold tracking-wide text-[var(--arena-white)]">
              ARENA<span className="text-[var(--arena-amber)]">OS</span>
            </span>
          </Link>

          <div className="rounded-2xl border border-[var(--arena-line)] bg-[var(--arena-panel)] p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] sm:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--arena-amber)]">
              {eyebrow}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-[var(--arena-white)]">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--arena-fog)]">
              {subtitle}
            </p>

            <div className="mt-7">{children}</div>
          </div>

          {footer && (
            <p className="mt-6 text-center text-sm text-[var(--arena-fog)]">
              {footer}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
