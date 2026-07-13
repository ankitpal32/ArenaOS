"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingBlock, NotConfiguredBlock, EmptyBlock } from "@/components/dashboard/DataState";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeList } from "@/hooks/useSupabaseData";
import type { ActivityLogEntry, Ticket } from "@/lib/supabase/types";
import { getRole } from "@/data/mockData";
import { Mail, Calendar, Pencil } from "lucide-react";

export default function ProfilePage() {
  const { user, profile, loading, isSupabaseConfigured } = useAuth();
  const activity = useRealtimeList<ActivityLogEntry>("activity_log", {
    orderBy: "created_at",
    ascending: false,
    limit: 6,
  });
  const tickets = useRealtimeList<Ticket>("tickets", { orderBy: "created_at", ascending: false });

  if (!isSupabaseConfigured) {
    return (
      <DashboardShell title="Profile">
        <NotConfiguredBlock what="your profile" />
      </DashboardShell>
    );
  }

  if (loading) {
    return (
      <DashboardShell title="Profile">
        <LoadingBlock label="Loading profile…" />
      </DashboardShell>
    );
  }

  if (!user || !profile) {
    return (
      <DashboardShell title="Profile">
        <EmptyBlock label="Log in to view your profile." />
      </DashboardShell>
    );
  }

  const roleInfo = getRole(profile.role);
  const memberSince = new Date(profile.created_at).toLocaleDateString([], {
    month: "long",
    year: "numeric",
  });

  return (
    <DashboardShell title="Profile">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full font-display text-2xl font-semibold"
                style={{ background: `${roleInfo.color}22`, color: roleInfo.color }}
              >
                {(profile.full_name || profile.email).slice(0, 2).toUpperCase()}
              </div>
            )}
            <p className="mt-4 font-display text-xl font-semibold text-[var(--arena-white)]">
              {profile.full_name || "Unnamed"}
            </p>
            <Badge tone="amber" className="mt-2">
              {roleInfo.label}
            </Badge>

            <div className="mt-5 flex w-full flex-col gap-2 text-left">
              <div className="flex items-center gap-2 text-sm text-[var(--arena-fog)]">
                <Mail size={14} /> {profile.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--arena-fog)]">
                <Calendar size={14} /> Member since {memberSince}
              </div>
            </div>

            <Button href="/dashboard/settings" variant="secondary" className="mt-5 w-full">
              <Pencil size={14} /> Edit profile
            </Button>
          </div>
        </Card>

        <div className="flex flex-col gap-5 lg:col-span-2">
          <Card>
            <CardHeader eyebrow="Live" title="Recent activity" />
            {activity.loading ? (
              <LoadingBlock label="Loading activity…" />
            ) : activity.data.length === 0 ? (
              <EmptyBlock label="No activity recorded yet." />
            ) : (
              <div className="flex flex-col gap-3">
                {activity.data.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-[var(--arena-white)]">
                      {entry.action.replace(/_/g, " ")}
                    </span>
                    <span className="font-mono text-xs text-[var(--arena-fog)]">
                      {new Date(entry.created_at).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader eyebrow="Bookings" title="Booked tickets" />
            {tickets.loading ? (
              <LoadingBlock label="Loading tickets…" />
            ) : tickets.data.length === 0 ? (
              <EmptyBlock label="No tickets booked yet." />
            ) : (
              <div className="flex flex-col gap-2">
                {tickets.data.map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--arena-white)]">{t.event_name}</span>
                    <Badge tone={t.status === "active" ? "green" : "amber"}>{t.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
