@AGENTS.md

# InkFlow — guide du projet

SaaS de prise de rendez-vous pour **tatoueurs** : le client réserve en ligne, décrit son projet, upload ses références, paie un acompte, reçoit des rappels SMS/email. Objectif central : **supprimer la gestion des DM Instagram**. (Nom de code historique du scaffold : « INKED ».)

## Décisions verrouillées
- **Marque** : InkFlow (renommé depuis le nom de code « INKED » du scaffold).
- **Langue** : FR par défaut, architecture **i18n-ready** (textes isolés, pas de chaînes en dur dispersées).
- **Devise** : EUR. **Montants stockés en CENTIMES (entiers)**, `currency` en minuscules (`"eur"`). Jamais de float pour de l'argent.
- **Conformité** : France d'abord (RGPD, SMS FR expéditeur alphanumérique + STOP, Stripe FR).

## Les 3 surfaces & le routage
1. **Site vitrine** (marketing, vend le SaaS) — `app/(marketing)/` → `/` *(à construire, Phase 5)*.
2. **Dashboard tatoueur** (app SaaS, protégé) — `app/dashboard/` *(à construire)*. `requireArtist()` garde l'accès (→ `/connexion`).
3. **Page publique du tatoueur** (mini-site + booking) — `app/[slug]/` → `inkflow.app/<slug>` *(à construire)*. Slug validé (`lib/validation.ts`) + **liste de slugs réservés** (pricing, dashboard, api, auth…).
- **Auth** *(existant)* : `app/(auth)/` → `/connexion`, `/inscription`, `/mot-de-passe-oublie`, `/nouveau-mot-de-passe`. Callback : `app/auth/confirm`.

## Conventions Next.js 16 (⚠️ pas le Next.js d'avant — voir `node_modules/next/dist/docs/`)
- **`proxy.ts`** remplace `middleware.ts` (racine). Ici : rafraîchit la session Supabase (`getUser()`) — **optimistic checks uniquement**, jamais l'autorisation réelle.
- **Server Actions** (`"use server"`) pour TOUTES les mutations internes. ⚠️ Joignables en POST direct → **vérifier l'auth/autorisation DANS CHAQUE action**. Pending via `useActionState`. Après mutation : `revalidatePath`/`revalidateTag`/`refresh` (`next/cache`), `redirect` (`next/navigation`).
- **Route Handlers** (`app/**/route.ts`) **réservés aux webhooks** Stripe/Twilio. Pas d'API REST interne.
- **`cookies()` est async** (`await cookies()`).
- **Caching** : `cacheComponents` (PPR + `use cache`) **désactivé** pour l'instant (dynamique par défaut). À envisager Phase 5/6 (vitrine + mini-sites). Si activé : envelopper toute donnée non cachée dans `<Suspense>` ou `use cache`.

## Supabase & multi-tenant (RLS au niveau base)
- **3 clients** : `lib/supabase/client.ts` (navigateur), `lib/supabase/server.ts` (Server Components/Actions/Route Handlers), `lib/supabase/admin.ts` (**service-role — à créer**, `import "server-only"`, jamais exposé au client).
- **Nouvelles clés Supabase** (pas les legacy) : `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_…`) + `SUPABASE_SECRET_KEY` (`sb_secret_…`). ⚠️ Le code actuel utilise encore `NEXT_PUBLIC_SUPABASE_ANON_KEY` → migration Phase 0.
- **Tenant = table `artists`** (`user_id` → `auth.users`). Les tables liées portent `artist_id` → `artists(id)`.
- **RLS** : `artists` → `using (user_id = auth.uid())`. Tables liées → `using (artist_id = current_artist_id())` (fonction SQL STABLE renvoyant l'id d'artiste du user courant). **Deny by default** ; aucune table tenant lisible par `anon`.
- **Lecture publique** (mini-site) : vue **`artist_public`** (colonnes sûres uniquement) + policy `anon` sur `flash` (où `is_available`) + fonction `get_free_slots()`. Jamais d'exposition des colonnes sensibles (Stripe, email, abonnement).
- **Écriture publique** (intake client anonyme) : **Server Action + client service-role** après validation zod + rate limit (= la « policy d'insertion contrôlée »). RLS refuse l'insert anonyme direct.
- **Trigger `handle_new_user`** : crée la ligne `artists` à l'inscription depuis les métadonnées (`display_name`, `slug`). DAL dans `lib/auth.ts` (`getUser`/`getArtist`/`requireArtist`, mémoïsés via React `cache`).

## Stripe (deux intégrations)
- **Acomptes** (paiement ponctuel avant confirmation) via **Stripe Connect Express** : *destination charge* vers le compte connecté du tatoueur (+ `application_fee` éventuelle). **Pas d'acompte = pas de confirmation.**
- **Abonnement SaaS** du tatoueur : Stripe Billing (Checkout) sur le compte plateforme, avec essai.
- **Webhooks** (`app/api/webhooks/stripe/route.ts`) : **vérifier la signature** (`constructEvent`) + **idempotence** via table `stripe_events` (skip si `event.id` déjà traité).

## Email / SMS
- **Resend** (email transactionnel : confirmation, devis, reset).
- **Twilio** (SMS : rappels J-7 / J-2 / jour J) — expéditeur alphanumérique FR, **STOP** obligatoire, webhook statut `app/api/webhooks/twilio/route.ts`.

## Design system (déjà en place — Tailwind v4, thème en CSS)
- DA « éditorial sombre » : **noir `#0b0b0c`**, **rouge encre `#e5302a`** (accent `--color-ink`), **blanc cassé `#f4f1ea`**. Tokens dans `app/globals.css` (`@theme`) — **pas de `tailwind.config.js`**.
- Polices : **Bodoni Moda** (titres, `font-serif`) + **Inter** (texte, `font-sans`) via `next/font`.
- Composants : pattern léger maison (`buttonClass(variant)` + `cn` de `lib/utils`), primitives dans `components/ui/`. Ajout de composants shadcn possible ponctuellement **en gardant ce style**. **Mobile-first**, a11y, états de chargement/erreur soignés.

## Sécurité & qualité
- **TypeScript strict**. Validation de TOUS les inputs avec **zod** (style v4 : `z.email({ error })`).
- **Rate limiting** des endpoints publics (intake, webhooks).
- **RLS testées** : prouver qu'un tatoueur ne lit pas les données d'un autre.
- **Secrets** dans `.env.local` (jamais commités ; `.gitignore` couvre `.env*`). Fournir `.env.example`.
- **RGPD** : consentement (santé / majorité), export + suppression des données client.

## Commandes
- `npm run dev` — serveur de dev
- `npm run build` / `npm run start` — build / prod
- `npm run lint` — ESLint · `npm run typecheck` — `tsc --noEmit`
- `npm run test` — Vitest *(à ajouter)*
- Migrations Supabase (CLI) :
  - `npx supabase migration new <nom>` — nouvelle migration
  - `npx supabase db reset` — (ré)applique tout en local
  - `npx supabase gen types typescript --local > lib/database.types.ts` — types générés

## Variables d'environnement (→ `.env.example`)
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_MESSAGING_SERVICE_SID`
- *(option)* `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

## Méthode de travail
- **Lire le guide concerné dans `node_modules/next/dist/docs/` AVANT d'écrire du code Next.js** (impératif `AGENTS.md`).
- Avancer **par phases courtes**, **commit après chaque étape** (message clair), validation en fin de phase.
- Le schéma DB détaillé est **proposé pour validation** avant implémentation (migration `0001_init.sql`).
