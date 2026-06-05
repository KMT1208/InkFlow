import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";

// Classes d'un bouton, réutilisables aussi sur un <Link> (boutons-liens).
export function buttonClass(variant: Variant = "primary", className?: string) {
  const base =
    "inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/50 disabled:pointer-events-none disabled:opacity-60";
  const variants: Record<Variant, string> = {
    primary: "bg-ink text-white hover:bg-ink-dark",
    outline: "border border-line text-bone hover:bg-surface-2",
    ghost: "text-bone-dim hover:text-bone",
  };
  return cn(base, variants[variant], className);
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}
