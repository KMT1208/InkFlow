import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";

const DAY_MS = 86_400_000;

// Crée les rappels J-7 / J-2 / jour J (SMS) pour un rendez-vous.
// À appeler à la planification/confirmation du rendez-vous. Les rappels déjà
// dépassés (ex. RDV dans 3 jours → pas de J-7) ne sont pas créés.
export async function scheduleReminders(appointmentId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const admin = createAdminClient();

  const { data: appt } = await admin
    .from("appointments")
    .select("id, artist_id, starts_at")
    .eq("id", appointmentId)
    .maybeSingle();
  if (!appt) return;

  const start = new Date(appt.starts_at as string).getTime();
  const plan: { type: string; offsetDays: number }[] = [
    { type: "j7", offsetDays: 7 },
    { type: "j2", offsetDays: 2 },
    { type: "jour_j", offsetDays: 0 },
  ];

  const rows = plan
    .map(({ type, offsetDays }) => ({
      artist_id: appt.artist_id,
      appointment_id: appt.id,
      type,
      channel: "sms",
      scheduled_for: new Date(start - offsetDays * DAY_MS).toISOString(),
      status: "pending",
    }))
    .filter((r) => new Date(r.scheduled_for).getTime() > Date.now());

  if (rows.length > 0) {
    await admin.from("reminders").insert(rows);
  }
}
