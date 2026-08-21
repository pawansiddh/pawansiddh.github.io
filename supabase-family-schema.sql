-- Run once in the Supabase SQL Editor for secure cross-device Family Study Mode.
create extension if not exists pgcrypto;

create table if not exists public.family_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role text not null default 'learner' check (role in ('parent','learner')),
  created_at timestamptz not null default now()
);

create table if not exists public.family_links (
  parent_id uuid not null references auth.users(id) on delete cascade,
  learner_id uuid not null references auth.users(id) on delete cascade,
  linked_at timestamptz not null default now(),
  primary key (parent_id,learner_id),
  check (parent_id <> learner_id)
);

create table if not exists public.family_invites (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.family_activity (
  learner_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null,
  active_ms bigint not null default 0,
  idle_ms bigint not null default 0,
  view_changes integer not null default 0,
  views jsonb not null default '{}'::jsonb,
  last_seen timestamptz,
  primary key (learner_id,activity_date)
);

alter table public.family_profiles enable row level security;
alter table public.family_links enable row level security;
alter table public.family_invites enable row level security;
alter table public.family_activity enable row level security;

create policy "profiles own or linked parent read" on public.family_profiles for select using (
  auth.uid()=user_id or exists(select 1 from public.family_links l where l.parent_id=auth.uid() and l.learner_id=user_id)
);
create policy "profiles own insert" on public.family_profiles for insert with check (auth.uid()=user_id);
create policy "profiles own update" on public.family_profiles for update using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "links members read" on public.family_links for select using (auth.uid() in (parent_id,learner_id));
create policy "parents create invites" on public.family_invites for insert with check (auth.uid()=parent_id);
create policy "parents read invites" on public.family_invites for select using (auth.uid()=parent_id);
create policy "learners own activity" on public.family_activity for all using (auth.uid()=learner_id) with check (auth.uid()=learner_id);
create policy "linked parents read activity" on public.family_activity for select using (
  exists(select 1 from public.family_links l where l.parent_id=auth.uid() and l.learner_id=learner_id)
);

-- Linking must be completed through a SECURITY DEFINER RPC that verifies and consumes
-- a single-use hash. Do not expose permanent user IDs as linking secrets.
