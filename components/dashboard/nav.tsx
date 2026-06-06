"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Images,
  Inbox,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/demandes", label: "Demandes", icon: Inbox },
  { href: "/dashboard/calendrier", label: "Calendrier", icon: CalendarDays },
  { href: "/dashboard/flash", label: "Flashs", icon: Images },
  { href: "/dashboard/reglages", label: "Réglages", icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {items.map((it) => {
        const active = it.exact
          ? pathname === it.href
          : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-ink/15 text-bone"
                : "text-bone-dim hover:bg-surface-2 hover:text-bone",
            )}
          >
            <it.icon className="h-4 w-4" />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
