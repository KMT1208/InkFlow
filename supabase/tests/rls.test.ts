import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ════════════════════════════════════════════════════════════════════════
// Tests d'ISOLATION RLS (intégration). Prouvent qu'un tatoueur ne peut pas
// lire/modifier les données d'un autre, et que l'anonyme ne voit que le public.
//
// Nécessite un vrai projet Supabase + migration 0001 appliquée. Renseigner
// .env.local (URL + clés publishable/secret). Sans ces variables, la suite
// est ignorée → `npm test` reste vert.
//   Exécuter : npm test   (ou `npm run test -- supabase/tests`)
// ════════════════════════════════════════════════════════════════════════

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const configured = Boolean(url && publishableKey && secretKey);

type Artist = {
  email: string;
  userId: string;
  artistId: string;
  client: SupabaseClient; // client authentifié EN TANT QUE ce tatoueur
};

describe.skipIf(!configured)("RLS — isolation entre tatoueurs", () => {
  // Client service-role (bypass RLS) — initialisé dans beforeAll, donc jamais
  // construit quand la suite est ignorée (env absent).
  let admin: SupabaseClient;
  let a: Artist;
  let b: Artist;

  async function createArtist(tag: string): Promise<Artist> {
    const email = `rls-${tag}-${Date.now()}@inkflow.test`;
    const password = "Sup3r-Secret-123";
    const slug = `rls-${tag}-${Date.now().toString().slice(-6)}`;

    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { slug, display_name: `Studio ${tag}` },
    });
    if (error) throw error;
    const userId = created.user.id;

    // Le trigger handle_new_user a créé la ligne `artists`.
    const { data: artistRow, error: artistErr } = await admin
      .from("artists")
      .select("id")
      .eq("user_id", userId)
      .single();
    if (artistErr) throw artistErr;

    // Client authentifié en tant que ce tatoueur (clé publishable + session).
    const client = createClient(url!, publishableKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: signInErr } = await client.auth.signInWithPassword({ email, password });
    if (signInErr) throw signInErr;

    return { email, userId, artistId: artistRow.id as string, client };
  }

  beforeAll(async () => {
    admin = createClient(url!, secretKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    a = await createArtist("a");
    b = await createArtist("b");

    // Données semées via service-role (bypass RLS) : 1 flash dispo + 1 demande chacun.
    const seed = await admin.from("flash").insert([
      { artist_id: a.artistId, title: "Flash A", is_available: true, price: 12000 },
      { artist_id: b.artistId, title: "Flash B", is_available: true, price: 9000 },
    ]);
    if (seed.error) throw seed.error;

    const seedBookings = await admin.from("booking_requests").insert([
      { artist_id: a.artistId, client_name: "Client A", client_email: "ca@example.com" },
      { artist_id: b.artistId, client_name: "Client B", client_email: "cb@example.com" },
    ]);
    if (seedBookings.error) throw seedBookings.error;
  }, 30_000);

  afterAll(async () => {
    // Suppression des users → cascade sur artists/flash/booking_requests.
    if (a?.userId) await admin.auth.admin.deleteUser(a.userId);
    if (b?.userId) await admin.auth.admin.deleteUser(b.userId);
  });

  it("A ne voit que ses propres booking_requests", async () => {
    const { data, error } = await a.client.from("booking_requests").select("artist_id");
    expect(error).toBeNull();
    expect((data ?? []).length).toBeGreaterThanOrEqual(1);
    expect((data ?? []).every((r) => r.artist_id === a.artistId)).toBe(true);
  });

  it("A ne peut pas lire les booking_requests de B (filtrage explicite)", async () => {
    const { data } = await a.client
      .from("booking_requests")
      .select("*")
      .eq("artist_id", b.artistId);
    expect(data ?? []).toHaveLength(0);
  });

  it("A ne peut pas modifier le profil de B", async () => {
    const { data } = await a.client
      .from("artists")
      .update({ city: "Piratée" })
      .eq("id", b.artistId)
      .select();
    // RLS : aucune ligne affectée (B reste intact).
    expect(data ?? []).toHaveLength(0);
  });

  it("les flash disponibles sont publics (A et B visibles par l'anonyme)", async () => {
    const anon = createClient(url!, publishableKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await anon.from("flash").select("artist_id").eq("is_available", true);
    const ids = new Set((data ?? []).map((r) => r.artist_id));
    expect(ids.has(a.artistId)).toBe(true);
    expect(ids.has(b.artistId)).toBe(true);
  });

  it("l'anonyme ne lit aucune booking_request", async () => {
    const anon = createClient(url!, publishableKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await anon.from("booking_requests").select("*");
    expect(data ?? []).toHaveLength(0);
  });
});
