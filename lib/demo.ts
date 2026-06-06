import type { Artist, ArtistPublic } from "@/lib/types";

// Données de démonstration affichées sur la page publique tant que Supabase
// n'est pas configuré (permet de visualiser le mini-site sans backend).

export type PublicFlash = {
  id: string;
  title: string;
  description: string | null;
  size: string | null;
  placements: string[];
  price: number | null; // centimes
};

export const DEMO_ARTIST: ArtistPublic = {
  id: "demo",
  slug: "demo",
  display_name: "Black Lotus",
  bio: "Tatoueuse à Lyon — blackwork, fine line et compositions florales. Sur rendez-vous uniquement, acompte requis pour confirmer.",
  city: "Lyon",
  country: "FR",
  avatar_url: null,
  logo_url: null,
  cover_url: null,
  instagram: "blacklotus.ink",
  tiktok: null,
  website: null,
  theme: "editorial-sombre",
  currency: "eur",
  deposit_type: "percent",
  deposit_value: 30,
  deposit_refundable: false,
};

export const DEMO_FLASH: PublicFlash[] = [
  { id: "1", title: "Serpent & pivoine", description: "Blackwork, ombrage doux.", size: "15 cm", placements: ["avant-bras", "mollet"], price: 18000 },
  { id: "2", title: "Dague fine line", description: "Trait fin, minimaliste.", size: "8 cm", placements: ["bras", "côtes"], price: 9000 },
  { id: "3", title: "Phalène", description: "Papillon de nuit, symétrique.", size: "12 cm", placements: ["dos", "sternum"], price: 14000 },
  { id: "4", title: "Main de Fatma", description: "Motifs ornementaux.", size: "10 cm", placements: ["avant-bras"], price: 12000 },
  { id: "5", title: "Roses & barbelés", description: "Old school revisité.", size: "18 cm", placements: ["cuisse", "bras"], price: 22000 },
  { id: "6", title: "Lune & croissant", description: "Points & lignes fines.", size: "6 cm", placements: ["poignet", "cheville"], price: 7000 },
];

// ── Données de démo pour le tableau de bord (mode démonstration) ──────────
export const DEMO_DASHBOARD_ARTIST: Artist = {
  id: "demo",
  user_id: "demo",
  slug: "black-lotus",
  display_name: "Black Lotus",
  bio: "Tatoueuse à Lyon — blackwork & fine line.",
  city: "Lyon",
  country: "FR",
  avatar_url: null,
  logo_url: null,
  cover_url: null,
  instagram: "blacklotus.ink",
  tiktok: null,
  website: null,
  theme: "editorial-sombre",
  currency: "eur",
  deposit_type: "percent",
  deposit_value: 30,
  deposit_refundable: false,
  stripe_account_id: null,
  stripe_customer_id: null,
  subscription_plan: "studio",
  subscription_status: "trialing",
  trial_ends_at: null,
  onboarding_completed: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

export type DemoBookingStatus =
  | "nouvelle"
  | "devis_envoye"
  | "acompte_paye"
  | "confirmee";

export type DemoBooking = {
  id: string;
  client_name: string;
  project: string;
  body_zone: string;
  budget: string;
  status: DemoBookingStatus;
  created: string;
};

export const DEMO_BOOKINGS: DemoBooking[] = [
  { id: "b1", client_name: "Aïssa M.", project: "Custom — serpent & pivoine", body_zone: "avant-bras", budget: "300–400 €", status: "acompte_paye", created: "il y a 2 h" },
  { id: "b2", client_name: "Tom R.", project: "Flash — dague fine line", body_zone: "bras", budget: "90 €", status: "nouvelle", created: "il y a 5 h" },
  { id: "b3", client_name: "Léa B.", project: "Custom — pièce florale", body_zone: "dos", budget: "600 € et +", status: "devis_envoye", created: "hier" },
  { id: "b4", client_name: "Karim D.", project: "Flash — phalène", body_zone: "sternum", budget: "140 €", status: "nouvelle", created: "hier" },
  { id: "b5", client_name: "Manon V.", project: "Custom — lettrage", body_zone: "clavicule", budget: "200 €", status: "confirmee", created: "il y a 2 j" },
];

export type DemoAppointment = {
  id: string;
  client: string;
  day: string;
  time: string;
  deposit: number; // centimes
  total: number; // centimes
};

export const DEMO_APPOINTMENTS: DemoAppointment[] = [
  { id: "a1", client: "Aïssa M.", day: "Sam. 21 juin", time: "14:00 — 17:00", deposit: 8000, total: 32000 },
  { id: "a2", client: "Manon V.", day: "Mar. 24 juin", time: "11:00 — 12:30", deposit: 6000, total: 20000 },
  { id: "a3", client: "Hugo P.", day: "Jeu. 26 juin", time: "15:00 — 18:00", deposit: 9000, total: 36000 },
];

export const DEMO_STATS = {
  revenueMonth: 246000, // centimes
  bookingsWeek: 7,
  noShowRate: 4, // %
  fillRate: 78, // %
};
