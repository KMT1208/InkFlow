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
  image_url: string | null;
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
  { id: "1", title: "Serpent & pivoine", description: "Blackwork, ombrage doux.", size: "15 cm", placements: ["avant-bras", "mollet"], price: 18000, image_url: null },
  { id: "2", title: "Dague fine line", description: "Trait fin, minimaliste.", size: "8 cm", placements: ["bras", "côtes"], price: 9000, image_url: null },
  { id: "3", title: "Phalène", description: "Papillon de nuit, symétrique.", size: "12 cm", placements: ["dos", "sternum"], price: 14000, image_url: null },
  { id: "4", title: "Main de Fatma", description: "Motifs ornementaux.", size: "10 cm", placements: ["avant-bras"], price: 12000, image_url: null },
  { id: "5", title: "Roses & barbelés", description: "Old school revisité.", size: "18 cm", placements: ["cuisse", "bras"], price: 22000, image_url: null },
  { id: "6", title: "Lune & croissant", description: "Points & lignes fines.", size: "6 cm", placements: ["poignet", "cheville"], price: 7000, image_url: null },
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
  | "acompte_attendu"
  | "acompte_paye"
  | "confirmee"
  | "terminee"
  | "annulee"
  | "refusee";

export type DemoBooking = {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  project: string;
  projectType: "flash" | "custom";
  description: string;
  body_zone: string;
  size: string;
  budget: string;
  references: number; // nb d'images jointes (placeholders en démo)
  preferredDate: string;
  status: DemoBookingStatus;
  created: string;
};

export const DEMO_BOOKINGS: DemoBooking[] = [
  { id: "b1", client_name: "Aïssa M.", client_email: "aissa.m@example.com", client_phone: "06 12 34 56 78", project: "Custom — serpent & pivoine", projectType: "custom", description: "Un serpent enroulé autour d'une pivoine, style blackwork avec ombrage doux. Plutôt vertical, sur l'avant-bras intérieur.", body_zone: "avant-bras", size: "15 cm", budget: "300–400 €", references: 3, preferredDate: "Samedis de juin", status: "acompte_paye", created: "il y a 2 h" },
  { id: "b2", client_name: "Tom R.", client_email: "tom.r@example.com", client_phone: "06 98 76 54 32", project: "Flash — dague fine line", projectType: "flash", description: "Intéressé par le flash « dague fine line », tel quel.", body_zone: "bras", size: "8 cm", budget: "90 €", references: 1, preferredDate: "Flexible", status: "nouvelle", created: "il y a 5 h" },
  { id: "b3", client_name: "Léa B.", client_email: "lea.b@example.com", client_phone: "07 11 22 33 44", project: "Custom — pièce florale", projectType: "custom", description: "Grande composition florale dans le dos, fines lignes, beaucoup de détails.", body_zone: "dos", size: "30 cm", budget: "600 € et +", references: 5, preferredDate: "Courant juillet", status: "devis_envoye", created: "hier" },
  { id: "b4", client_name: "Karim D.", client_email: "karim.d@example.com", client_phone: "06 55 66 77 88", project: "Flash — phalène", projectType: "flash", description: "Le flash phalène, centré sur le sternum.", body_zone: "sternum", size: "12 cm", budget: "140 €", references: 0, preferredDate: "Week-ends", status: "nouvelle", created: "hier" },
  { id: "b5", client_name: "Manon V.", client_email: "manon.v@example.com", client_phone: "07 99 88 77 66", project: "Custom — lettrage", projectType: "custom", description: "Lettrage fin sur la clavicule : une date en chiffres romains.", body_zone: "clavicule", size: "6 cm", budget: "200 €", references: 2, preferredDate: "24 juin si possible", status: "confirmee", created: "il y a 2 j" },
];

export function getDemoBooking(id: string): DemoBooking | null {
  return DEMO_BOOKINGS.find((b) => b.id === id) ?? null;
}

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
