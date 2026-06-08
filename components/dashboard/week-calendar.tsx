"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarAppt } from "@/lib/dashboard-data";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const START_HOUR = 9;
const END_HOUR = 20;
const ROW = 56; // px par heure
const DAY_MS = 86_400_000;
const HOURS = Array.from(
  { length: END_HOUR - START_HOUR },
  (_, i) => START_HOUR + i,
);

// Tout est raisonné en UTC : les rendez-vous sont stockés/affichés en UTC pour
// rester cohérents (saisie = affichage). TODO post-MVP : vrai fuseau Europe/Paris.
function mondayOfUTC(d: Date): Date {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = (x.getUTCDay() + 6) % 7;
  x.setUTCDate(x.getUTCDate() - dow);
  return x;
}
function addDaysUTC(d: Date, n: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}
function ymd(d: Date): string {
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
}

const fmtDay = new Intl.DateTimeFormat("fr-FR", { day: "numeric", timeZone: "UTC" });
const fmtRange = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});
const fmtTime = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

export function WeekCalendar({ appointments }: { appointments: CalendarAppt[] }) {
  const [offset, setOffset] = useState(0);
  const weekStart = addDaysUTC(mondayOfUTC(new Date()), offset * 7);
  const weekEnd = addDaysUTC(weekStart, 6);
  const todayKey = ymd(new Date());

  // Place chaque rendez-vous dans la semaine affichée (index de jour + heures).
  const placed = appointments
    .map((a) => {
      const s = new Date(a.startsAt);
      const e = new Date(a.endsAt);
      const dayStart = Date.UTC(
        s.getUTCFullYear(),
        s.getUTCMonth(),
        s.getUTCDate(),
      );
      const dayIdx = Math.round((dayStart - weekStart.getTime()) / DAY_MS);
      const startH = s.getUTCHours() + s.getUTCMinutes() / 60;
      const endH = e.getUTCHours() + e.getUTCMinutes() / 60;
      return { ...a, dayIdx, startH, endH, s, e };
    })
    .filter(
      (p) =>
        p.dayIdx >= 0 &&
        p.dayIdx < 7 &&
        p.endH > START_HOUR &&
        p.startH < END_HOUR,
    );

  return (
    <div className="rounded-2xl border border-line bg-surface/40">
      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOffset((o) => o - 1)}
            aria-label="Semaine précédente"
            className="grid h-8 w-8 place-items-center rounded-lg border border-line text-bone-dim transition-colors hover:bg-surface-2 hover:text-bone"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setOffset((o) => o + 1)}
            aria-label="Semaine suivante"
            className="grid h-8 w-8 place-items-center rounded-lg border border-line text-bone-dim transition-colors hover:bg-surface-2 hover:text-bone"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setOffset(0)}
            className="ml-1 rounded-lg border border-line px-3 py-1.5 text-sm text-bone-dim transition-colors hover:bg-surface-2 hover:text-bone"
          >
            Aujourd&apos;hui
          </button>
        </div>
        <p className="font-serif text-lg text-bone">
          {fmtRange.format(weekStart)} – {fmtRange.format(weekEnd)}
        </p>
        <span className="hidden items-center gap-1.5 text-xs text-bone-dim sm:flex">
          <span className="h-2.5 w-2.5 rounded-sm bg-ink/40" /> Rendez-vous
        </span>
      </div>

      {/* Grille */}
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          {/* En-têtes de jours */}
          <div className="grid grid-cols-[3.5rem_repeat(7,1fr)] border-b border-line">
            <div />
            {DAYS.map((d, i) => {
              const date = addDaysUTC(weekStart, i);
              const isToday = ymd(date) === todayKey;
              return (
                <div key={d} className="border-l border-line px-2 py-2 text-center">
                  <p className="text-xs text-bone-dim">{d}</p>
                  <p
                    className={cn(
                      "mx-auto mt-0.5 grid h-7 w-7 place-items-center rounded-full text-sm",
                      isToday ? "bg-ink text-white" : "text-bone",
                    )}
                  >
                    {fmtDay.format(date)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Corps */}
          <div className="grid grid-cols-[3.5rem_repeat(7,1fr)]">
            {/* Gouttière des heures */}
            <div>
              {HOURS.map((h) => (
                <div key={h} style={{ height: ROW }} className="relative">
                  <span className="absolute -top-2 right-2 text-[11px] text-bone-dim">
                    {h}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Colonnes des jours */}
            {DAYS.map((_, dayIdx) => (
              <div
                key={dayIdx}
                className="relative border-l border-line"
                style={{ height: ROW * HOURS.length }}
              >
                {HOURS.map((h) => (
                  <div key={h} style={{ height: ROW }} className="border-t border-line/40" />
                ))}
                {placed
                  .filter((e) => e.dayIdx === dayIdx)
                  .map((e) => {
                    const top = (Math.max(e.startH, START_HOUR) - START_HOUR) * ROW;
                    const bottom = (Math.min(e.endH, END_HOUR) - START_HOUR) * ROW;
                    return (
                      <div
                        key={e.id}
                        style={{ top: top + 2, height: Math.max(bottom - top - 4, 18) }}
                        className="absolute left-1 right-1 overflow-hidden rounded-lg border border-ink/40 bg-ink/15 p-2 text-xs leading-tight text-bone"
                      >
                        <p className="font-medium">{e.title}</p>
                        <p className="truncate text-bone-dim">
                          {fmtTime.format(e.s)}
                          {e.sub ? ` · ${e.sub}` : ""}
                        </p>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
