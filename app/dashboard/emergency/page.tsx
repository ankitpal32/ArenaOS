"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingBlock, NotConfiguredBlock, EmptyBlock, ErrorBlock } from "@/components/dashboard/DataState";
import { MyTasksCard } from "@/components/dashboard/MyTasksCard";
import { useRealtimeList } from "@/hooks/useSupabaseData";
import { createIncident, updateIncidentStatus } from "@/lib/supabase/queries";
import type { Incident, IncidentType } from "@/lib/supabase/types";
import {
  Siren,
  Baby,
  HeartPulse,
  Flame,
  ShieldAlert,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import clsx from "clsx";

const FLOWS: {
  id: IncidentType;
  label: string;
  icon: typeof Baby;
  tone: string;
  steps: string[];
}[] = [
  {
    id: "lost-child",
    label: "Lost child",
    icon: Baby,
    tone: "var(--arena-amber)",
    steps: [
      "Get a description: age, clothing, last seen location.",
      "Broadcast alert to nearby staff and gate teams.",
      "Direct guardian to the nearest Guest Services point.",
      "Confirm reunion and close the incident.",
    ],
  },
  {
    id: "medical",
    label: "Medical issue",
    icon: HeartPulse,
    tone: "var(--arena-red)",
    steps: [
      "Assess severity and stay with the person if safe to do so.",
      "Dispatch the nearest medic team with exact section/row.",
      "Clear a path — flag ushers to hold the aisle.",
      "Log outcome once medic team arrives on scene.",
    ],
  },
  {
    id: "fire",
    label: "Fire alert",
    icon: Flame,
    tone: "var(--arena-red)",
    steps: [
      "Confirm the alert source and location with control room.",
      "Trigger nearest evacuation route guidance for that section.",
      "Alert fire safety team and security simultaneously.",
      "Hold for all-clear before reopening the area.",
    ],
  },
  {
    id: "security",
    label: "Security concern",
    icon: ShieldAlert,
    tone: "var(--arena-blue)",
    steps: [
      "Note the individuals involved and exact location.",
      "Dispatch nearest security team, avoid direct intervention.",
      "Monitor from a safe distance until team arrives.",
      "File a short incident summary once resolved.",
    ],
  },
];

export default function EmergencyPage() {
  const incidents = useRealtimeList<Incident>("incidents", { orderBy: "created_at", ascending: false });
  const [activeFlow, setActiveFlow] = useState<IncidentType | null>(null);
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const flow = FLOWS.find((f) => f.id === activeFlow);
  const notConfigured = !incidents.isSupabaseConfigured;
  const openMatch = flow
    ? incidents.data.find((i) => i.type === flow.id && i.status !== "resolved")
    : undefined;

  async function reportIncident() {
    if (!flow) return;
    if (!location.trim()) {
      setFormError("Add a location before reporting.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    const { error } = await createIncident({
      type: flow.id,
      location: location.trim(),
      priority: flow.id === "fire" || flow.id === "medical" ? "high" : "medium",
    });
    setSubmitting(false);
    if (error) setFormError(error);
    else setLocation("");
  }

  async function resolveIncident() {
    if (!openMatch) return;
    setSubmitting(true);
    await updateIncidentStatus(openMatch.id, "resolved");
    setSubmitting(false);
  }

  return (
    <DashboardShell title="Volunteer & Emergency Response">
      <div className="mb-5">
        <MyTasksCard />
      </div>

      <div className="mb-5 flex flex-col items-start justify-between gap-4 rounded-xl border border-[var(--arena-red)]/30 bg-[var(--arena-red)]/8 p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Siren size={22} className="text-[var(--arena-red)]" />
          <div>
            <p className="font-display text-lg font-semibold text-[var(--arena-white)]">
              Report an emergency
            </p>
            <p className="text-sm text-[var(--arena-fog)]">
              Choose a workflow below, add a location, then report it.
            </p>
          </div>
        </div>
        <Button
          variant="danger"
          className="w-full sm:w-auto"
          disabled={!flow || submitting || notConfigured}
          onClick={reportIncident}
        >
          <Siren size={16} /> {submitting ? "Reporting…" : "Emergency action"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-1">
          {FLOWS.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setActiveFlow(f.id);
                setFormError(null);
              }}
              className={clsx(
                "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                activeFlow === f.id
                  ? "border-[var(--arena-amber)] bg-[var(--arena-amber)]/8"
                  : "border-[var(--arena-line)] bg-[var(--arena-panel)] hover:border-[var(--arena-fog)]/50"
              )}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${f.tone}1f`, color: f.tone }}
              >
                <f.icon size={18} />
              </span>
              <span className="flex-1 font-display text-base font-semibold text-[var(--arena-white)]">
                {f.label}
              </span>
              <ChevronRight size={16} className="text-[var(--arena-fog)]" />
            </button>
          ))}
        </div>

        <Card className="lg:col-span-2">
          {flow ? (
            <>
              <CardHeader eyebrow="AI-guided workflow" title={flow.label} />
              <ol className="flex flex-col gap-3">
                {flow.steps.map((step, i) => (
                  <li
                    key={step}
                    className="flex items-start gap-3 rounded-lg border border-[var(--arena-line)] bg-[var(--arena-navy)] p-3.5"
                  >
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold"
                      style={{ background: `${flow.tone}22`, color: flow.tone }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-[var(--arena-white)]">{step}</p>
                  </li>
                ))}
              </ol>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location (e.g. Section 114, Row J)"
                  disabled={notConfigured}
                  className="flex-1"
                />
                <Button
                  variant="primary"
                  disabled={!openMatch || submitting || notConfigured}
                  onClick={resolveIncident}
                >
                  <CheckCircle2 size={16} /> Mark resolved
                </Button>
              </div>
              {formError && <p className="mt-2 text-xs text-[var(--arena-red)]">{formError}</p>}
              {notConfigured && (
                <p className="mt-2 text-xs text-[var(--arena-fog)]">
                  Connect Supabase to report or resolve real incidents.
                </p>
              )}
            </>
          ) : (
            <div className="flex h-full min-h-[260px] flex-col items-center justify-center text-center">
              <Siren size={28} className="text-[var(--arena-fog)]" />
              <p className="mt-3 text-sm text-[var(--arena-fog)]">
                Select a workflow on the left to see AI-guided steps.
              </p>
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader eyebrow="Live" title="Active incident log" />
        {notConfigured ? (
          <NotConfiguredBlock what="the incident log" />
        ) : incidents.loading ? (
          <LoadingBlock label="Loading incidents…" />
        ) : incidents.error ? (
          <ErrorBlock message={incidents.error} />
        ) : incidents.data.length === 0 ? (
          <EmptyBlock label="No incidents reported yet." />
        ) : (
          <div className="flex flex-col gap-3">
            {incidents.data.map((inc) => (
              <div
                key={inc.id}
                className="flex flex-col gap-2 rounded-lg border border-[var(--arena-line)] bg-[var(--arena-navy)] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium capitalize text-[var(--arena-white)]">
                      {inc.type.replace("-", " ")}
                    </p>
                    <Badge tone={statusTone(inc.priority)}>{inc.priority}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-[var(--arena-fog)]">
                    {inc.location} · reported{" "}
                    {new Date(inc.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {inc.summary && <p className="mt-1 text-sm text-[var(--arena-fog)]">{inc.summary}</p>}
                </div>
                <Badge tone={statusTone(inc.status)}>{inc.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </DashboardShell>
  );
}
