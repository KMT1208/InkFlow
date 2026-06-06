import "server-only";
import { Resend } from "resend";

// Email transactionnel via Resend. Server-only.
let cached: Resend | null = null;

function client(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY manquant.");
  if (!cached) cached = new Resend(key);
  return cached;
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

// Expéditeur : domaine à vérifier dans Resend (sinon les envois échouent).
const FROM = process.env.RESEND_FROM || "InkFlow <no-reply@inkflow.app>";

// Échappe les valeurs dynamiques injectées dans le HTML de l'email.
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layout(bodyHtml: string): string {
  return `<div style="background:#f4f1ea;padding:32px 0;font-family:Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e4da;">
      <tr><td style="background:#0b0b0c;padding:18px 28px;">
        <span style="color:#f4f1ea;font-size:20px;font-weight:700;letter-spacing:-0.02em;">Ink<span style="color:#e5302a;">Flow</span></span>
      </td></tr>
      <tr><td style="padding:28px;">${bodyHtml}</td></tr>
      <tr><td style="padding:0 28px 24px;color:#9a958c;font-size:12px;">Envoyé via InkFlow · la réservation pensée pour les tatoueurs</td></tr>
    </table>
  </td></tr></table>
</div>`;
}

// Confirmation au client après réception de l'acompte. Best-effort : ne lève
// jamais (le webhook ne doit pas échouer si l'email échoue).
export async function sendBookingConfirmation(params: {
  to: string;
  studioName: string;
  clientName?: string | null;
  depositLabel?: string;
}): Promise<void> {
  if (!isResendConfigured()) return;

  const studio = esc(params.studioName);
  const hello = params.clientName ? `Bonjour ${esc(params.clientName)},` : "Bonjour,";
  const deposit = params.depositLabel
    ? ` de <strong>${esc(params.depositLabel)}</strong>`
    : "";

  const body = `
    <h1 style="margin:0 0 12px;font-size:22px;color:#0b0b0c;">Rendez-vous confirmé</h1>
    <p style="margin:0 0 12px;color:#444;line-height:1.6;font-size:15px;">${hello}</p>
    <p style="margin:0 0 12px;color:#444;line-height:1.6;font-size:15px;">Votre acompte${deposit} a bien été reçu. Votre rendez-vous chez <strong>${studio}</strong> est confirmé — vous recevrez un rappel avant la séance.</p>
    <p style="margin:0;color:#444;line-height:1.6;font-size:15px;">À très vite&nbsp;!</p>`;

  try {
    const { error } = await client().emails.send({
      from: FROM,
      to: params.to,
      subject: `Votre rendez-vous chez ${params.studioName} est confirmé`,
      html: layout(body),
    });
    if (error) console.error("Resend (confirmation) error:", error);
  } catch (err) {
    console.error("Resend (confirmation) exception:", err);
  }
}

// Lien de paiement d'acompte envoyé au client (quand le tatoueur le demande).
export async function sendDepositRequest(params: {
  to: string;
  studioName: string;
  url: string;
  amountLabel: string;
}): Promise<void> {
  if (!isResendConfigured()) return;

  const studio = esc(params.studioName);
  const amount = esc(params.amountLabel);
  const href = esc(params.url);

  const body = `
    <h1 style="margin:0 0 12px;font-size:22px;color:#0b0b0c;">Réservez votre séance</h1>
    <p style="margin:0 0 12px;color:#444;line-height:1.6;font-size:15px;">Pour confirmer votre rendez-vous chez <strong>${studio}</strong>, il reste à régler l'acompte de <strong>${amount}</strong>.</p>
    <p style="margin:0 0 20px;color:#444;line-height:1.6;font-size:15px;">Paiement sécurisé par Stripe.</p>
    <a href="${href}" style="display:inline-block;background:#e5302a;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:999px;">Payer l'acompte (${amount})</a>
    <p style="margin:18px 0 0;color:#9a958c;font-size:12px;">Sans acompte, le créneau n'est pas confirmé.</p>`;

  try {
    const { error } = await client().emails.send({
      from: FROM,
      to: params.to,
      subject: `Votre acompte pour réserver chez ${params.studioName}`,
      html: layout(body),
    });
    if (error) console.error("Resend (acompte) error:", error);
  } catch (err) {
    console.error("Resend (acompte) exception:", err);
  }
}
