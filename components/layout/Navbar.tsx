"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Radar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const LINKS = [
  { label: "Platform", href: "/#platform" },
  { label: "Modules", href: "/#modules" },
  { label: "For Organizers", href: "/#organizers" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--arena-line)]/70 bg-[var(--arena-navy)]/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--arena-amber)] text-[#1a1206]">
            <Radar size={18} strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl font-bold tracking-wide text-[var(--arena-white)]">
            ARENA<span className="text-[var(--arena-amber)]">OS</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono text-[13px] uppercase tracking-wide text-[var(--arena-fog)] transition-colors hover:text-[var(--arena-white)]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Button href="/login" variant="ghost">
            Log in
          </Button>
          <Button href="/signup" variant="primary">
            Get started
          </Button>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            className="text-[var(--arena-white)]"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <div
        className={`grid overflow-hidden border-t border-[var(--arena-line)] transition-all duration-300 ease-out md:hidden ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] border-t-0 opacity-0"
        }`}
      >
        <div className="min-h-0 px-6 py-4">
          <div className="flex flex-col gap-4">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-mono text-sm uppercase tracking-wide text-[var(--arena-fog)]"
              >
                {link.label}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <Button href="/login" variant="secondary" className="flex-1">
                Log in
              </Button>
              <Button href="/signup" variant="primary" className="flex-1">
                Get started
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
