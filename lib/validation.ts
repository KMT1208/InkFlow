import * as z from "zod";

// Le « slug » est l'identifiant dans l'URL publique : inkflow.app/<slug>.
export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, { error: "Le lien doit faire au moins 3 caractères." })
  .max(40, { error: "Le lien doit faire au plus 40 caractères." })
  .regex(/^[a-z0-9-]+$/, {
    error: "Uniquement minuscules, chiffres et tirets (ex. alex-ink).",
  });

export const signUpSchema = z.object({
  displayName: z.string().trim().min(2, { error: "Indiquez votre nom ou blaze." }),
  slug: slugSchema,
  email: z.email({ error: "Adresse email invalide." }).trim(),
  password: z.string().min(8, { error: "Au moins 8 caractères." }),
});

export const signInSchema = z.object({
  email: z.email({ error: "Adresse email invalide." }).trim(),
  password: z.string().min(1, { error: "Mot de passe requis." }),
});

export const emailSchema = z.object({
  email: z.email({ error: "Adresse email invalide." }).trim(),
});

export const passwordSchema = z.object({
  password: z.string().min(8, { error: "Au moins 8 caractères." }),
});

// Slugs réservés : interdits à l'inscription (collision avec les routes plateforme).
export const RESERVED_SLUGS = new Set([
  "connexion",
  "inscription",
  "mot-de-passe-oublie",
  "nouveau-mot-de-passe",
  "dashboard",
  "auth",
  "api",
  "pricing",
  "tarifs",
  "fonctionnalites",
  "faq",
  "admin",
  "app",
  "www",
  "blog",
  "support",
  "aide",
  "legal",
  "cgu",
  "cgv",
  "confidentialite",
  "contact",
  "a-propos",
  "inkflow",
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}

// Demande de réservation (intake client) déposée depuis la page publique.
export const bookingRequestSchema = z.object({
  slug: slugSchema,
  projectType: z.enum(["flash", "custom"], { error: "Choisis un type de projet." }),
  flashId: z.string().max(64).optional(),
  description: z.string().max(2000).optional(),
  bodyZone: z.string().max(120).optional(),
  size: z.string().max(120).optional(),
  budget: z.string().max(120).optional(),
  preferredDate: z.string().max(160).optional(),
  clientName: z.string().trim().min(2, { error: "Ton nom est requis." }),
  clientEmail: z.email({ error: "Adresse email invalide." }).trim(),
  clientPhone: z.string().trim().max(40).optional(),
  consent: z.literal(true, { error: "Le consentement est obligatoire." }),
});
