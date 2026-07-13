"use client";

import { useRouter } from "next/navigation";
import { Radar, ArrowRight } from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ROLES } from "@/data/mockData";
import { updateUserRole } from "@/lib/supabase/auth";
import Link from "next/link";
import type { Role } from "@/types";

export default function RoleSelectPage() {
  const router = useRouter();

  async function selectRole(roleId: Role) {
    // Persists to the signed-in user's profile row in Supabase. If this
    // fails (e.g. not signed in), we still navigate — DashboardShell falls
    // back to the `?role=` query param and every page shows its own
    // "not connected" state where real data would otherwise be required.
    await updateUserRole(roleId);
    router.push(`/dashboard?role=${roleId}`);
  }

  return (
    <div className="floodlight relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(var(--arena-fog) 1px, transparent 1px), linear-gradient(90deg, var(--arena-fog) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative w-full max-w-4xl">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--arena-amber)] text-[#1a1206]">
            <Radar size={18} strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl font-bold tracking-wide text-[var(--arena-white)]">
            ARENA<span className="text-[var(--arena-amber)]">OS</span>
          </span>
        </Link>

        <div className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--arena-amber)]">
            Step 2 of 2
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-[var(--arena-white)] sm:text-4xl">
            What&apos;s your role today?
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--arena-fog)]">
            This decides what your dashboard shows. You can switch roles later
            from your profile.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((role) => {
            const Icon = (Icons[role.icon as keyof typeof Icons] ??
              Icons.CircleUser) as LucideIcon;
            return (
              <button
                key={role.id}
                onClick={() => selectRole(role.id)}
                className="group flex flex-col items-start rounded-xl border border-[var(--arena-line)] bg-[var(--arena-panel)] p-6 text-left transition-all hover:-translate-y-1 hover:border-[var(--arena-fog)]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--arena-amber)]"
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full"
                  style={{ background: `${role.color}1f`, color: role.color }}
                >
                  <Icon size={20} strokeWidth={2} />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-[var(--arena-white)]">
                  {role.label}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--arena-fog)]">
                  {role.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-[var(--arena-amber)] opacity-0 transition-opacity group-hover:opacity-100">
                  Continue <ArrowRight size={13} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
