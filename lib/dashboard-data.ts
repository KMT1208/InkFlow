import "server-only";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  DEMO_APPOINTMENTS,
  DEMO_BOOKINGS,
  DEMO_STATS,
  type DemoBookingStatus,
} from "@/lib/demo";

const DAY_MS = 86_400_000;

// ── Vue d'ensemble (accueil dashboard) ────────────────────────────────────
export type OverviewStats = {
  revenueMonth: number; // centimes
  newRequests: number;
  upcoming: number;
  requestsMonth: number;
};
export type RecentBooking = {
  id: string;
  clientName: string;
  project: string;
  status: DemoBookingStatus;
};
export type UpcomingAppointment = {
  id: string;
  client: string;
  whenLabel: string;
  deposit: number | null;
  total: number | null;
};

// Affiche start/end en UTC (cohérent avec le stockage des rendez-vous).
function fmtWhen(startISO: string, endISO: string): string {
  const s = new Date(startISO);
  const e = new Date(endISO);
  const day = new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(s);
  const time = (d: Date) =>
    new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }).format(d);
  return `${day} · ${time(s)} – ${time(e)}`;
}

function relName(rel: unknown): string {
  const r = Array.isArray(rel) ? rel[0] : rel;
  const name = (r as { client_name?: string } | null)?.client_name;
  return name && name.length > 0 ? name : "Client";
}

export async function getDashboardOverview(): Promise<{
  stats: OverviewStats;
  recent: RecentBooking[];
  upcoming: UpcomingAppointment[];
  demo: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return {
      stats: {
        revenueMonth: DEMO_STATS.revenueMonth,
        newRequests: DEMO_BOOKINGS.filter((b) => b.status === "nouvelle").length,
        upcoming: DEMO_APPOINTMENTS.length,
        requestsMonth: DEMO_BOOKINGS.length,
      },
      recent: DEMO_BOOKINGS.slice(0, 4).map((b) => ({
        id: b.id,
        clientName: b.client_name,
        project: b.project,
        status: b.status,
      })),
      upcoming: DEMO_APPOINTMENTS.map((a) => ({
        id: a.id,
        client: a.client,
        whenLabel: `${a.day} · ${a.time}`,
        deposit: a.deposit,
        total: a.total,
      })),
      demo: true,
    };
  }

  const supabase = await createClient();
  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  ).toISOString();
  const nowISO = now.toISOString();

  const [paymentsRes, bookingsRes, apptsRes, newCountRes, monthCountRes] =
    await Promise.all([
      supabase
        .from("payments")
        .select("amount, status")
        .eq("status", "succeeded")
        .gte("created_at", monthStart),
      supabase
        .from("booking_requests")
        .select("id, client_name, project_type, status")
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("appointments")
        .select(
          "id, starts_at, ends_at, deposit_amount, total_amount, booking_requests(client_name)",
        )
        .gte("starts_at", nowISO)
        .order("starts_at", { ascending: true })
        .limit(6),
      supabase
        .from("booking_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "nouvelle"),
      supabase
        .from("booking_requests")
        .select("id", { count: "exact", head: true })
        .gte("created_at", monthStart),
    ]);

  const revenueMonth = (paymentsRes.data ?? []).reduce(
    (sum, p) => sum + ((p.amount as number) ?? 0),
    0,
  );

  const recent: RecentBooking[] = (bookingsRes.data ?? []).map((b) => ({
    id: String(b.id),
    clientName: String(b.client_name ?? ""),
    project: b.project_type === "flash" ? "Flash" : "Projet personnalisé",
    status: (b.status as DemoBookingStatus) ?? "nouvelle",
  }));

  const upcoming: UpcomingAppointment[] = (apptsRes.data ?? []).map((a) => ({
    id: String(a.id),
    client: relName(a.booking_requests),
    whenLabel: fmtWhen(String(a.starts_at), String(a.ends_at)),
    deposit: (a.deposit_amount as number | null) ?? null,
    total: (a.total_amount as number | null) ?? null,
  }));

  return {
    stats: {
      revenueMonth,
      newRequests: newCountRes.count ?? 0,
      upcoming: upcoming.length,
      requestsMonth: monthCountRes.count ?? 0,
    },
    recent,
    upcoming,
    demo: false,
  };
}

// ── Calendrier ────────────────────────────────────────────────────────────
export type CalendarAppt = {
  id: string;
  startsAt: string;
  endsAt: string;
  title: string;
  sub: string | null;
};

function mondayOfUTC(d: Date): Date {
  const x = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  const dow = (x.getUTCDay() + 6) % 7; // 0 = lundi
  x.setUTCDate(x.getUTCDate() - dow);
  return x;
}

// Quelques rendez-vous de démonstration, calés sur la semaine en cours.
function demoCalendar(): CalendarAppt[] {
  const monday = mondayOfUTC(new Date());
  const make = (
    dayOffset: number,
    hour: number,
    durH: number,
    title: string,
    sub: string,
  ): CalendarAppt => {
    const s = new Date(monday);
    s.setUTCDate(s.getUTCDate() + dayOffset);
    s.setUTCHours(hour, 0, 0, 0);
    const e = new Date(s.getTime() + durH * 3_600_000);
    return {
      id: `${title}-${dayOffset}`,
      startsAt: s.toISOString(),
      endsAt: e.toISOString(),
      title,
      sub,
    };
  };
  return [
    make(0, 11, 1.5, "Manon V.", "Lettrage"),
    make(2, 15, 3, "Hugo P.", "Custom — dos"),
    make(4, 14, 3, "Aïssa M.", "Serpent & pivoine"),
  ];
}

export async function getCalendarAppointments(): Promise<{
  appointments: CalendarAppt[];
  demo: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return { appointments: demoCalendar(), demo: true };
  }

  const supabase = await createClient();
  const from = new Date(Date.now() - 30 * DAY_MS).toISOString();
  const to = new Date(Date.now() + 120 * DAY_MS).toISOString();

  const { data } = await supabase
    .from("appointments")
    .select("id, starts_at, ends_at, booking_requests(client_name, project_type)")
    .gte("starts_at", from)
    .lte("starts_at", to)
    .order("starts_at", { ascending: true });

  const appointments: CalendarAppt[] = (data ?? []).map((a) => {
    const rel = a.booking_requests as
      | { client_name?: string; project_type?: string }
      | { client_name?: string; project_type?: string }[]
      | null;
    const r = Array.isArray(rel) ? rel[0] : rel;
    return {
      id: String(a.id),
      startsAt: String(a.starts_at),
      endsAt: String(a.ends_at),
      title: r?.client_name ?? "Rendez-vous",
      sub: r?.project_type === "flash" ? "Flash" : "Projet personnalisé",
    };
  });

  return { appointments, demo: false };
}
