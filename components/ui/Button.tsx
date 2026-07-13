import { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[var(--arena-amber)] text-[#1a1206] hover:bg-[#ffb640] shadow-[0_8px_24px_-8px_rgba(245,166,35,0.55)]",
  secondary:
    "bg-transparent text-[var(--arena-white)] border border-[var(--arena-line)] hover:border-[var(--arena-fog)]",
  ghost: "bg-transparent text-[var(--arena-fog)] hover:text-[var(--arena-white)]",
  danger: "bg-[var(--arena-red)] text-white hover:brightness-110",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-semibold text-sm transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--arena-amber)] disabled:opacity-50 disabled:pointer-events-none";

export function Button({
  children,
  variant = "primary",
  className,
  href,
  ...props
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  href?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = clsx(base, VARIANTS[variant], className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
