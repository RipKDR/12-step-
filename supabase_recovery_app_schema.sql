
-- Recovery Companion App - Supabase Schema & RLS
-- Generated: 2025-10-29

-- Enable helpful extensions (optional; comment out if not needed)
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- You may enable PostGIS if you want geo queries later:
-- create extension if not exists postgis;

-- ========== Helpers ==========
create or replace function public.now_utc() returns timestamptz
language sql stable as $$ select (now() at time zone 'utc')::timestamptz $$;

-- ========== Profiles ==========
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  handle text unique,
  display_name text,
  timezone text default 'UTC',
  avatar_url text,
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc()
);

create or replace function public.touch_profile()
returns trigger language plpgsql as $$
begin
  new.updated_at := public.now_utc();
  return new;
end $$;

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch before update on public.profiles
for each row execute procedure public.touch_profile();

alter table public.profiles enable row level security;

create policy "profiles: owner can read"
on public.profiles for select
using (auth.uid() = user_id);

create policy "profiles: owner can update"
on public.profiles for update
using (auth.uid() = user_id);

create policy "profiles: owner can insert"
on public.profiles for insert
with check (auth.uid() = user_id);

-- ========== Recovery Content (12 Steps) ==========
-- Static catalog of steps; seed from app (NA/AA safe summaries, not copyrighted text)
create table if not exists public.steps (
  id uuid primary key default gen_random_uuid(),
  program text not null check (program in ('NA','AA')),
  step_number int not null check (step_number between 1 and 12),
  title text not null,
  prompts jsonb not null default '[]'::jsonb, -- array of {id, text, hint?}
  created_at timestamptz not null default public.now_utc(),
  unique(program, step_number)
);

alter table public.steps enable row level security;
create policy "steps: readable by all"
on public.steps for select using (true);

-- User entries for each step
create table if not exists public.step_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  step_id uuid not null references public.steps(id) on delete cascade,
  version int not null default 1,
  content jsonb not null default '{}'::jsonb, -- keyed by prompt id
  is_shared_with_sponsor boolean not null default false,
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc(),
  unique(user_id, step_id, version)
);

drop trigger if exists trg_step_entries_touch on public.step_entries;
create trigger trg_step_entries_touch before update on public.step_entries
for each row execute procedure public.touch_profile();

alter table public.step_entries enable row level security;

-- ========== Sponsor Links & Relationships ==========
create table if not exists public.sponsor_relationships (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid not null references auth.users(id) on delete cascade,
  sponsee_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('pending','active','revoked')) default 'pending',
  created_at timestamptz not null default public.now_utc(),
  unique (sponsor_id, sponsee_id)
);

alter table public.sponsor_relationships enable row level security;

create policy "sponsor_relationships: self visibility"
on public.sponsor_relationships for select
using (auth.uid() = sponsor_id or auth.uid() = sponsee_id);

create policy "sponsor_relationships: sponsee can create request"
on public.sponsor_relationships for insert
with check (auth.uid() = sponsee_id);

create policy "sponsor_relationships: either can update status"
on public.sponsor_relationships for update
using (auth.uid() = sponsor_id or auth.uid() = sponsee_id);

-- Allow sponsor read of shared step entries
create policy "step_entries: owner can read/write"
on public.step_entries for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "step_entries: sponsor read when shared"
on public.step_entries for select
using (
  is_shared_with_sponsor = true
  and exists (
    select 1
    from public.sponsor_relationships sr
    where sr.sponsor_id = auth.uid()
      and sr.sponsee_id = step_entries.user_id
      and sr.status = 'active'
  )
);

-- ========== Daily Tracking ==========
create table if not exists public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  cravings_intensity int check (cravings_intensity between 0 and 10),
  feelings text[], -- e.g., ['anxious','hopeful']
  triggers jsonb default '[]'::jsonb, -- array of {type, note}
  coping_actions jsonb default '[]'::jsonb, -- array of {action, duration_min}
  gratitude text,
  commitments text[],
  notes text,
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc(),
  unique(user_id, entry_date)
);

drop trigger if exists trg_daily_entries_touch on public.daily_entries;
create trigger trg_daily_entries_touch before update on public.daily_entries
for each row execute procedure public.touch_profile();

alter table public.daily_entries enable row level security;

create policy "daily_entries: owner full access"
on public.daily_entries for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Optional sponsor read of last N days if consented per-entry
alter table public.daily_entries add column if not exists share_with_sponsor boolean not null default false;

create policy "daily_entries: sponsor read when shared"
on public.daily_entries for select
using (
  share_with_sponsor = true
  and exists (
    select 1 from public.sponsor_relationships sr
    where sr.sponsor_id = auth.uid()
      and sr.sponsee_id = daily_entries.user_id
      and sr.status = 'active'
  )
);

