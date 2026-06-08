import "server-only";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { DEMO_FLASH } from "@/lib/demo";

// Flash tel qu'affiché dans le dashboard (gestion par le tatoueur).
export type FlashItem = {
  id: string;
  title: string;
  size: string | null;
  placements: string[];
  price: number | null; // centimes
  imageUrl: string | null;
  isAvailable: boolean;
};

// Liste des flashs du tatoueur connecté (RLS = ses flashs uniquement).
// Sans Supabase configuré : renvoie la galerie de démonstration.
export async function getDashboardFlash(): Promise<{
  flash: FlashItem[];
  demo: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return {
      flash: DEMO_FLASH.map((f, i) => ({
        id: f.id,
        title: f.title,
        size: f.size,
        placements: f.placements,
        price: f.price,
        imageUrl: f.image_url,
        // En démo, on montre le dernier flash comme « non réservable ».
        isAvailable: i !== DEMO_FLASH.length - 1,
      })),
      demo: true,
    };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("flash")
    .select("id, title, size, placements, price, image_url, is_available")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  const flash: FlashItem[] = (data ?? []).map((r) => ({
    id: String(r.id),
    title: String(r.title ?? ""),
    size: (r.size as string | null) ?? null,
    placements: Array.isArray(r.placements) ? (r.placements as string[]) : [],
    price: typeof r.price === "number" ? r.price : null,
    imageUrl: (r.image_url as string | null) ?? null,
    isAvailable: Boolean(r.is_available),
  }));

  return { flash, demo: false };
}
