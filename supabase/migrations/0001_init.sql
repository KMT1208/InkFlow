-- ════════════════════════════════════════════════════════════════════════
-- InkFlow — 0001_init.sql : schéma initial (SaaS multi-tenant pour tatoueurs)
--
-- Principes :
--   • Tenant = table `artists` (user_id -> auth.users). Tables liées : artist_id.
--   • Montants TOUJOURS en CENTIMES (int). currency en minuscules ('eur').
--   • RLS deny-by-default. Accès tenant via helper current_artist_id().
--   • Lecture publique (mini-site) : vue artist_public + policies anon ciblées.
--   • Écriture publique (intake client anonyme) : via client service-role
--     (Server Action) — aucune policy d'insert pour anon.
-- ════════════════════════════════════════════════════════════════════════

-- ─── Enums ──────────────────────────────────────────────────────────────
create type deposit_kind          as enum ('fixed', 'percent');
create type project_kind          as enum ('flash', 'custom');
create type booking_status        as enum ('nouvelle', 'devis_envoye', 'acompte_attendu', 'acompte_paye', 'confirmee', 'terminee', 'annulee', 'refusee');
create type appointment_status    as enum ('planifie', 'confirme', 'termine', 'annule', 'no_show');
create type availability_kind     as enum ('open', 'block');
create type payment_status        as enum ('requires_payment', 'processing', 'succeeded', 'refunded', 'failed');
create type reminder_kind         as enum ('j7', 'j2', 'jour_j');
create type reminder_channel      as enum ('sms', 'email');
create type reminder_status       as enum ('pending', 'sent', 'failed', 'skipped');
create type subscription_plan     as enum ('solo', 'studio');
create type subscription_status   as enum ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid', 'paused');

-- ─── Fonction utilitaire : updated_at ───────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ════════════════════════════════════════════════════════════════════════
-- TENANT : artists
-- ════════════════════════════════════════════════════════════════════════
create table artists (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null unique references auth.users(id) on delete cascade,
  slug                 text not null unique check (slug ~ '^[a-z0-9-]{3,40}$'),
  display_name         text not null,
  bio                  text,
  city                 text,
  country              text not null default 'FR',
  avatar_url           text,
  logo_url             text,
  cover_url            text,
  instagram            text,
  tiktok               text,
  website              text,
  theme                text not null default 'editorial-sombre',
  currency             text not null default 'eur',
  -- Acompte par défaut (configurable) : fixed => centimes ; percent => 0..100.
  deposit_type         deposit_kind not null default 'fixed',
  deposit_value        int not null default 5000,
  deposit_refundable   boolean not null default false,
  stripe_account_id    text,   -- Connect (reversement des acomptes)
  stripe_customer_id   text,   -- Billing (abonnement SaaS)
  subscription_plan    subscription_plan,
  subscription_status  subscription_status,
  trial_ends_at        timestamptz,
  onboarding_completed boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint deposit_percent_range
    check (deposit_type <> 'percent' or deposit_value between 0 and 100)
);

create trigger artists_set_updated_at
  before update on artists for each row execute function set_updated_at();

-- id d'artiste du user courant. SECURITY DEFINER : contourne la RLS d'artists
-- pour la résolution (sans quoi les policies seraient récursives). STABLE.
create or replace function current_artist_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from artists where user_id = auth.uid()
$$;

alter table artists enable row level security;
create policy artists_select_own on artists for select to authenticated using (user_id = auth.uid());
create policy artists_update_own on artists for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
-- INSERT : assuré par le trigger handle_new_user (pas d'insert direct par l'user).

-- À l'inscription Supabase, crée la ligne artists depuis les métadonnées
-- (display_name, slug) posées par l'action signUp.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- display_name / avatar : on récupère aussi les métadonnées des comptes OAuth
  -- (Google fournit full_name/name/avatar_url/picture, pas display_name/slug).
  insert into public.artists (user_id, slug, display_name, avatar_url)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'slug', ''), 'studio-' || left(new.id::text, 8)),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Studio'
    ),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
      nullif(new.raw_user_meta_data ->> 'picture', '')
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();