-- ========== Craving Events (ad-hoc logs) ==========
create table if not exists public.craving_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  occured_at timestamptz not null default public.now_utc(),
  intensity int check (intensity between 0 and 10),
  trigger_type text, -- e.g., 'location','people','stress','boredom'
  lat double precision,
  lng double precision,
  notes text,
  response_taken text, -- e.g., 'called sponsor','urge surfing','meeting'
  created_at timestamptz not null default public.now_utc()
);

alter table public.craving_events enable row level security;

create policy "craving_events: owner full access"
on public.craving_events for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ========== Action Plans (If-Then plans) ==========
create table if not exists public.action_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  situation text, -- "When I feel X" or "If I'm at Y"
  if_then jsonb not null default '[]'::jsonb, -- array of {if, then}
  checklist jsonb not null default '[]'::jsonb, -- array of {label, done}
  emergency_contacts jsonb not null default '[]'::jsonb, -- array of {name, phone}
  is_shared_with_sponsor boolean not null default false,
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc()
);

drop trigger if exists trg_action_plans_touch on public.action_plans;
create trigger trg_action_plans_touch before update on public.action_plans
for each row execute procedure public.touch_profile();

alter table public.action_plans enable row level security;

create policy "action_plans: owner full access"
on public.action_plans for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "action_plans: sponsor read when shared"
on public.action_plans for select
using (
  is_shared_with_sponsor = true
  and exists (
    select 1 from public.sponsor_relationships sr
    where sr.sponsor_id = auth.uid()
      and sr.sponsee_id = action_plans.user_id
      and sr.status = 'active'
  )
);

-- ========== Routines (Daily/Weekly tasks & nudges) ==========
create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  schedule jsonb not null, -- e.g., {type:'daily', hour:9} or RRULE string
  active boolean not null default true,
  created_at timestamptz not null default public.now_utc()
);

alter table public.routines enable row level security;
create policy "routines: owner full access"
on public.routines for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists public.routine_logs (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  run_at timestamptz not null default public.now_utc(),
  status text check (status in ('sent','completed','skipped')),
  note text
);

alter table public.routine_logs enable row level security;
create policy "routine_logs: owner full access"
on public.routine_logs for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ========== Sobriety Streaks ==========
create table if not exists public.sobriety_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  start_date date not null,
  end_date date, -- null means active
  relapse_note text,
  created_at timestamptz not null default public.now_utc()
);

alter table public.sobriety_streaks enable row level security;
create policy "sobriety_streaks: owner full access"
on public.sobriety_streaks for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ========== Trigger Locations (Geofences) ==========
create table if not exists public.trigger_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  lat double precision not null,
  lng double precision not null,
  radius_m int not null default 100,
  on_enter jsonb default '[]'::jsonb, -- array of actions (e.g., 'notify_sponsor','show_plan')
  on_exit jsonb default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default public.now_utc()
);

alter table public.trigger_locations enable row level security;
create policy "trigger_locations: owner full access"
on public.trigger_locations for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ========== Messaging (E2E ciphertext storage) ==========
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  content_ciphertext text not null,
  nonce text, -- for libsodium, if used
  created_at timestamptz not null default public.now_utc()
);

alter table public.messages enable row level security;
create policy "messages: sender or recipient can read"
on public.messages for select
using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "messages: sender can insert"
on public.messages for insert
with check (auth.uid() = sender_id);

-- ========== Push Tokens (FCM/Expo) ==========
create table if not exists public.notification_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  platform text check (platform in ('ios','android','web')),
  created_at timestamptz not null default public.now_utc(),
  unique (user_id, token)
);

alter table public.notification_tokens enable row level security;
create policy "notification_tokens: owner full access"
on public.notification_tokens for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ========== Risk Signals (lightweight heuristics) ==========
create table if not exists public.risk_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scored_at timestamptz not null default public.now_utc(),
  score numeric(5,2) not null check (score between 0 and 100),
  inputs jsonb not null default '{}'::jsonb -- {cravings_avg7, sleep_hours, location_hits, missed_routines}
);

alter table public.risk_signals enable row level security;
create policy "risk_signals: owner full access"
on public.risk_signals for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ========== Audit Log (server actions) ==========
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default public.now_utc()
);

alter table public.audit_log enable row level security;
create policy "audit_log: owner can read own entries"
on public.audit_log for select
using (auth.uid() = user_id);

-- ========== Indexes ==========
create index if not exists idx_daily_entries_user_date on public.daily_entries(user_id, entry_date desc);
create index if not exists idx_craving_events_user_time on public.craving_events(user_id, occured_at desc);
create index if not exists idx_trigger_locations_user on public.trigger_locations(user_id);
create index if not exists idx_step_entries_user_step on public.step_entries(user_id, step_id);
create index if not exists idx_risk_signals_user_time on public.risk_signals(user_id, scored_at desc);

-- Done.
