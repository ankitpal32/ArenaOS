"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useAuth } from "@/hooks/useAuth";
import { useAdminPreview } from "@/contexts/AdminPreviewContext";
import { Eye, X } from "lucide-react";
import { getRole } from "@/data/mockData";
import type { Role } from "@/types";

function ShellInner({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const { profile, isSupabaseConfigured } = useAuth();
  const { previewRole, setPreviewRole } = useAdminPreview();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isRealAdmin = profile?.role === "admin";

  // Real role comes from the signed-in user's profile. The `?role=` query
  // param is only used as an immediate display fallback right after
  // /role-select navigates here (before the profile refetch lands), and
  // whenever Supabase isn't configured. An admin previewing another role
  // takes priority over both — see contexts/AdminPreviewContext.tsx.
  const queryRole = searchParams.get("role") as Role | null;
  const baseRole: Role = profile?.role ?? queryRole ?? "fan";
  const role: Role = isRealAdmin && previewRole ? previewRole : baseRole;

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar role={role} title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 bg-[var(--arena-navy)] px-5 py-6 lg:px-8 lg:py-8">
          {isRealAdmin && previewRole && (
            <div className="mb-5 flex items-center justify-between rounded-lg border border-[var(--arena-purple)]/30 bg-[var(--arena-purple)]/8 px-4 py-2.5 text-xs text-[var(--arena-purple)]">
              <span className="flex items-center gap-2">
                <Eye size={14} /> Previewing as {getRole(previewRole).label} — you&apos;re still signed in as admin.
              </span>
              <button
                onClick={() => setPreviewRole(null)}
                className="flex items-center gap-1 rounded-md border border-[var(--arena-purple)]/30 px-2 py-1 font-mono text-[10px] uppercase tracking-wide transition-colors hover:bg-[var(--arena-purple)]/15"
              >
                <X size={11} /> Exit preview
              </button>
            </div>
          )}
          {!isSupabaseConfigured && (
            <div className="mb-5 rounded-lg border border-[var(--arena-amber)]/25 bg-[var(--arena-amber)]/8 px-4 py-2.5 text-xs text-[var(--arena-amber)]">
              Database not connected — pages below will show live status once Supabase is configured.
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

export function DashboardShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--arena-navy)]" />}>
      <ShellInner title={title}>{children}</ShellInner>
    </Suspense>
  );
}
