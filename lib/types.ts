// Types métier partagés. Tant que les types Supabase ne sont pas générés
// (étape ultérieure via la CLI), on décrit ici les lignes qu'on manipule.

export type Artist = {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  bio: string | null;
  city: string | null;
  avatar_url: string | null;
  instagram: string | null;
  tiktok: string | null;
  deposit_amount: number; // montant de l'acompte, EN CENTIMES
  currency: string; // ex. "eur"
  created_at: string;
};
