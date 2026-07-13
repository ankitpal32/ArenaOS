"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingBlock, NotConfiguredBlock, EmptyBlock } from "@/components/dashboard/DataState";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeList } from "@/hooks/useSupabaseData";
import { createClient } from "@/lib/supabase/client";
import type { RouteRow, UserPreferences } from "@/lib/supabase/types";
import { ToggleRow } from "@/components/ui/Toggle";
import { Accessibility, Volume2, Captions, Clock } from "lucide-react";

export default function AccessibilityPage() {
  const { user, isSupabaseConfigured, loading: authLoading } = useAuth();
  const routes = useRealtimeList<RouteRow>("routes");
  const accessibleRoute = routes.data.find((r) => r.accessible);

  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loadingPrefs, setLoadingPrefs] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !user) return;
    const supabase = createClient();
    if (!supabase) return;
    supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setPrefs(data ?? null);
        setLoadingPrefs(false);
      });
  }, [user, isSupabaseConfigured]);

  async function toggle(field: "voice_guidance" | "live_captions") {
    if (!user || !prefs) return;
    const supabase = createClient();
    if (!supabase) return;
    const next = { ...prefs, [field]: !prefs[field] };
    setPrefs(next);
    const payload =
      field === "voice_guidance"
        ? { voice_guidance: next.voice_guidance }
        : { live_captions: next.live_captions };
    await supabase.from("user_preferences").update(payload).eq("user_id", user.id);
  }

  return (
    <DashboardShell title="Accessibility Assistant">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader eyebrow="Route" title="Accessible path" />
          {!routes.isSupabaseConfigured ? (
            <NotConfiguredBlock what="accessible routes" />
          ) : routes.loading ? (
            <LoadingBlock label="Loading routes…" />
          ) : !accessibleRoute ? (
            <EmptyBlock label="No accessible route configured yet." />
          ) : (
            <>
              <div className="flex items-center gap-3 rounded-lg border border-[var(--arena-cyan)]/25 bg-[var(--arena-cyan)]/8 p-4">
                <Accessibility size={20} className="shrink-0 text-[var(--arena-cyan)]" />
                <p className="text-sm leading-relaxed text-[var(--arena-white)]">
                  {accessibleRoute.description ?? accessibleRoute.label}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2 font-mono text-xs text-[var(--arena-fog)]">
                <Clock size={13} /> {accessibleRoute.eta_minutes} min · {accessibleRoute.crowd_level} crowd
              </div>
              <Button href="/dashboard/navigation" variant="secondary" className="mt-4">
                Open in navigation
              </Button>
            </>
          )}
        </Card>

        <Card>
          <CardHeader eyebrow="Settings" title="Assistive tools" />
          {!isSupabaseConfigured ? (
            <NotConfiguredBlock what="your saved preferences" />
          ) : authLoading ? (
            <LoadingBlock label="Checking your session…" />
          ) : !user ? (
            <EmptyBlock label="Log in to save your accessibility preferences." />
          ) : loadingPrefs ? (
            <LoadingBlock label="Loading preferences…" />
          ) : !prefs ? (
            <EmptyBlock label="No preferences found for your account yet." />
          ) : (
            <div className="flex flex-col gap-4">
              <ToggleRow
                icon={Volume2}
                label="Voice guidance"
                description="Spoken turn-by-turn directions"
                on={prefs.voice_guidance}
                onToggle={() => toggle("voice_guidance")}
              />
              <ToggleRow
                icon={Captions}
                label="Live captions"
                description="Captions for announcements"
                on={prefs.live_captions}
                onToggle={() => toggle("live_captions")}
              />
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
