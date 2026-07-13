import { ReactNode } from "react";
import clsx from "clsx";

export function Card({
  children,
  className,
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-[var(--arena-line)] bg-[var(--arena-panel)] p-5",
        glow && "shadow-[0_0_0_1px_rgba(245,166,35,0.15),0_8px_30px_-10px_rgba(245,166,35,0.25)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--arena-fog)]">
            {eyebrow}
          </p>
        )}
        <h3 className="font-display text-xl font-semibold tracking-wide text-[var(--arena-white)]">
          {title}
        </h3>
      </div>
      {action}
    </div>
  );
}
