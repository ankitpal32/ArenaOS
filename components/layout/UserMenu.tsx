"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  LayoutDashboard,
  Ticket,
  Bell,
  Settings,
  Sun,
  Moon,
  LifeBuoy,
  Info,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { getRole } from "@/data/mockData";
import type { Role } from "@/types";

const ITEMS = [
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/tickets", label: "My Tickets", icon: Ticket },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help & Support", icon: LifeBuoy },
  { href: "/about", label: "About", icon: Info },
];

export function UserMenu({ role }: { role: Role }) {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const roleInfo = getRole(profile?.role ?? role);
  const displayName = profile?.full_name || user?.email?.split("@")[0] || roleInfo.label;
  const initials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  async function handleLogout() {
    setOpen(false);
    await signOut();
    router.push("/login");
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full transition-opacity hover:opacity-80"
      >
        {profile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt=""
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full font-mono text-xs font-semibold"
            style={{ background: `${roleInfo.color}22`, color: roleInfo.color }}
          >
            {initials}
          </div>
        )}
        <ChevronDown size={14} className={`hidden text-[var(--arena-fog)] transition-transform sm:block ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="animate-dropdown-in absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-[var(--arena-line)] bg-[var(--arena-panel)] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center gap-3 border-b border-[var(--arena-line)] px-4 py-3.5">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full font-mono text-sm font-semibold"
                style={{ background: `${roleInfo.color}22`, color: roleInfo.color }}
              >
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--arena-white)]">{displayName}</p>
              <p className="truncate text-xs text-[var(--arena-fog)]">{user?.email ?? roleInfo.label}</p>
            </div>
          </div>

          <div className="py-1.5">
            {ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--arena-fog)] transition-colors hover:bg-[var(--arena-navy)] hover:text-[var(--arena-white)]"
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}

            <button
              onClick={toggleTheme}
              role="menuitem"
              className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-[var(--arena-fog)] transition-colors hover:bg-[var(--arena-navy)] hover:text-[var(--arena-white)]"
            >
              <span className="flex items-center gap-3">
                {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
                Theme
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wide text-[var(--arena-fog)]">
                {theme === "dark" ? "Dark" : "Light"}
              </span>
            </button>
          </div>

          <div className="border-t border-[var(--arena-line)] py-1.5">
            <button
              onClick={handleLogout}
              role="menuitem"
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[var(--arena-red)] transition-colors hover:bg-[var(--arena-red)]/10"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
