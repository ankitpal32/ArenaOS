"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeList } from "@/hooks/useSupabaseData";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/supabase/queries";
import type { Notification } from "@/lib/supabase/types";
import clsx from "clsx";

export function NotificationBell() {
  const { user, isSupabaseConfigured } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: notifications, refetch } = useRealtimeList<Notification>("notifications", {
    orderBy: "created_at",
    ascending: false,
    limit: 8,
  });
  const mine = user ? notifications.filter((n) => n.user_id === user.id) : [];
  const unreadCount = mine.filter((n) => !n.read).length;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!isSupabaseConfigured || !user) {
    return (
      <button
        disabled
        className="relative rounded-lg border border-[var(--arena-line)] bg-[var(--arena-panel)] p-2.5 text-[var(--arena-fog)] opacity-50"
        aria-label="Notifications (sign in to view)"
      >
        <Bell size={16} />
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg border border-[var(--arena-line)] bg-[var(--arena-panel)] p-2.5 text-[var(--arena-fog)] transition-colors hover:text-[var(--arena-white)]"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={open}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--arena-red)] px-1 font-mono text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-dropdown-in absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-[var(--arena-line)] bg-[var(--arena-panel)] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between border-b border-[var(--arena-line)] px-4 py-3">
            <p className="font-display text-sm font-semibold text-[var(--arena-white)]">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={async () => {
                  await markAllNotificationsRead(user.id);
                  refetch();
                }}
                className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wide text-[var(--arena-amber)] hover:underline"
              >
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {mine.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--arena-fog)]">
                You&apos;re all caught up.
              </p>
            ) : (
              mine.map((n) => (
                <button
                  key={n.id}
                  onClick={async () => {
                    if (!n.read) {
                      await markNotificationRead(n.id);
                      refetch();
                    }
                  }}
                  className={clsx(
                    "flex w-full flex-col gap-0.5 border-b border-[var(--arena-line)]/60 px-4 py-3 text-left transition-colors last:border-0 hover:bg-[var(--arena-navy)]",
                    !n.read && "bg-[var(--arena-amber)]/5"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--arena-amber)]" />}
                    <p className="text-sm font-medium text-[var(--arena-white)]">{n.title}</p>
                  </div>
                  {n.body && <p className="text-xs text-[var(--arena-fog)]">{n.body}</p>}
                  <p className="font-mono text-[10px] text-[var(--arena-fog)]">
                    {new Date(n.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </button>
              ))
            )}
          </div>

          <Link
            href="/dashboard/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-[var(--arena-line)] px-4 py-2.5 text-center font-mono text-[11px] uppercase tracking-wide text-[var(--arena-fog)] transition-colors hover:text-[var(--arena-white)]"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
}
