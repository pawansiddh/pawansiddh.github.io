-- Study Tracker secure cross-device Family Mode. Safe to run repeatedly.
create extension if not exists pgcrypto;

create table if not exists public.family_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role text not null default 'learner' check (role in ('parent','learner')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.family_links (
  parent_id uuid not null references auth.users(id) on delete cascade,
  learner_id uuid not null references auth.users(id) on delete cascade,
  linked_at timestamptz not null default now(),
  primary key (parent_id,learner_id), check (parent_id<>learner_id)
);
create table if not exists public.family_invites (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.family_activity (
  learner_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null,
  active_ms bigint not null default 0 check(active_ms>=0),
  idle_ms bigint not null default 0 check(idle_ms>=0),
  view_changes integer not null default 0 check(view_changes>=0),
  views jsonb not null default '{}'::jsonb,
  logins integer not null default 0 check(logins>=0),
  last_seen timestamptz,
  updated_at timestamptz not null default now(),
  primary key (learner_id,activity_date)
);
alter table public.family_profiles add column if not exists updated_at timestamptz not null default now();
alter table public.family_invites add column if not exists used_by uuid references auth.users(id) on delete set null;
alter table public.family_activity add column if not exists logins integer not null default 0;
alter table public.family_activity add column if not exists updated_at timestamptz not null default now();
create index if not exists family_links_learner_idx on public.family_links(learner_id);
create index if not exists family_invites_parent_idx on public.family_invites(parent_id,expires_at desc);
create index if not exists family_activity_learner_date_idx on public.family_activity(learner_id,activity_date desc);

alter table public.family_profiles enable row level security;
alter table public.family_links enable row level security;
alter table public.family_invites enable row level security;
alter table public.family_activity enable row level security;

drop policy if exists "profiles own or linked parent read" on public.family_profiles;
drop policy if exists "profiles own insert" on public.family_profiles;
drop policy if exists "profiles own update" on public.family_profiles;
drop policy if exists "profiles own learner insert" on public.family_profiles;
drop policy if exists "profiles own update without role change" on public.family_profiles;
drop policy if exists "links members read" on public.family_links;
drop policy if exists "parents remove links" on public.family_links;
drop policy if exists "parents create invites" on public.family_invites;
drop policy if exists "parents read invites" on public.family_invites;
drop policy if exists "learners own activity" on public.family_activity;
drop policy if exists "linked parents read activity" on public.family_activity;
drop policy if exists "linked parents clear activity" on public.family_activity;

create policy "profiles own or linked parent read" on public.family_profiles for select to authenticated using (
 auth.uid()=user_id or exists(select 1 from public.family_links l where l.parent_id=auth.uid() and l.learner_id=user_id));
create policy "profiles own learner insert" on public.family_profiles for insert to authenticated
 with check(auth.uid()=user_id and role='learner');
create policy "profiles own update without role change" on public.family_profiles for update to authenticated
 using(auth.uid()=user_id) with check(auth.uid()=user_id and role=(select p.role from public.family_profiles p where p.user_id=auth.uid()));
create policy "links members read" on public.family_links for select to authenticated
 using(auth.uid()=parent_id or auth.uid()=learner_id);
create policy "parents remove links" on public.family_links for delete to authenticated using(auth.uid()=parent_id);
create policy "parents read invites" on public.family_invites for select to authenticated using(auth.uid()=parent_id);
create policy "learners own activity" on public.family_activity for all to authenticated
 using(auth.uid()=learner_id) with check(auth.uid()=learner_id);
create policy "linked parents read activity" on public.family_activity for select to authenticated using(exists(
 select 1 from public.family_links l where l.parent_id=auth.uid() and l.learner_id=family_activity.learner_id));
create policy "linked parents clear activity" on public.family_activity for delete to authenticated using(exists(
 select 1 from public.family_links l where l.parent_id=auth.uid() and l.learner_id=family_activity.learner_id));

drop policy if exists "linked parents read learner tracker" on public.user_tracker_data;
drop policy if exists "linked parents update learner tracker" on public.user_tracker_data;
create policy "linked parents read learner tracker" on public.user_tracker_data for select to authenticated using(exists(
 select 1 from public.family_links l where l.parent_id=auth.uid() and l.learner_id=user_tracker_data.user_id));
create policy "linked parents update learner tracker" on public.user_tracker_data for update to authenticated using(exists(
 select 1 from public.family_links l where l.parent_id=auth.uid() and l.learner_id=user_tracker_data.user_id)) with check(exists(
 select 1 from public.family_links l where l.parent_id=auth.uid() and l.learner_id=user_tracker_data.user_id));

create or replace function public.family_register_learner(p_display_name text default '') returns public.family_profiles
language plpgsql security definer set search_path=public,auth as $$
declare result public.family_profiles;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 insert into public.family_profiles(user_id,display_name,role) values(auth.uid(),left(coalesce(p_display_name,''),120),'learner')
 on conflict(user_id) do update set display_name=excluded.display_name,updated_at=now() where family_profiles.role='learner'
 returning * into result;
 if result.user_id is null then raise exception 'This account is registered as Parent/Admin'; end if;
 return result;
end $$;

create or replace function public.family_register_parent(p_display_name text default '') returns public.family_profiles
language plpgsql security definer set search_path=public,auth as $$
declare result public.family_profiles;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if exists(select 1 from public.family_links where learner_id=auth.uid()) then raise exception 'A linked learner cannot become Parent/Admin'; end if;
 insert into public.family_profiles(user_id,display_name,role) values(auth.uid(),left(coalesce(p_display_name,''),120),'parent')
 on conflict(user_id) do update set display_name=excluded.display_name,updated_at=now() where family_profiles.role='parent'
 returning * into result;
 if result.user_id is null then raise exception 'This account is already registered as learner'; end if;
 return result;
end $$;

create or replace function public.family_generate_invite(p_code text)
returns table(invite_id uuid,expires_at timestamptz)
language plpgsql security definer set search_path=public,auth as $$
declare normalized text:=upper(trim(coalesce(p_code,'')));
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if not exists(select 1 from public.family_profiles where user_id=auth.uid() and role='parent') then raise exception 'Parent/Admin role required'; end if;
 if normalized !~ '^FAM-[A-Z0-9]{6}$' then raise exception 'Invalid family code format'; end if;
 delete from public.family_invites fi where fi.parent_id=auth.uid() and (fi.used_at is not null or fi.expires_at<=now());
 return query insert into public.family_invites(parent_id,code_hash,expires_at)
 values(auth.uid(),encode(extensions.digest(normalized,'sha256'),'hex'),now()+interval '15 minutes') returning family_invites.id,family_invites.expires_at;
end $$;

create or replace function public.family_redeem_invite(p_code text)
returns table(parent_id uuid,parent_name text,linked_at timestamptz)
language plpgsql security definer set search_path=public,auth as $$
declare normalized text:=upper(trim(coalesce(p_code,''))); chosen public.family_invites;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if normalized !~ '^FAM-[A-Z0-9]{6}$' then raise exception 'Invalid or expired family code'; end if;
 if not exists(select 1 from public.family_profiles where user_id=auth.uid() and role='learner') then raise exception 'Register this account as learner first'; end if;
 select fi.* into chosen from public.family_invites fi where fi.code_hash=encode(extensions.digest(normalized,'sha256'),'hex') and fi.used_at is null and fi.expires_at>now() for update;
 if chosen.id is null then raise exception 'Invalid or expired family code'; end if;
 if chosen.parent_id=auth.uid() then raise exception 'You cannot link an account to itself'; end if;
 insert into public.family_links(parent_id,learner_id) values(chosen.parent_id,auth.uid()) on conflict do nothing;
 update public.family_invites fi set used_at=now(),used_by=auth.uid() where fi.id=chosen.id;
 return query select chosen.parent_id,p.display_name,l.linked_at from public.family_links l
 join public.family_profiles p on p.user_id=l.parent_id where l.parent_id=chosen.parent_id and l.learner_id=auth.uid();
end $$;

revoke all on function public.family_register_learner(text) from public;
revoke all on function public.family_register_parent(text) from public;
revoke all on function public.family_generate_invite(text) from public;
revoke all on function public.family_redeem_invite(text) from public;
grant execute on function public.family_register_learner(text),public.family_register_parent(text),public.family_generate_invite(text),public.family_redeem_invite(text) to authenticated;
grant select,insert,update on public.family_profiles to authenticated;
grant select,delete on public.family_links to authenticated;
grant select on public.family_invites to authenticated;
grant select,insert,update,delete on public.family_activity to authenticated;
