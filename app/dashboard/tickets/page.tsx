"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingBlock, NotConfiguredBlock, EmptyBlock, ErrorBlock } from "@/components/dashboard/DataState";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeList } from "@/hooks/useSupabaseData";
import type { Ticket } from "@/lib/supabase/types";
import { Ticket as TicketIcon, QrCode } from "lucide-react";

const toneMap = { active: "green", used: "neutral", cancelled: "red" } as const;

export default function TicketsPage() {
  const { user, isSupabaseConfigured } = useAuth();
  const tickets = useRealtimeList<Ticket>("tickets", { orderBy: "created_at", ascending: false });

  return (
    <DashboardShell title="My Tickets">
      {!isSupabaseConfigured ? (
        <NotConfiguredBlock what="your tickets" />
      ) : !user ? (
        <EmptyBlock label="Log in to see your tickets." />
      ) : tickets.loading ? (
        <LoadingBlock label="Loading tickets…" />
      ) : tickets.error ? (
        <ErrorBlock message={tickets.error} />
      ) : tickets.data.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <TicketIcon size={28} className="text-[var(--arena-fog)]" />
          <p className="text-sm text-[var(--arena-white)]">No tickets booked yet</p>
          <p className="max-w-sm text-xs text-[var(--arena-fog)]">
            Ticket booking isn&apos;t live yet — once it is, anything you book
            will show up here automatically.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tickets.data.map((t) => (
            <Card key={t.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-lg font-semibold text-[var(--arena-white)]">
                    {t.event_name}
                  </p>
                  {t.seat && <p className="mt-1 text-sm text-[var(--arena-fog)]">Seat {t.seat}</p>}
                </div>
                <Badge tone={toneMap[t.status]}>{t.status}</Badge>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-[var(--arena-line)] bg-[var(--arena-navy)] px-3 py-2 font-mono text-[11px] text-[var(--arena-fog)]">
                <QrCode size={14} /> {t.qr_code ?? "QR pending"}
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
