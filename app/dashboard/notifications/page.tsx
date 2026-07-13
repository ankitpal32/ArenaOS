"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingBlock, NotConfiguredBlock, EmptyBlock, ErrorBlock } from "@/components/dashboard/DataState";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeList } from "@/hooks/useSupabaseData";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/supabase/queries";
import type { Notification } from "@/lib/supabase/types";
import { Bell, CheckCheck } from "lucide-react";
import clsx from "clsx";

export default function NotificationsPage() {
  const { user, isSupabaseConfigured } = useAuth();
  const notifications = useRealtimeList<Notification>("notifications", {
    orderBy: "created_at",
    ascending: false,
  });

  const unreadCount = notifications.data.filter((n) => !n.read).length;

  return (
    <DashboardShell title="Notifications">
      {!isSupabaseConfigured ? (
        <NotConfiguredBlock what="notifications" />
      ) : !user ? (
        <EmptyBlock label="Log in to see your notifications." />
      ) : notifications.loading ? (
        <LoadingBlock label="Loading notifications…" />
      ) : notifications.error ? (
        <ErrorBlock message={notifications.error} />
      ) : (
        <>
          {unreadCount > 0 && (
            <div className="mb-4 flex justify-end">
              <Button
                variant="secondary"
                onClick={async () => {
                  await markAllNotificationsRead(user.id);
                  notifications.refetch();
                }}
              >
                <CheckCheck size={15} /> Mark all read ({unreadCount})
              </Button>
            </div>
          )}

          {notifications.data.length === 0 ? (
            <Card className="flex flex-col items-center gap-3 py-14 text-center">
              <Bell size={28} className="text-[var(--arena-fog)]" />
              <p className="text-sm text-[var(--arena-white)]">You&apos;re all caught up</p>
              <p className="text-xs text-[var(--arena-fog)]">No notifications yet.</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {notifications.data.map((n) => (
                <Card
                  key={n.id}
                  className={clsx(
                    "cursor-pointer transition-colors",
                    !n.read && "border-[var(--arena-amber)]/30 bg-[var(--arena-amber)]/5"
                  )}
                >
                  <button
                    onClick={async () => {
                      if (!n.read) {
                        await markNotificationRead(n.id);
                        notifications.refetch();
                      }
                    }}
                    className="flex w-full items-start justify-between gap-3 text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-[var(--arena-amber)]" />}
                        <p className="text-sm font-medium text-[var(--arena-white)]">{n.title}</p>
                      </div>
                      {n.body && <p className="mt-1 text-sm text-[var(--arena-fog)]">{n.body}</p>}
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-[var(--arena-fog)]">
                      {new Date(n.created_at).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </button>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}
