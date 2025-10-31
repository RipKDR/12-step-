-- Recovery Companion App - Supabase Schema & RLS
-- Generated: 2025-01-27

-- Enable helpful extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ========== Custom Types ==========
CREATE TYPE program_type AS ENUM ('NA', 'AA');
CREATE TYPE sponsor_status AS ENUM ('pending', 'active', 'revoked');
CREATE TYPE routine_status AS ENUM ('completed', 'skipped', 'failed');
CREATE TYPE notification_platform AS ENUM ('ios', 'android', 'web');

-- ========== Helper Functions ==========
create or replace function public.now_utc() returns timestamptz
language sql stable as $$ select (now() at time zone 'utc')::timestamptz $$;

-- ========== Profiles ==========
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  handle text unique,
  display_name text,
  timezone text default 'UTC',
  avatar_url text,
  program program_type default 'NA',
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc()
);

create or replace function public.touch_profile()
returns trigger language plpgsql as $$
begin
  new.updated_at := public.now_utc();
  return new;
end;
$$;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.touch_profile();

-- ========== Steps ==========
create table if not exists public.steps (
  id text primary key,
  program program_type not null,
  step_number integer not null,
  title text not null,
  prompts jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default public.now_utc(),
  unique(program, step_number)
);

-- ========== Step Entries ==========
create table if not exists public.step_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  step_id text not null references public.steps(id) on delete cascade,
  version integer not null default 1,
  content jsonb not null default '{}'::jsonb,
  is_shared_with_sponsor boolean not null default false,
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc()
);

create or replace function public.touch_step_entry()
returns trigger language plpgsql as $$
begin
  new.updated_at := public.now_utc();
  return new;
end;
$$;

create trigger update_step_entries_updated_at
  before update on public.step_entries
  for each row execute function public.touch_step_entry();

-- ========== Daily Entries ==========
create table if not exists public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  cravings_intensity integer not null check (cravings_intensity >= 0 and cravings_intensity <= 10),
  feelings jsonb not null default '[]'::jsonb,
  triggers jsonb not null default '[]'::jsonb,
  coping_actions jsonb not null default '[]'::jsonb,
  gratitude text,
  notes text,
  is_shared_with_sponsor boolean not null default false,
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc(),
  unique(user_id, entry_date)
);

create or replace function public.touch_daily_entry()
returns trigger language plpgsql as $$
begin
  new.updated_at := public.now_utc();
  return new;
end;
$$;

create trigger update_daily_entries_updated_at
  before update on public.daily_entries
  for each row execute function public.touch_daily_entry();

-- ========== Craving Events ==========
create table if not exists public.craving_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  occurred_at timestamptz not null default public.now_utc(),
  intensity integer not null check (intensity >= 0 and intensity <= 10),
  trigger_type text,
  lat numeric(10, 8),
  lng numeric(11, 8),
  notes text,
  response_taken text,
  created_at timestamptz not null default public.now_utc()
);

-- ========== Action Plans ==========
create table if not exists public.action_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  situation text not null,
  if_then jsonb not null default '[]'::jsonb,
  checklist jsonb not null default '[]'::jsonb,
  emergency_contacts jsonb not null default '[]'::jsonb,
  is_shared_with_sponsor boolean not null default false,
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc()
);

create or replace function public.touch_action_plan()
returns trigger language plpgsql as $$
begin
  new.updated_at := public.now_utc();
  return new;
end;
$$;

create trigger update_action_plans_updated_at
  before update on public.action_plans
  for each row execute function public.touch_action_plan();

-- ========== Routines ==========
create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  schedule jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc()
);

create or replace function public.touch_routine()
returns trigger language plpgsql as $$
begin
  new.updated_at := public.now_utc();
  return new;
end;
$$;

create trigger update_routines_updated_at
  before update on public.routines
  for each row execute function public.touch_routine();

-- ========== Routine Logs ==========
create table if not exists public.routine_logs (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  run_at timestamptz not null default public.now_utc(),
  status routine_status not null,
  note text,
  created_at timestamptz not null default public.now_utc()
);

