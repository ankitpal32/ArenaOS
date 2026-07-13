"use client";

import { Search, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { UserMenu } from "@/components/layout/UserMenu";
import type { Role } from "@/types";

export function Topbar({
  role,
  title,
  onMenuClick,
}: {
  role: Role;
  title: string;
  onMenuClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-[var(--arena-line)] bg-[var(--arena-navy)]/90 px-5 py-4 backdrop-blur-md lg:px-8">
      <button
        className="text-[var(--arena-fog)] lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <h1 className="font-display text-xl font-semibold tracking-wide text-[var(--arena-white)]">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-[var(--arena-line)] bg-[var(--arena-panel)] px-3 py-2 sm:flex">
          <Search size={15} className="text-[var(--arena-fog)]" />
          <input
            placeholder="Search ArenaOS…"
            className="w-40 bg-transparent text-sm text-[var(--arena-white)] outline-none placeholder:text-[var(--arena-fog)]/60 lg:w-56"
          />
        </div>

        <ThemeToggle className="hidden sm:flex" />
        <NotificationBell />
        <UserMenu role={role} />
      </div>
    </header>
  );
}
