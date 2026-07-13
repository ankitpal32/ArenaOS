"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { StatWidget } from "@/components/dashboard/StatWidget";
import { LoadingBlock, NotConfiguredBlock, EmptyBlock } from "@/components/dashboard/DataState";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeList } from "@/hooks/useSupabaseData";
import type {
  Profile,
  Incident,
  Ticket,
  Match,
  ParkingLot,
  Assignment,
  ActivityLogEntry,
} from "@/lib/supabase/types";
import { Users, Siren, Ticket as TicketIcon, Car, HeartHandshake, Sparkles } from "lucide-react";
import { getRole } from "@/data/mockData";

export default function AdminOverviewPage() {
  const { profile, isSupabaseConfigured } = useAuth();
  const isAdmin = profile?.role === "admin";

  const users = useRealtimeList<Profile>("profiles", { orderBy: "created_at", ascending: false });
  const incidents = useRealtimeList<Incident>("incidents", { orderBy: "created_at", ascending: false });
  const tickets = useRealtimeList<Ticket>("tickets", { orderBy: "created_at", ascending: false });
  const matches = useRealtimeList<Match>("matches", { orderBy: "starts_at", ascending: false });
  const lots = useRealtimeList<ParkingLot>("parking_lots", { orderBy: "name" });
  const assignments = useRealtimeList<Assignment>("assignments", { orderBy: "created_at", ascending: false });
  const activity = useRealtimeList<ActivityLogEntry>("activity_log", {
    orderBy: "created_at",
    ascending: false,
    limit: 10,
  });

  if (!isSupabaseConfigured) {
    return (
      <DashboardShell title="Admin Overview">
        <NotConfiguredBlock what="the admin overview" />
      </DashboardShell>
    );
  }
  if (!isAdmin) {
    return (
      <DashboardShell title="Admin Overview">
        <EmptyBlock label="This page is only available to admin accounts." />
      </DashboardShell>
    );
  }

  const volunteers = users.data.filter((u) => u.role === "volunteer");
  const staff = users.data.filter((u) => u.role === "staff");
  const aiActivity = activity.data.filter((a) => a.action.startsWith("ai_") || a.action === "login");

  return (
    <DashboardShell title="Admin Overview">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatWidget label="Total users" value={String(users.data.length)} icon={Users} tone="var(--arena-amber)" />
        <StatWidget
          label="Open incidents"
          value={String(incidents.data.filter((i) => i.status !== "resolved").length)}
          icon={Siren}
          tone="var(--arena-red)"
        />
        <StatWidget label="Tickets issued" value={String(tickets.data.length)} icon={TicketIcon} tone="var(--arena-blue)" />
        <StatWidget
          label="Parking avg. full"
          value={lots.data.length ? `${Math.round(lots.data.reduce((s, l) => s + l.pct, 0) / lots.data.length)}%` : "—"}
          icon={Car}
          tone="var(--arena-purple)"
        />
        <StatWidget
          label="Volunteers / Staff"
          value={`${volunteers.length} / ${staff.length}`}
          icon={HeartHandshake}
          tone="var(--arena-green)"
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader eyebrow="Every account" title="Users" />
          {users.loading ? (
            <LoadingBlock label="Loading users…" />
          ) : users.data.length === 0 ? (
            <EmptyBlock />
          ) : (
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--arena-line)] font-mono text-[11px] uppercase tracking-wide text-[var(--arena-fog)]">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.data.map((u) => (
                    <tr key={u.id} className="border-b border-[var(--arena-line)]/60 last:border-0">
                      <td className="py-2 pr-4 text-[var(--arena-white)]">{u.full_name ?? "—"}</td>
                      <td className="py-2 pr-4 text-[var(--arena-fog)]">{u.email}</td>
                      <td className="py-2">
                        <Badge tone="amber">{getRole(u.role).label}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader eyebrow="Every incident" title="Incidents" />
          {incidents.data.length === 0 ? (
            <EmptyBlock label="No incidents reported." />
          ) : (
            <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
              {incidents.data.map((inc) => (
                <div key={inc.id} className="flex items-center justify-between rounded-lg border border-[var(--arena-line)] bg-[var(--arena-navy)] p-3 text-sm">
                  <span className="capitalize text-[var(--arena-white)]">{inc.type.replace("-", " ")} · {inc.location}</span>
                  <Badge tone={statusTone(inc.status)}>{inc.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader eyebrow="Every match" title="Matches" />
          {matches.data.length === 0 ? (
            <EmptyBlock label="No matches configured." />
          ) : (
            <div className="flex flex-col gap-2">
              {matches.data.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border border-[var(--arena-line)] bg-[var(--arena-navy)] p-3 text-sm">
                  <span className="text-[var(--arena-white)]">
                    {m.home_team} {m.score_home}–{m.score_away} {m.away_team}
                  </span>
                  <Badge tone={m.status === "live" ? "red" : "neutral"}>{m.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader eyebrow="Every zone" title="Parking" />
          {lots.data.length === 0 ? (
            <EmptyBlock label="No parking lots configured." />
          ) : (
            <div className="flex flex-col gap-2">
              {lots.data.map((l) => (
                <div key={l.id} className="flex items-center justify-between rounded-lg border border-[var(--arena-line)] bg-[var(--arena-navy)] p-3 text-sm">
                  <span className="text-[var(--arena-white)]">{l.name}</span>
                  <span className="font-mono text-xs text-[var(--arena-fog)]">{l.pct}% · {l.status}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader eyebrow="Every assignment" title="Volunteers & staff tasks" />
          {assignments.data.length === 0 ? (
            <EmptyBlock label="No assignments created yet." />
          ) : (
            <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
              {assignments.data.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border border-[var(--arena-line)] bg-[var(--arena-navy)] p-3 text-sm">
                  <span className="text-[var(--arena-white)]">{a.task}</span>
                  <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader eyebrow="Recent" title="AI & activity history" action={<Sparkles size={16} className="text-[var(--arena-amber)]" />} />
          {aiActivity.length === 0 ? (
            <EmptyBlock label="No activity recorded yet." />
          ) : (
            <div className="flex flex-col gap-2">
              {aiActivity.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-[var(--arena-white)]">{a.action.replace(/_/g, " ")}</span>
                  <span className="font-mono text-xs text-[var(--arena-fog)]">
                    {new Date(a.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