-- ========== Sobriety Streaks ==========
create table if not exists public.sobriety_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  start_date date not null,
  end_date date,
  relapse_note text,
  created_at timestamptz not null default public.now_utc(),
  check (start_date <= coalesce(end_date, current_date))
);

-- ========== Sponsor Relationships ==========
create table if not exists public.sponsor_relationships (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid not null references auth.users(id) on delete cascade,
  sponsee_id uuid not null references auth.users(id) on delete cascade,
  status sponsor_status not null default 'pending',
  code text unique,
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc(),
  unique(sponsor_id, sponsee_id)
);

create or replace function public.touch_sponsor_relationship()
returns trigger language plpgsql as $$
begin
  new.updated_at := public.now_utc();
  return new;
end;
$$;

create trigger update_sponsor_relationships_updated_at
  before update on public.sponsor_relationships
  for each row execute function public.touch_sponsor_relationship();

-- ========== Trigger Locations ==========
create table if not exists public.trigger_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  lat numeric(10, 8) not null,
  lng numeric(11, 8) not null,
  radius_m numeric not null check (radius_m > 0),
  on_enter jsonb not null default '[]'::jsonb,
  on_exit jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc()
);

create or replace function public.touch_trigger_location()
returns trigger language plpgsql as $$
begin
  new.updated_at := public.now_utc();
  return new;
end;
$$;

create trigger update_trigger_locations_updated_at
  before update on public.trigger_locations
  for each row execute function public.touch_trigger_location();

-- ========== Messages ==========
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null,
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  content_ciphertext text not null,
  nonce text not null,
  created_at timestamptz not null default public.now_utc()
);

-- ========== Notification Tokens ==========
create table if not exists public.notification_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  platform notification_platform not null,
  created_at timestamptz not null default public.now_utc(),
  unique(user_id, platform, token)
);

-- ========== Risk Signals ==========
create table if not exists public.risk_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scored_at timestamptz not null default public.now_utc(),
  score integer not null check (score >= 0 and score <= 100),
  inputs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default public.now_utc()
);

-- ========== Audit Log ==========
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default public.now_utc()
);

-- ========== Indexes ==========
create index if not exists idx_daily_entries_user_date on public.daily_entries(user_id, entry_date desc);
create index if not exists idx_daily_entries_shared on public.daily_entries(user_id, is_shared_with_sponsor) where is_shared_with_sponsor = true;
create index if not exists idx_step_entries_user_step on public.step_entries(user_id, step_id);
create index if not exists idx_step_entries_shared on public.step_entries(user_id, is_shared_with_sponsor) where is_shared_with_sponsor = true;
create index if not exists idx_action_plans_user on public.action_plans(user_id);
create index if not exists idx_action_plans_shared on public.action_plans(user_id, is_shared_with_sponsor) where is_shared_with_sponsor = true;
create index if not exists idx_sponsor_relationships_sponsor on public.sponsor_relationships(sponsor_id, status);
create index if not exists idx_sponsor_relationships_sponsee on public.sponsor_relationships(sponsee_id, status);
create index if not exists idx_sponsor_relationships_code on public.sponsor_relationships(code) where code is not null;
create index if not exists idx_craving_events_user_date on public.craving_events(user_id, occurred_at desc);
create index if not exists idx_craving_events_location on public.craving_events(lat, lng) where lat is not null and lng is not null;
create index if not exists idx_trigger_locations_user on public.trigger_locations(user_id, active);
create index if not exists idx_trigger_locations_location on public.trigger_locations(lat, lng) where active = true;
create index if not exists idx_routine_logs_user_date on public.routine_logs(user_id, run_at desc);
create index if not exists idx_routine_logs_routine on public.routine_logs(routine_id, run_at desc);
create index if not exists idx_messages_thread on public.messages(thread_id, created_at desc);
create index if not exists idx_messages_sender on public.messages(sender_id, created_at desc);
create index if not exists idx_messages_recipient on public.messages(recipient_id, created_at desc);
create index if not exists idx_audit_log_user_date on public.audit_log(user_id, created_at desc);
create index if not exists idx_audit_log_action on public.audit_log(action, created_at desc);

