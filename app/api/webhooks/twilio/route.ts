import { NextResponse, type NextRequest } from "next/server";
import twilio from "twilio";
import { getSiteUrl } from "@/lib/site";

// Webhook de statut de livraison Twilio (delivered / failed / undelivered).
// La signature est vérifiée. L'opt-out STOP est géré automatiquement par le
// Messaging Service (advanced opt-out) côté Twilio.
export async function POST(request: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    return NextResponse.json({ error: "non configuré" }, { status: 503 });
  }

  const signature = request.headers.get("x-twilio-signature") ?? "";
  const form = await request.formData();
  const params: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    params[key] = typeof value === "string" ? value : "";
  }

  const url = `${getSiteUrl()}/api/webhooks/twilio`;
  if (!twilio.validateRequest(authToken, signature, url, params)) {
    return NextResponse.json({ error: "signature invalide" }, { status: 403 });
  }

  console.log(
    "Twilio status:",
    params.MessageStatus ?? "?",
    params.MessageSid ?? "?",
  );

  return new NextResponse(null, { status: 204 });
}
