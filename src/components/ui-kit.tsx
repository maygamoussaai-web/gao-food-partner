import { Link } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";

import { GaoDots } from "@/components/loader";

const base =
  "press inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold tracking-tight disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97]";

const variants = {
  primary:
    "gradient-primary text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-105",
  night: "gradient-night text-night-foreground shadow-[var(--shadow-card)] hover:brightness-110",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  outline: "border border-border bg-card/70 text-foreground backdrop-blur hover:bg-muted",
  danger: "bg-destructive text-destructive-foreground hover:brightness-110",
} as const;

const sizes = {
  sm: "h-9 px-3",
  md: "h-11 px-4",
  lg: "h-12 px-5 text-base",
  icon: "h-10 w-10",
} as const;

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  children,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size; loading?: boolean }) {
  return (
    <button
      className={buttonClass(variant, size, className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <GaoDots /> : null}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

export function Card({
  children,
  className = "",
  highlight = false,
}: {
  children: ReactNode;
  className?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`${highlight ? "card-highlight" : "card-surface"} p-4 ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitre({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {children}
      </h2>
      {action}
    </div>
  );
}
