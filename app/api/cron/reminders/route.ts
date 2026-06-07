import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { sendSms } from "@/lib/sms";
import { sendReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

// Tâche planifiée : envoie les rappels dus. Protégée par CRON_SECRET (Vercel Cron
// l'envoie en `Authorization: Bearer …`). À brancher sur un planificateur.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  const qs = new URL(request.url).searchParams.get("secret");
  if (!secret || (auth !== `Bearer ${secret}` && qs !== secret)) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "non configuré" }, { status: 503 });
  }

  const admin = createAdminClient();
  const nowIso = new Date().toISOString();

  const { data: due } = await admin
    .from("reminders")
    .select("id, type, channel, appointment_id")
    .eq("status", "pending")
    .lte("scheduled_for", nowIso)
    .limit(100);

  let sent = 0;
  let failed = 0;

  for (const r of due ?? []) {
    const { data: appt } = await admin
      .from("appointments")
      .select("starts_at, booking_id, artist_id")
      .eq("id", r.appointment_id)
      .maybeSingle();
    if (!appt) {
      await admin.from("reminders").update({ status: "skipped" }).eq("id", r.id);
      continue;
    }

    const { data: booking } = await admin
      .from("booking_requests")
      .select("client_phone, client_email")
      .eq("id", appt.booking_id)
      .maybeSingle();
    const { data: artist } = await admin
      .from("artists")
      .select("display_name")
      .eq("id", appt.artist_id)
      .maybeSingle();

    const studio = (artist?.display_name as string) ?? "votre studio";
    const when = formatWhen(appt.starts_at as string);
    const lead =
      r.type === "j7" ? "dans une semaine" : r.type === "j2" ? "dans 2 jours" : "aujourd'hui";

    let ok = false;
    if (r.channel === "sms" && booking?.client_phone) {
      ok = await sendSms({
        to: booking.client_phone as string,
        body: `Rappel : votre rendez-vous chez ${studio} ${lead} (${when}). Repondez STOP pour ne plus recevoir de SMS.`,
      });
    } else if (r.channel === "email" && booking?.client_email) {
      await sendReminderEmail({
        to: booking.client_email as string,
        studioName: studio,
        whenLabel: when,
        lead,
      });
      ok = true;
    }

    await admin
      .from("reminders")
      .update({
        status: ok ? "sent" : "failed",
        sent_at: ok ? new Date().toISOString() : null,
      })
      .eq("id", r.id);

    if (ok) sent += 1;
    else failed += 1;
  }

  return NextResponse.json({ processed: (due ?? []).length, sent, failed });
}
