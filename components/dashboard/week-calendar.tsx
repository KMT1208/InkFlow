"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const START_HOUR = 9;
const END_HOUR = 20;
const ROW = 56; // px par heure
const HOURS = Array.from(
  { length: END_HOUR - START_HOUR },
  (_, i) => START_HOUR + i,
);

type Ev = {
  day: number; // 0 = lundi
  start: number;
  end: number;
  kind: "rdv" | "block";
  title: string;
  sub?: string;
};

// Événements de démonstration (récurrents sur la semaine affichée).
const EVENTS: Ev[] = [
  { day: 1, start: 11, end: 12.5, kind: "rdv", title: "Manon V.", sub: "Lettrage" },
  { day: 3, start: 15, end: 18, kind: "rdv", title: "Hugo P.", sub: "Custom — dos" },
  { day: 4, start: 13, end: 14, kind: "block", title: "Pause déj." },
  { day: 5, start: 14, end: 17, kind: "rdv", title: "Aïssa M.", sub: "Serpent & pivoine" },
  { day: 6, start: START_HOUR, end: END_HOUR, kind: "block", title: "Fermé" },
];

function mondayOf(d: Date) {
  const x = new Date(d);
  const dow = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - dow);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

const fmtDay = new Intl.DateTimeFormat("fr-FR", { day: "numeric" });
const fmtRange = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });

export function WeekCalendar() {
  const [offset, setOffset] = useState(0);
  const weekStart = addDays(mondayOf(new Date()), offset * 7);
  const weekEnd = addDays(weekStart, 6);
  const todayKey = new Date().toDateString();

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
        <div className="hidden items-center gap-4 text-xs text-bone-dim sm:flex">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-ink/40" /> RDV
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-surface-2" /> Bloqué
          </span>
        </div>
      </div>

      {/* Grille */}
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          {/* En-têtes de jours */}
          <div className="grid grid-cols-[3.5rem_repeat(7,1fr)] border-b border-line">
            <div />
            {DAYS.map((d, i) => {
              const date = addDays(weekStart, i);
              const isToday = date.toDateString() === todayKey;
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
                {EVENTS.filter((e) => e.day === dayIdx).map((e, i) => (
                  <div
                    key={i}
                    style={{
                      top: (e.start - START_HOUR) * ROW + 2,
                      height: (e.end - e.start) * ROW - 4,
                    }}
                    className={cn(
                      "absolute left-1 right-1 overflow-hidden rounded-lg border p-2 text-xs leading-tight",
                      e.kind === "rdv"
                        ? "border-ink/40 bg-ink/15 text-bone"
                        : "border-line bg-surface-2 text-bone-dim [background-image:repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(255,255,255,0.03)_6px,rgba(255,255,255,0.03)_12px)]",
                    )}
                  >
                    <p className="font-medium">{e.title}</p>
                    {e.sub && <p className="truncate text-bone-dim">{e.sub}</p>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
