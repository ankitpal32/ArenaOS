import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import clsx from "clsx";

export function StatWidget({
  label,
  value,
  icon: Icon,
  tone = "var(--arena-amber)",
  trend,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  tone?: string;
  trend?: { direction: "up" | "down"; value: string; good: boolean };
}) {
  return (
    <Card className="flex items-start justify-between">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--arena-fog)]">
          {label}
        </p>
        <p className="mt-2 font-display text-3xl font-bold text-[var(--arena-white)]">
          {value}
        </p>
        {trend && (
          <p
            className={clsx(
              "mt-1.5 inline-flex items-center gap-1 font-mono text-xs",
              trend.good ? "text-[var(--arena-green)]" : "text-[var(--arena-red)]"
            )}
          >
            {trend.direction === "up" ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {trend.value}
          </p>
        )}
      </div>
      {Icon && (
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ background: `${tone}1f`, color: tone }}
        >
          <Icon size={18} strokeWidth={2} />
        </div>
      )}
    </Card>
  );
}
