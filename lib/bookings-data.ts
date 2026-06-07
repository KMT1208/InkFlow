import "server-only";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  DEMO_BOOKINGS,
  getDemoBooking,
  type DemoBooking,
  type DemoBookingStatus,
} from "@/lib/demo";

export type BookingListItem = {
  id: string;
  clientName: string;
  project: string;
  bodyZone: string | null;
  budget: string | null;
  references: number;
  status: DemoBookingStatus;
  createdLabel: string;
};

export type BookingDetailView = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectType: "flash" | "custom";
  description: string | null;
  bodyZone: string | null;
  size: string | null;
  budget: string | null;
  preferredDate: string | null;
  references: number;
  status: DemoBookingStatus;
  createdLabel: string;
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "à l'instant";
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "hier";
  if (d < 7) return `il y a ${d} j`;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(
    new Date(iso),
  );
}

type Row = Record<string, unknown>;

function text(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

function demoListItem(b: DemoBooking): BookingListItem {
  return {
    id: b.id,
    clientName: b.client_name,
    project: b.project,
    bodyZone: b.body_zone,
    budget: b.budget,
    references: b.references,
    status: b.status,
    createdLabel: b.created,
  };
}

function demoDetail(b: DemoBooking): BookingDetailView {
  return {
    id: b.id,
    clientName: b.client_name,
    clientEmail: b.client_email,
    clientPhone: b.client_phone,
    projectType: b.projectType,
    description: b.description,
    bodyZone: b.body_zone,
    size: b.size,
    budget: b.budget,
    preferredDate: b.preferredDate,
    references: b.references,
    status: b.status,
    createdLabel: b.created,
  };
}

function rowListItem(r: Row): BookingListItem {
  const ps = (r.preferred_slots ?? {}) as { budget?: string | null };
  return {
    id: String(r.id),
    clientName: String(r.client_name ?? ""),
    project: r.project_type === "flash" ? "Flash" : "Projet personnalisé",
    bodyZone: text(r.body_zone),
    budget: ps.budget ?? null,
    references: Array.isArray(r.reference_paths) ? r.reference_paths.length : 0,
    status: (r.status as DemoBookingStatus) ?? "nouvelle",
    createdLabel: relativeTime(String(r.created_at)),
  };
}

function rowDetail(r: Row): BookingDetailView {
  const ps = (r.preferred_slots ?? {}) as {
    budget?: string | null;
    preferredDate?: string | null;
  };
  return {
    id: String(r.id),
    clientName: String(r.client_name ?? ""),
    clientEmail: String(r.client_email ?? ""),
    clientPhone: String(r.client_phone ?? ""),
    projectType: r.project_type === "flash" ? "flash" : "custom",
    description: text(r.description),
    bodyZone: text(r.body_zone),
    size: text(r.size),
    budget: ps.budget ?? null,
    preferredDate: ps.preferredDate ?? null,
    references: Array.isArray(r.reference_paths) ? r.reference_paths.length : 0,
    status: (r.status as DemoBookingStatus) ?? "nouvelle",
    createdLabel: relativeTime(String(r.created_at)),
  };
}

// Liste des demandes du tableau de bord. Démo si Supabase absent, sinon les
// vraies demandes du tatoueur (la RLS ne renvoie que les siennes).
export async function getDashboardBookings(): Promise<{
  bookings: BookingListItem[];
  demo: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return { bookings: DEMO_BOOKINGS.map(demoListItem), demo: true };
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("booking_requests")
    .select(
      "id, client_name, project_type, body_zone, preferred_slots, reference_paths, status, created_at",
    )
    .order("created_at", { ascending: false });
  return { bookings: (data ?? []).map((r) => rowListItem(r as Row)), demo: false };
}

export async function getDashboardBooking(id: string): Promise<{
  booking: BookingDetailView;
  demo: boolean;
} | null> {
  if (!isSupabaseConfigured()) {
    const b = getDemoBooking(id);
    return b ? { booking: demoDetail(b), demo: true } : null;
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("booking_requests")
    .select(
      "id, client_name, client_email, client_phone, project_type, description, body_zone, size, preferred_slots, reference_paths, status, created_at",
    )
    .eq("id", id)
    .maybeSingle();
  return data ? { booking: rowDetail(data as Row), demo: false } : null;
}
