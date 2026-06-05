import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Route de confirmation des liens email (confirmation d'inscription ET
// réinitialisation de mot de passe). Supabase redirige ici avec un token_hash ;
// on le vérifie, ce qui ouvre la session, puis on redirige vers `next`.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";
  const code = searchParams.get("code");

  // Flux OAuth (Google) : échange du code PKCE contre une session.
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    return NextResponse.redirect(
      new URL("/connexion?erreur=lien-invalide", request.url),
    );
  }

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Lien manquant, expiré ou invalide.
  return NextResponse.redirect(
    new URL("/connexion?erreur=lien-invalide", request.url),
  );
}
