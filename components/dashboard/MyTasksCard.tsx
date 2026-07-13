"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { LoadingBlock, EmptyBlock, NotConfiguredBlock } from "@/components/dashboard/DataState";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeList } from "@/hooks/useSupabaseData";
import { AssignmentService } from "@/services";
import type { Assignment } from "@/lib/supabase/types";
import { ListChecks } from "lucide-react";

export function MyTasksCard() {
  const { user, isSupabaseConfigured } = useAuth();
  const assignments = useRealtimeList<Assignment>("assignments", { orderBy: "created_at", ascending: false });
  const mine = user ? assignments.data.filter((a) => a.assignee_id === user.id) : [];

  return (
    <Card>
      <CardHeader eyebrow="Assigned to you" title="My tasks" action={<ListChecks size={16} className="text-[var(--arena-fog)]" />} />
      {!isSupabaseConfigured ? (
        <NotConfiguredBlock what="your assigned tasks" />
      ) : !user ? (
        <EmptyBlock label="Log in to see your assigned tasks." />
      ) : assignments.loading ? (
        <LoadingBlock label="Loading tasks…" />
      ) : mine.length === 0 ? (
        <EmptyBlock label="No tasks assigned to you right now." />
      ) : (
        <div className="flex flex-col gap-2">
          {mine.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-lg border border-[var(--arena-line)] bg-[var(--arena-navy)] p-3"
            >
              <div>
                <p className="text-sm text-[var(--arena-white)]">{task.task}</p>
                {task.location && <p className="text-xs text-[var(--arena-fog)]">{task.location}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={statusTone(task.priority)}>{task.priority}</Badge>
                <select
                  value={task.status}
                  onChange={(e) => AssignmentService.setStatus(task.id, e.target.value as Assignment["status"])}
                  className="rounded-md border border-[var(--arena-line)] bg-[var(--arena-panel)] px-1.5 py-1 text-[11px] text-[var(--arena-white)]"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
