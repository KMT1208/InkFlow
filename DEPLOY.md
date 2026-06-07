# Déploiement — InkFlow

Le projet est **prêt à déployer** (build prod vert, aucun secret committé). Cible
recommandée : **Vercel** (éditeur de Next.js → zéro config). Netlify possible (en bas).

> Tes clés Supabase sont déjà sur ta machine dans `.env.local.ready` — tu n'as
> qu'à les recopier dans les variables d'env de l'hébergeur.

## 1. Pousser le code sur GitHub
```bash
git remote add origin https://github.com/<toi>/inkflow.git
git push -u origin main
```

## 2. Appliquer la base de données (Supabase)
Dashboard Supabase → **SQL Editor** → *New query* → coller **tout**
`supabase/migrations/0001_init.sql` → **Run**. (Crée tables + RLS + trigger + buckets Storage.)

## 3. Déployer sur Vercel
1. [vercel.com](https://vercel.com) → **Add New… → Project** → importer le repo GitHub.
2. Framework détecté : **Next.js** (laisser les réglages par défaut).
3. Ajouter les **variables d'environnement** (ci-dessous), puis **Deploy**.

### Variables d'environnement
| Variable | Où la trouver |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | l'URL déployée (ex. `https://inkflow.vercel.app`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | idem (`sb_publishable_…`) |
| `SUPABASE_SECRET_KEY` | idem (`sb_secret_…`) |
| `STRIPE_SECRET_KEY` · `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → API keys |
| `STRIPE_WEBHOOK_SECRET` | étape 4 (après création du webhook) |
| `STRIPE_PRICE_SOLO` · `STRIPE_PRICE_STUDIO` | price IDs des produits Solo / Studio |
| `RESEND_API_KEY` · `RESEND_FROM` | Resend (domaine vérifié) |
| `TWILIO_ACCOUNT_SID` · `TWILIO_AUTH_TOKEN` · `TWILIO_MESSAGING_SERVICE_SID` | Twilio |
| `CRON_SECRET` | une chaîne aléatoire de ton choix |

## 4. Brancher les services (une fois l'URL connue)
- **Supabase → Authentication → URL Configuration** : *Site URL* + *Redirect URLs* =
  `https://<domaine>/auth/confirm`. Activer le provider **Google** (Client ID/secret).
  Adapter le template email du *magic link* →
  `…/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next=/dashboard`.
- **Stripe → Developers → Webhooks** : endpoint `https://<domaine>/api/webhooks/stripe`,
  events `checkout.session.completed` + `customer.subscription.created/updated/deleted`
  → copier le **Signing secret** dans `STRIPE_WEBHOOK_SECRET` (puis *Redeploy*).
  Activer **Connect** (Express). Créer 2 produits récurrents (Solo, Studio) →
  reporter les *price IDs*.
- **Twilio** : Messaging Service (expéditeur alphanumérique FR + *advanced opt-out* STOP).
  Status callback → `https://<domaine>/api/webhooks/twilio`.
- **Resend** : vérifier le domaine d'envoi, renseigner `RESEND_FROM`.
- **Cron** : `vercel.json` planifie déjà `/api/cron/reminders` (9h). Vercel envoie
  `Authorization: Bearer $CRON_SECRET` automatiquement.

## 5. Vérifier en prod
- Ouvre l'URL → la **vitrine** s'affiche.
- `/inscription` → crée ton studio → `/dashboard`.
- Va sur `/<ton-slug>` → **soumets une demande** → elle tombe dans ton **inbox**.
- En local (`.env.local` rempli) : `npm test` → **prouve les RLS**.

## Netlify (alternative)
- Importer le repo → Netlify détecte Next.js (`@netlify/plugin-nextjs`).
- **`NODE_VERSION = 20`** + les mêmes variables d'env.
- ⚠️ `vercel.json` (cron) est ignoré par Netlify → planifier `/api/cron/reminders`
  via **Netlify Scheduled Functions** ou un cron externe (ex. cron-job.org) appelant
  `https://<domaine>/api/cron/reminders?secret=<CRON_SECRET>`.
