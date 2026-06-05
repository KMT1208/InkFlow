# Installation & configuration — InkFlow

Guide pour faire tourner le projet en local. Pour l'architecture et les conventions, voir [`CLAUDE.md`](./CLAUDE.md).

## 1. Prérequis

- **Node 20+** et **npm** (testé avec Node 24 / npm 11)
- Un compte **Supabase** (pour l'auth et la base)
- Plus tard : comptes **Stripe**, **Resend**, **Twilio** (selon la phase)

## 2. Dépendances

```bash
npm install
```

## 3. Variables d'environnement

```bash
cp .env.example .env.local
```

Puis remplir `.env.local`. Le **minimum pour démarrer l'app + l'authentification** :

| Variable | Où la trouver |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | idem → **Publishable key** (`sb_publishable_…`) |
| `SUPABASE_SECRET_KEY` | idem → **Secret key** (`sb_secret_…`) — **serveur uniquement** |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` en local |

> Tant que Supabase n'est pas configuré, le site reste consultable mais
> l'authentification est désactivée (voir `isSupabaseConfigured()`).

## 4. Base de données (migrations Supabase)

> La migration initiale (`supabase/migrations/0001_init.sql`) est créée en **Phase 1**
> (tables `artists`, RLS, trigger `handle_new_user`, buckets Storage).

```bash
# Applique le schéma sur la base Supabase liée
npx supabase db push

# OU, en local (nécessite Docker) : (ré)initialise une base de dev
npx supabase db reset

# Régénère les types TypeScript après une migration
npx supabase gen types typescript --local > lib/database.types.ts
```

## 5. Lancer le serveur de dev

```bash
npm run dev
```

→ http://localhost:3000

## 6. Scripts utiles

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm run start` | Build / serveur de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification des types (`tsc --noEmit`) |
| `npm run test` | Tests (Vitest) |

## 7. Services externes (phases ultérieures)

- **Stripe** (acomptes + abonnement) — Phases 2-3. Webhooks via `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
- **Resend** (email) — Phase 3.
- **Twilio** (SMS) — Phase 4.