-- ========== Row Level Security ==========
alter table public.profiles enable row level security;
alter table public.steps enable row level security;
alter table public.step_entries enable row level security;
alter table public.daily_entries enable row level security;
alter table public.craving_events enable row level security;
alter table public.action_plans enable row level security;
alter table public.routines enable row level security;
alter table public.routine_logs enable row level security;
alter table public.sobriety_streaks enable row level security;
alter table public.sponsor_relationships enable row level security;
alter table public.trigger_locations enable row level security;
alter table public.messages enable row level security;
alter table public.notification_tokens enable row level security;
alter table public.risk_signals enable row level security;
alter table public.audit_log enable row level security;

-- ========== RLS Policies ==========

-- Profiles
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = user_id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = user_id);

-- Steps (read-only for all authenticated users)
create policy "Users can view steps" on public.steps
  for select using (auth.role() = 'authenticated');

-- Step Entries
create policy "Users can access own step entries" on public.step_entries
  for all using (auth.uid() = user_id);

create policy "Sponsors can access shared step entries" on public.step_entries
  for select using (
    is_shared_with_sponsor = true and
    exists (
      select 1 from public.sponsor_relationships sr
      where sr.sponsor_id = auth.uid()
      and sr.sponsee_id = user_id
      and sr.status = 'active'
    )
  );

-- Daily Entries
create policy "Users can access own daily entries" on public.daily_entries
  for all using (auth.uid() = user_id);

create policy "Sponsors can access shared daily entries" on public.daily_entries
  for select using (
    is_shared_with_sponsor = true and
    exists (
      select 1 from public.sponsor_relationships sr
      where sr.sponsor_id = auth.uid()
      and sr.sponsee_id = user_id
      and sr.status = 'active'
    )
  );

-- Craving Events
create policy "Users can access own craving events" on public.craving_events
  for all using (auth.uid() = user_id);

-- Action Plans
create policy "Users can access own action plans" on public.action_plans
  for all using (auth.uid() = user_id);

create policy "Sponsors can access shared action plans" on public.action_plans
  for select using (
    is_shared_with_sponsor = true and
    exists (
      select 1 from public.sponsor_relationships sr
      where sr.sponsor_id = auth.uid()
      and sr.sponsee_id = user_id
      and sr.status = 'active'
    )
  );

-- Routines
create policy "Users can access own routines" on public.routines
  for all using (auth.uid() = user_id);

-- Routine Logs
create policy "Users can access own routine logs" on public.routine_logs
  for all using (auth.uid() = user_id);

-- Sobriety Streaks
create policy "Users can access own sobriety streaks" on public.sobriety_streaks
  for all using (auth.uid() = user_id);

-- Sponsor Relationships
create policy "Users can manage own sponsor relationships" on public.sponsor_relationships
  for all using (
    auth.uid() = sponsor_id or auth.uid() = sponsee_id
  );

-- Trigger Locations
create policy "Users can access own trigger locations" on public.trigger_locations
  for all using (auth.uid() = user_id);

-- Messages
create policy "Users can access own messages" on public.messages
  for all using (
    auth.uid() = sender_id or auth.uid() = recipient_id
  );

-- Notification Tokens
create policy "Users can access own notification tokens" on public.notification_tokens
  for all using (auth.uid() = user_id);

-- Risk Signals
create policy "Users can access own risk signals" on public.risk_signals
  for all using (auth.uid() = user_id);

-- Audit Log
create policy "Users can access own audit logs" on public.audit_log
  for all using (auth.uid() = user_id);

-- ========== Helper Functions ==========

-- Create user profile on signup
create or replace function public.create_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, handle, timezone, program, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'handle', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'timezone', 'UTC'),
    coalesce((new.raw_user_meta_data->>'program')::program_type, 'NA'),
    public.now_utc(),
    public.now_utc()
  );
  return new;
end;
$$;

-- Trigger to create profile on user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_user_profile();

-- Generate unique sponsor code
create or replace function public.generate_sponsor_code()
returns text
language plpgsql
security definer
as $$
declare
  code text;
  exists_count integer;
begin
  loop
    code := upper(substr(md5(random()::text), 1, 8));
    select count(*) into exists_count
    from public.sponsor_relationships
    where sponsor_relationships.code = generate_sponsor_code.code;
    exit when exists_count = 0;
  end loop;
  return code;
end;
$$;
