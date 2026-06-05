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
