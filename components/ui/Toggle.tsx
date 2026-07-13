import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

export function ToggleRow({
  icon: Icon,
  label,
  description,
  on,
  onToggle,
}: {
  icon?: LucideIcon;
  label: string;
  description?: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--arena-line)] bg-[var(--arena-navy)] p-3.5">
      <div className="flex items-center gap-3">
        {Icon && <Icon size={17} className="text-[var(--arena-fog)]" />}
        <div>
          <p className="text-sm font-medium text-[var(--arena-white)]">{label}</p>
          {description && <p className="text-xs text-[var(--arena-fog)]">{description}</p>}
        </div>
      </div>
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={on}
        aria-label={label}
        className={clsx(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          on ? "bg-[var(--arena-amber)]" : "bg-[var(--arena-line)]"
        )}
      >
        <span
          className={clsx(
            "absolute top-1 h-4 w-4 rounded-full bg-white transition-transform",
            on ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
}
