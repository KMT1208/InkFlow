"use server";

import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";
import {
  emailSchema,
  passwordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validation";

// État renvoyé aux formulaires (via useActionState) pour afficher les erreurs.
export type AuthState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[] | undefined>;
      message?: string;
    }
  | undefined;

// Message renvoyé si l'on tente de s'authentifier avant d'avoir configuré Supabase.
const NON_CONFIGURE: AuthState = {
  error: "L'authentification n'est pas encore configurée (voir SETUP.md).",
};

// Inscription d'un tatoueur (email + mot de passe + nom + slug).
export async function signUp(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) return NON_CONFIGURE;

  const parsed = signUpSchema.safeParse({
    displayName: formData.get("displayName"),
    slug: formData.get("slug"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { displayName, slug, email, password } = parsed.data;

  const supabase = await createClient();

  // Le slug (lien public) doit être unique : vérification avant création.
  const { data: existing } = await supabase
    .from("artists")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) {
    return {
      fieldErrors: { slug: ["Ce lien est déjà pris, choisissez-en un autre."] },
    };
  }

  // Les métadonnées (display_name, slug) servent au trigger SQL qui crée
  // automatiquement la ligne `artists` (voir la migration 0001_init.sql).
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/confirm?next=/dashboard`,
      data: { display_name: displayName, slug },
    },
  });
  if (error) {
    // Diagnostic temporaire : on expose le message brut de Supabase.
    return {
      error: `${traduireErreur(error.message)} — détail : ${error.message}`,
    };
  }

  // Si la confirmation par email est désactivée dans Supabase, la session est
  // immédiate → tableau de bord. Sinon, on invite à confirmer l'adresse.
  if (data.session) {
    redirect("/dashboard");
  }
  return {
    message:
      "Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse, puis connectez-vous.",
  };
}

// Connexion.
export async function signIn(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) return NON_CONFIGURE;

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: "Email ou mot de passe incorrect." };
  }
  redirect("/dashboard");
}

// Connexion / inscription par lien magique (sans mot de passe).
export async function signInWithMagicLink(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) return NON_CONFIGURE;

  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/confirm?next=/dashboard`,
      shouldCreateUser: true,
    },
  });

  // Anti-énumération : message identique que le compte existe ou non.
  return {
    message:
      "Si l'adresse est valide, un lien de connexion vient d'être envoyé. Vérifiez votre boîte mail.",
  };
}

// Connexion / inscription via Google (OAuth, flux PKCE).
export async function signInWithGoogle(): Promise<void> {
  if (!isSupabaseConfigured()) redirect("/connexion?erreur=indisponible");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${getSiteUrl()}/auth/confirm?next=/dashboard` },
  });

  if (error || !data?.url) {
    redirect("/connexion?erreur=lien-invalide");
  }
  // Redirige vers l'écran de consentement Google ; le retour passe par /auth/confirm.
  redirect(data.url);
}

// Déconnexion (utilisée par un <form> dans le tableau de bord).
export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/connexion");
}

// Demande de réinitialisation du mot de passe (envoi de l'email).
export async function requestPasswordReset(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) return NON_CONFIGURE;

  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getSiteUrl()}/auth/confirm?next=/nouveau-mot-de-passe`,
  });

  // Anti-énumération : on ne révèle jamais si l'adresse a un compte.
  return {
    message:
      "Si un compte existe pour cette adresse, un email de réinitialisation vient d'être envoyé.",
  };
}

// Définition d'un nouveau mot de passe (après clic sur le lien de réinit.).
export async function updatePassword(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) return NON_CONFIGURE;

  const parsed = passwordSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return { error: traduireErreur(error.message) };
  }
  redirect("/dashboard");
}

// Traduit les messages d'erreur Supabase les plus courants.
function traduireErreur(message: string): string {
  if (message.includes("already registered"))
    return "Un compte existe déjà avec cet email.";
  if (message.toLowerCase().includes("password"))
    return "Mot de passe trop faible (8 caractères minimum).";
  return "Une erreur est survenue. Veuillez réessayer.";
}