-- Vue publique du mini-site : colonnes SÛRES uniquement (jamais Stripe/abonnement).
-- security_invoker=false (défaut) => contourne la RLS d'artists pour exposer
-- ces colonnes à anon. L'app sélectionne l'artiste par slug.
create view artist_public
with (security_invoker = false) as
  select id, slug, display_name, bio, city, country,
         avatar_url, logo_url, cover_url, instagram, tiktok, website,
         theme, currency, deposit_type, deposit_value, deposit_refundable
  from artists;

grant select on artist_public to anon, authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- flash (designs / services réservables)
-- ════════════════════════════════════════════════════════════════════════
create table flash (
  id           uuid primary key default gen_random_uuid(),
  artist_id    uuid not null references artists(id) on delete cascade,
  title        text not null,
  description  text,
  image_url    text,
  size         text,
  placements   text[] not null default '{}',
  price        int,                       -- centimes
  is_available boolean not null default true,
  position     int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index flash_artist_idx on flash(artist_id);

create trigger flash_set_updated_at
  before update on flash for each row execute function set_updated_at();

alter table flash enable row level security;
create policy flash_owner_all  on flash for all to authenticated
  using (artist_id = current_artist_id()) with check (artist_id = current_artist_id());
create policy flash_public_read on flash for select to anon, authenticated
  using (is_available);

-- ════════════════════════════════════════════════════════════════════════
-- booking_requests (la « boîte de réception » qui remplace les DM)
-- ════════════════════════════════════════════════════════════════════════
create table booking_requests (
  id               uuid primary key default gen_random_uuid(),
  artist_id        uuid not null references artists(id) on delete cascade,
  flash_id         uuid references flash(id) on delete set null,
  client_name      text not null,
  client_email     text not null,
  client_phone     text,
  project_type     project_kind not null default 'custom',
  description      text,
  body_zone        text,
  size             text,
  budget_min       int,                  -- centimes
  budget_max       int,                  -- centimes
  reference_paths  text[] not null default '{}',  -- chemins bucket privé references
  preferred_slots  jsonb,
  status           booking_status not null default 'nouvelle',
  quote_amount     int,                  -- centimes (devis)
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index booking_requests_artist_idx on booking_requests(artist_id);
create index booking_requests_status_idx  on booking_requests(artist_id, status);

create trigger booking_requests_set_updated_at
  before update on booking_requests for each row execute function set_updated_at();

alter table booking_requests enable row level security;
create policy booking_owner_all on booking_requests for all to authenticated
  using (artist_id = current_artist_id()) with check (artist_id = current_artist_id());
-- Pas d'insert anon : l'intake public passe par le client service-role (validé zod + rate limit).

-- ════════════════════════════════════════════════════════════════════════
-- appointments
-- ════════════════════════════════════════════════════════════════════════
create table appointments (
  id             uuid primary key default gen_random_uuid(),
  artist_id      uuid not null references artists(id) on delete cascade,
  booking_id     uuid references booking_requests(id) on delete set null,
  starts_at      timestamptz not null,
  ends_at        timestamptz not null,
  deposit_amount int,                    -- centimes
  total_amount   int,                    -- centimes
  status         appointment_status not null default 'planifie',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index appointments_artist_idx on appointments(artist_id);
create index appointments_when_idx   on appointments(artist_id, starts_at);

create trigger appointments_set_updated_at
  before update on appointments for each row execute function set_updated_at();

alter table appointments enable row level security;
create policy appointments_owner_all on appointments for all to authenticated
  using (artist_id = current_artist_id()) with check (artist_id = current_artist_id());

-- ════════════════════════════════════════════════════════════════════════
-- availability (créneaux récurrents ou ponctuels + blocages)
-- ════════════════════════════════════════════════════════════════════════
create table availability (
  id            uuid primary key default gen_random_uuid(),
  artist_id     uuid not null references artists(id) on delete cascade,
  weekday       int check (weekday between 0 and 6),  -- récurrent (0 = dimanche)
  specific_date date,                                 -- ou date précise
  start_time    time not null,
  end_time      time not null,
  kind          availability_kind not null default 'open',
  created_at    timestamptz not null default now(),
  check (weekday is not null or specific_date is not null),
  check (end_time > start_time)
);
create index availability_artist_idx on availability(artist_id);

alter table availability enable row level security;
create policy availability_owner_all on availability for all to authenticated
  using (artist_id = current_artist_id()) with check (artist_id = current_artist_id());

-- Lecture publique : créneaux ouverts d'un artiste sur une plage.
-- (Phase 3 affinera : expansion des récurrences + soustraction des rendez-vous.)
create or replace function get_free_slots(p_artist_id uuid, p_from date, p_to date)
returns setof availability language sql stable security definer set search_path = public as $$
  select * from availability
  where artist_id = p_artist_id
    and kind = 'open'
    and (specific_date is null or specific_date between p_from and p_to)
$$;
grant execute on function get_free_slots(uuid, date, date) to anon, authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- payments (acomptes Stripe Connect)
-- ════════════════════════════════════════════════════════════════════════
create table payments (
  id                     uuid primary key default gen_random_uuid(),
  artist_id              uuid not null references artists(id) on delete cascade,
  booking_id             uuid references booking_requests(id) on delete set null,
  appointment_id         uuid references appointments(id) on delete set null,
  stripe_payment_intent_id text unique,
  amount                 int not null,            -- centimes
  currency               text not null default 'eur',
  application_fee_amount int,                     -- centimes (commission plateforme)
  status                 payment_status not null default 'requires_payment',
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index payments_artist_idx on payments(artist_id);

create trigger payments_set_updated_at
  before update on payments for each row execute function set_updated_at();

alter table payments enable row level security;
create policy payments_owner_read on payments for select to authenticated
  using (artist_id = current_artist_id());
-- Écritures : webhook Stripe (service-role).

-- ════════════════════════════════════════════════════════════════════════
-- subscriptions (abonnement SaaS du tatoueur)
-- ════════════════════════════════════════════════════════════════════════
create table subscriptions (
  id                   uuid primary key default gen_random_uuid(),
  artist_id            uuid not null unique references artists(id) on delete cascade,
  stripe_subscription_id text unique,
  stripe_price_id      text,
  plan                 subscription_plan,
  status               subscription_status,
  current_period_end   timestamptz,
  trial_end            timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create trigger subscriptions_set_updated_at
  before update on subscriptions for each row execute function set_updated_at();

alter table subscriptions enable row level security;
create policy subscriptions_owner_read on subscriptions for select to authenticated
  using (artist_id = current_artist_id());
-- Écritures : webhook Stripe (service-role).

-- ════════════════════════════════════════════════════════════════════════
-- reminders (rappels automatiques)
-- ════════════════════════════════════════════════════════════════════════
create table reminders (
  id                  uuid primary key default gen_random_uuid(),
  artist_id           uuid not null references artists(id) on delete cascade,
  appointment_id      uuid not null references appointments(id) on delete cascade,
  type                reminder_kind not null,
  channel             reminder_channel not null,
  scheduled_for       timestamptz not null,
  status              reminder_status not null default 'pending',
  sent_at             timestamptz,
  provider_message_id text,
  created_at          timestamptz not null default now()
);
create index reminders_artist_idx on reminders(artist_id);
create index reminders_due_idx on reminders(scheduled_for) where status = 'pending';

alter table reminders enable row level security;
create policy reminders_owner_read on reminders for select to authenticated
  using (artist_id = current_artist_id());
-- Écritures : tâche planifiée (service-role).

-- ════════════════════════════════════════════════════════════════════════
-- consent_forms (consentement RGPD/santé/majorité)
-- ════════════════════════════════════════════════════════════════════════
create table consent_forms (
  id               uuid primary key default gen_random_uuid(),
  artist_id        uuid not null references artists(id) on delete cascade,
  booking_id       uuid references booking_requests(id) on delete set null,
  client_name      text not null,
  is_adult         boolean not null default false,
  health           jsonb,
  contraindications text,
  signed_at        timestamptz,
  ip               text,
  created_at       timestamptz not null default now()
);
create index consent_forms_artist_idx on consent_forms(artist_id);

alter table consent_forms enable row level security;
create policy consent_owner_read on consent_forms for select to authenticated
  using (artist_id = current_artist_id());
-- Insertion : via service-role (signature à l'intake public).

-- ════════════════════════════════════════════════════════════════════════
-- reviews (avis)
-- ════════════════════════════════════════════════════════════════════════
create table reviews (
  id           uuid primary key default gen_random_uuid(),
  artist_id    uuid not null references artists(id) on delete cascade,
  author_name  text not null,
  rating       int not null check (rating between 1 and 5),
  body         text,
  is_published boolean not null default false,
  created_at   timestamptz not null default now()
);
create index reviews_artist_idx on reviews(artist_id);

alter table reviews enable row level security;
create policy reviews_owner_all on reviews for all to authenticated
  using (artist_id = current_artist_id()) with check (artist_id = current_artist_id());
create policy reviews_public_read on reviews for select to anon, authenticated
  using (is_published);

-- ════════════════════════════════════════════════════════════════════════
-- stripe_events (idempotence des webhooks) — accès service-role uniquement
-- ════════════════════════════════════════════════════════════════════════
create table stripe_events (
  id           text primary key,   -- Stripe event.id
  type         text,
  processed_at timestamptz not null default now()
);
alter table stripe_events enable row level security;
-- Aucune policy : seul le service-role (qui contourne la RLS) y accède.

-- ════════════════════════════════════════════════════════════════════════
-- Storage : buckets + policies
--   • branding  (public)      : logo / avatar / cover         — path <artist_id>/...
--   • flash     (public)      : images des flash              — path <artist_id>/...
--   • references(privé)       : références client (intake)    — path <artist_id>/<booking_id>/...
-- L'écriture est réservée à l'artiste propriétaire ; references est écrit par
-- le service-role (intake) et lu par l'artiste via URL signée serveur.
-- ════════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public) values
  ('branding',   'branding',   true),
  ('flash',      'flash',      true),
  ('references', 'references', false)
on conflict (id) do nothing;

-- branding : lecture publique, écriture par le propriétaire (1er segment = artist_id)
create policy "branding read"   on storage.objects for select
  using (bucket_id = 'branding');
create policy "branding write"  on storage.objects for insert to authenticated
  with check (bucket_id = 'branding' and (storage.foldername(name))[1] = public.current_artist_id()::text);
create policy "branding modify" on storage.objects for update to authenticated
  using (bucket_id = 'branding' and (storage.foldername(name))[1] = public.current_artist_id()::text);
create policy "branding delete" on storage.objects for delete to authenticated
  using (bucket_id = 'branding' and (storage.foldername(name))[1] = public.current_artist_id()::text);

-- flash : lecture publique, écriture par le propriétaire
create policy "flash read"   on storage.objects for select
  using (bucket_id = 'flash');
create policy "flash write"  on storage.objects for insert to authenticated
  with check (bucket_id = 'flash' and (storage.foldername(name))[1] = public.current_artist_id()::text);
create policy "flash modify" on storage.objects for update to authenticated
  using (bucket_id = 'flash' and (storage.foldername(name))[1] = public.current_artist_id()::text);
create policy "flash delete" on storage.objects for delete to authenticated
  using (bucket_id = 'flash' and (storage.foldername(name))[1] = public.current_artist_id()::text);

-- references : privé. Lecture réservée au propriétaire ; écriture via service-role.
create policy "references read" on storage.objects for select to authenticated
  using (bucket_id = 'references' and (storage.foldername(name))[1] = public.current_artist_id()::text);
