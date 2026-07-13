"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingBlock, EmptyBlock } from "@/components/dashboard/DataState";
import { useRealtimeList } from "@/hooks/useSupabaseData";
import type { Match, WeatherSnapshot } from "@/lib/supabase/types";
import { Trophy, CloudSun, Wind, Droplets } from "lucide-react";

export function MatchWeatherWidget() {
  const matches = useRealtimeList<Match>("matches", { orderBy: "starts_at", ascending: false });
  const weather = useRealtimeList<WeatherSnapshot>("weather_snapshots", {
    orderBy: "recorded_at",
    ascending: false,
    limit: 1,
  });

  const current = matches.data.find((m) => m.status === "live" || m.status === "halftime") ?? matches.data[0];
  const latestWeather = weather.data[0];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <Card>
        <CardHeader eyebrow="Live" title="Match overview" action={<Trophy size={16} className="text-[var(--arena-amber)]" />} />
        {matches.loading ? (
          <LoadingBlock label="Loading match…" />
        ) : !current ? (
          <EmptyBlock label="No match scheduled." />
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-lg font-semibold text-[var(--arena-white)]">
                {current.home_team} {current.score_home} – {current.score_away} {current.away_team}
              </p>
              {current.venue_section && (
                <p className="mt-1 text-xs text-[var(--arena-fog)]">{current.venue_section}</p>
              )}
            </div>
            <Badge tone={current.status === "live" ? "red" : "neutral"}>{current.status}</Badge>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader eyebrow="Live" title="Weather" action={<CloudSun size={16} className="text-[var(--arena-blue)]" />} />
        {weather.loading ? (
          <LoadingBlock label="Loading weather…" />
        ) : !latestWeather ? (
          <EmptyBlock label="No weather data." />
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-lg font-semibold text-[var(--arena-white)]">
                {latestWeather.temp_c}°C · {latestWeather.condition}
              </p>
              <div className="mt-1 flex items-center gap-3 font-mono text-[11px] text-[var(--arena-fog)]">
                <span className="flex items-center gap-1">
                  <Wind size={11} /> {latestWeather.wind_kph} km/h
                </span>
                <span className="flex items-center gap-1">
                  <Droplets size={11} /> {latestWeather.precipitation_pct}%
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
