import type { ArtistPublic } from "@/lib/types";

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
