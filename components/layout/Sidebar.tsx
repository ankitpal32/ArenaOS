"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Radar, LogOut, X } from "lucide-react";
import { navForRole } from "@/lib/navigation";
import { getRole } from "@/data/mockData";
import type { Role } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useAdminPreview } from "@/contexts/AdminPreviewContext";
import { ROLES } from "@/data/mockData";

export function Sidebar({
  role,
  open,
  onClose,
}: {
  role: Role;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, profile } = useAuth();
  const { previewRole, setPreviewRole } = useAdminPreview();
  const isRealAdmin = profile?.role === "admin";
  const items = navForRole(role);
  const roleInfo = getRole(role);

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--arena-line)] bg-[var(--arena-navy-light)] transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--arena-amber)] text-[#1a1206]">
              <Radar size={18} strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg font-bold tracking-wide text-[var(--arena-white)]">
              ARENA<span className="text-[var(--arena-amber)]">OS</span>
            </span>
          </Link>
          <button className="text-[var(--arena-fog)] lg:hidden" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <div className="mx-5 mb-4 flex items-center gap-2 rounded-lg border border-[var(--arena-line)] bg-[var(--arena-panel)] px-3 py-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: `${roleInfo.color}1f`, color: roleInfo.color }}
          >
            {(() => {
              const Icon = (Icons[roleInfo.icon as keyof typeof Icons] ??
                Icons.CircleUser) as LucideIcon;
              return <Icon size={14} strokeWidth={2.5} />;
            })()}
          </span>
          <div className="min-w-0">
            <p className="truncate font-mono text-[10px] uppercase tracking-wide text-[var(--arena-fog)]">
              Signed in as
            </p>
            <p className="truncate text-sm font-medium text-[var(--arena-white)]">
              {roleInfo.label}
            </p>
          </div>
        </div>

        {isRealAdmin && (
          <div className="mx-5 mb-4">
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-[var(--arena-fog)]">
              Preview as
            </label>
            <select
              value={previewRole ?? ""}
              onChange={(e) => setPreviewRole((e.target.value as Role) || null)}
              className="w-full rounded-lg border border-[var(--arena-line)] bg-[var(--arena-panel)] px-2.5 py-1.5 text-xs text-[var(--arena-white)] outline-none focus:border-[var(--arena-amber)]"
            >
              <option value="">Admin view</option>
              {ROLES.filter((r) => r.id !== "admin").map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <ul className="flex flex-col gap-1">
            {items.map((item) => {
              const Icon = (Icons[item.icon as keyof typeof Icons] ??
                Icons.Circle) as LucideIcon;
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname?.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={`${item.href}?role=${role}`}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-[var(--arena-amber)]/12 text-[var(--arena-amber)]"
                        : "text-[var(--arena-fog)] hover:bg-[var(--arena-panel)] hover:text-[var(--arena-white)]"
                    }`}
                  >
                    <Icon size={17} strokeWidth={2} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-[var(--arena-line)] px-5 py-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 text-sm text-[var(--arena-fog)] transition-colors hover:text-[var(--arena-white)]"
          >
            <LogOut size={16} />
            Switch role / log out
          </button>
        </div>
      </aside>
    </>
  );
}
