// Types métier partagés. Tant que les types Supabase ne sont pas générés
// (via `npx supabase gen types typescript` une fois la migration appliquée),
// on décrit ici les lignes manipulées. Aligné sur supabase/migrations/0001_init.sql.

export type DepositType = "fixed" | "percent";
export type SubscriptionPlan = "solo" | "studio";

// Tenant : un tatoueur (1 ligne par utilisateur Supabase).
export type Artist = {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  bio: string | null;
  city: string | null;
  country: string;
  avatar_url: string | null;
  logo_url: string | null;
  cover_url: string | null;
  instagram: string | null;
  tiktok: string | null;
  website: string | null;
  theme: string;
  currency: string; // ex. "eur"
  deposit_type: DepositType;
  deposit_value: number; // centimes si "fixed", 0-100 si "percent"
  deposit_refundable: boolean;
  stripe_account_id: string | null;
  stripe_customer_id: string | null;
  subscription_plan: SubscriptionPlan | null;
  subscription_status: string | null;
  trial_ends_at: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

// Colonnes sûres exposées publiquement (vue artist_public) pour le mini-site.
export type ArtistPublic = Pick<
  Artist,
  | "id"
  | "slug"
  | "display_name"
  | "bio"
  | "city"
  | "country"
  | "avatar_url"
  | "logo_url"
  | "cover_url"
  | "instagram"
  | "tiktok"
  | "website"
  | "theme"
  | "currency"
  | "deposit_type"
  | "deposit_value"
  | "deposit_refundable"
>;
