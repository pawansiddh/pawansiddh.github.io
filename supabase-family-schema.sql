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

-- Text-only Family Messaging. One room belongs to one learner and automatically
-- includes every Parent/Admin currently linked to that learner.
create table if not exists public.family_chat_rooms (
 id uuid primary key default gen_random_uuid(),
 learner_id uuid not null unique references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
create table if not exists public.family_chat_messages (
 id uuid primary key default gen_random_uuid(),
 room_id uuid not null references public.family_chat_rooms(id) on delete cascade,
 sender_id uuid not null references auth.users(id) on delete cascade,
 body text not null check(char_length(trim(body)) between 1 and 2000),
 created_at timestamptz not null default now(),
 edited_at timestamptz,
 expires_at timestamptz not null default (now()+interval '30 days')
);
create table if not exists public.family_chat_reads (
 room_id uuid not null references public.family_chat_rooms(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 last_read_at timestamptz not null default now(),
 primary key(room_id,user_id)
);
create index if not exists family_chat_messages_room_date_idx on public.family_chat_messages(room_id,created_at desc);
create index if not exists family_chat_messages_expiry_idx on public.family_chat_messages(expires_at);

-- The server, rather than the browser, owns message identity and retention dates.
-- A user can edit only the text; no client can extend the 30-day lifetime.
create or replace function public.family_chat_enforce_message()
returns trigger language plpgsql set search_path=public,auth as $$
begin
 if tg_op='INSERT' then
  new.sender_id:=auth.uid();
  new.created_at:=now();
  new.edited_at:=null;
  new.expires_at:=now()+interval '30 days';
 else
  new.room_id:=old.room_id;
  new.sender_id:=old.sender_id;
  new.created_at:=old.created_at;
  new.expires_at:=old.expires_at;
  new.edited_at:=now();
 end if;
 return new;
end $$;
drop trigger if exists family_chat_enforce_message_trigger on public.family_chat_messages;
create trigger family_chat_enforce_message_trigger before insert or update on public.family_chat_messages
for each row execute function public.family_chat_enforce_message();

alter table public.family_chat_rooms enable row level security;
alter table public.family_chat_messages enable row level security;
alter table public.family_chat_reads enable row level security;

create or replace function public.family_chat_can_access(p_room_id uuid,p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public,auth as $$
 select exists(
  select 1 from public.family_chat_rooms r
  where r.id=p_room_id and (
   r.learner_id=p_user_id or exists(
    select 1 from public.family_links l where l.learner_id=r.learner_id and l.parent_id=p_user_id
   )
  )
 )
$$;
revoke all on function public.family_chat_can_access(uuid,uuid) from public,anon;
grant execute on function public.family_chat_can_access(uuid,uuid) to authenticated;

drop policy if exists "chat members read rooms" on public.family_chat_rooms;
drop policy if exists "chat members read messages" on public.family_chat_messages;
drop policy if exists "chat members send messages" on public.family_chat_messages;
drop policy if exists "senders edit recent messages" on public.family_chat_messages;
drop policy if exists "senders delete messages" on public.family_chat_messages;
drop policy if exists "members manage own read marker" on public.family_chat_reads;
create policy "chat members read rooms" on public.family_chat_rooms for select to authenticated
 using(public.family_chat_can_access(id));
create policy "chat members read messages" on public.family_chat_messages for select to authenticated
 using(public.family_chat_can_access(room_id));
create policy "chat members send messages" on public.family_chat_messages for insert to authenticated
 with check(sender_id=auth.uid() and public.family_chat_can_access(room_id));
create policy "senders edit recent messages" on public.family_chat_messages for update to authenticated
 using(sender_id=auth.uid() and created_at>now()-interval '15 minutes' and public.family_chat_can_access(room_id))
 with check(sender_id=auth.uid() and public.family_chat_can_access(room_id));
create policy "senders delete messages" on public.family_chat_messages for delete to authenticated
 using(sender_id=auth.uid() and public.family_chat_can_access(room_id));
create policy "members manage own read marker" on public.family_chat_reads for all to authenticated
 using(user_id=auth.uid() and public.family_chat_can_access(room_id))
 with check(user_id=auth.uid() and public.family_chat_can_access(room_id));

create or replace function public.family_chat_list_rooms()
returns table(room_id uuid,learner_id uuid,learner_name text,viewer_role text,participant_count integer,last_message_at timestamptz,unread_count bigint)
language plpgsql security definer set search_path=public,auth as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 insert into public.family_chat_rooms(learner_id)
 select distinct l.learner_id from public.family_links l
 where l.parent_id=auth.uid() or l.learner_id=auth.uid()
 on conflict on constraint family_chat_rooms_learner_id_key do nothing;
 return query
 select r.id,r.learner_id,coalesce(p.display_name,'Learner'),
  case when r.learner_id=auth.uid() then 'learner' else 'parent' end,
  (1+(select count(*) from public.family_links pc where pc.learner_id=r.learner_id))::integer,
  (select max(m.created_at) from public.family_chat_messages m where m.room_id=r.id),
  (select count(*) from public.family_chat_messages m where m.room_id=r.id and m.sender_id<>auth.uid()
    and m.created_at>coalesce((select rd.last_read_at from public.family_chat_reads rd where rd.room_id=r.id and rd.user_id=auth.uid()),'epoch'::timestamptz))
 from public.family_chat_rooms r
 left join public.family_profiles p on p.user_id=r.learner_id
 where r.learner_id=auth.uid() or exists(select 1 from public.family_links l where l.learner_id=r.learner_id and l.parent_id=auth.uid())
 order by 6 desc nulls last,3;
end $$;

create or replace function public.family_chat_participants(p_room_id uuid)
returns table(user_id uuid,display_name text,role text)
language plpgsql security definer set search_path=public,auth as $$
begin
 if not public.family_chat_can_access(p_room_id) then raise exception 'Chat access denied'; end if;
 return query
 with room as (select learner_id from public.family_chat_rooms where id=p_room_id),
 members as (
  select learner_id as id from room
  union select l.parent_id from public.family_links l join room r on r.learner_id=l.learner_id
 )
 select m.id,coalesce(p.display_name,'Family member'),coalesce(p.role,'learner')
 from members m left join public.family_profiles p on p.user_id=m.id;
end $$;

create or replace function public.family_chat_mark_read(p_room_id uuid)
returns boolean language plpgsql security definer set search_path=public,auth as $$
begin
 if auth.uid() is null or not public.family_chat_can_access(p_room_id) then raise exception 'Chat access denied'; end if;
 insert into public.family_chat_reads(room_id,user_id,last_read_at) values(p_room_id,auth.uid(),now())
 on conflict(room_id,user_id) do update set last_read_at=excluded.last_read_at;
 return true;
end $$;

-- Free projects become read-only at 500 MB database size. Normal retention is
-- 30 days. At 75% (375 MB), the oldest messages over one day old are removed
-- in 25% batches so chat can never be the reason the tracker reaches the cap.
create or replace function public.cleanup_family_chat()
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,auth as $$
declare expired_count bigint:=0;pressure_count bigint:=0;database_bytes bigint;message_count bigint;
begin
 delete from public.family_chat_messages where expires_at<=now();
 get diagnostics expired_count=row_count;
 database_bytes:=pg_database_size(current_database());
 if database_bytes>=393216000 then
  select count(*) into message_count from public.family_chat_messages where created_at<now()-interval '1 day';
  if message_count>0 then
   with oldest as (
    select id from public.family_chat_messages where created_at<now()-interval '1 day'
    order by created_at limit greatest(100,ceil(message_count*.25)::integer)
   ) delete from public.family_chat_messages m using oldest where m.id=oldest.id;
   get diagnostics pressure_count=row_count;
  end if;
 end if;
 return jsonb_build_object('expired_deleted',expired_count,'pressure_deleted',pressure_count,'database_bytes',database_bytes,'database_percent',round(database_bytes::numeric/524288000*100,1));
end $$;

-- Run the safeguard after every send even if the browser closes before its
-- follow-up cleanup call. This keeps the 75% rule server-enforced.
create or replace function public.family_chat_cleanup_after_write()
returns trigger language plpgsql security definer set search_path=pg_catalog,public,auth as $$
begin
 perform public.cleanup_family_chat();
 return null;
end $$;
drop trigger if exists family_chat_cleanup_after_write_trigger on public.family_chat_messages;
create trigger family_chat_cleanup_after_write_trigger after insert on public.family_chat_messages
for each statement execute function public.family_chat_cleanup_after_write();

revoke all on function public.family_chat_list_rooms() from public,anon;
revoke all on function public.family_chat_participants(uuid) from public,anon;
revoke all on function public.family_chat_mark_read(uuid) from public,anon;
revoke all on function public.cleanup_family_chat() from public,anon;
grant execute on function public.family_chat_list_rooms(),public.family_chat_participants(uuid),public.family_chat_mark_read(uuid),public.cleanup_family_chat() to authenticated;
grant select on public.family_chat_rooms to authenticated;
grant select,insert,delete on public.family_chat_messages to authenticated;
revoke update on public.family_chat_messages from authenticated;
grant update(body) on public.family_chat_messages to authenticated;
grant select,insert,update on public.family_chat_reads to authenticated;

do $$ begin
 alter publication supabase_realtime add table public.family_chat_messages;
exception when duplicate_object then null;
end $$;

do $$ declare old_job bigint;
begin
 if exists(select 1 from pg_extension where extname='pg_cron') then
  select jobid into old_job from cron.job where jobname='study-tracker-chat-retention' limit 1;
  if old_job is not null then perform cron.unschedule(old_job); end if;
  perform cron.schedule('study-tracker-chat-retention','17 * * * *','select public.cleanup_family_chat();');
 end if;
exception when undefined_table or insufficient_privilege then
 raise notice 'pg_cron unavailable; cleanup will run when Messaging opens or sends.';
end $$;

-- Deletes only the currently authenticated account. All tracker and Family rows
-- are removed by their ON DELETE CASCADE foreign keys.
create or replace function public.delete_own_account()
returns boolean
language plpgsql security definer set search_path=pg_catalog,public,auth as $$
declare account_id uuid:=auth.uid();
begin
 if account_id is null then raise exception 'Authentication required'; end if;
 delete from auth.users where id=account_id;
 if not found then raise exception 'Account no longer exists'; end if;
 return true;
end $$;
revoke all on function public.delete_own_account() from public,anon;
grant execute on function public.delete_own_account() to authenticated;
