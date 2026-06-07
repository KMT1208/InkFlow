import "server-only";
import twilio from "twilio";

// Client SMS Twilio. Server-only.
let cached: ReturnType<typeof twilio> | null = null;

function getClient(): ReturnType<typeof twilio> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error("Twilio non configuré.");
  if (!cached) cached = twilio(sid, token);
  return cached;
}

export function isTwilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_MESSAGING_SERVICE_SID,
  );
}

// Envoi via le Messaging Service (expéditeur alphanumérique FR + opt-out STOP
// gérés côté Twilio). Best-effort : renvoie true si l'envoi a réussi.
export async function sendSms(params: { to: string; body: string }): Promise<boolean> {
  if (!isTwilioConfigured()) return false;
  try {
    await getClient().messages.create({
      messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
      to: params.to,
      body: params.body,
    });
    return true;
  } catch (err) {
    console.error("Twilio sendSms error:", err);
    return false;
  }
}
