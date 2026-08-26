-- Nestlyra Focus Groups migration (V1)
-- Run once in the existing Supabase SQL Editor after reviewing the draft PR.
-- It preserves existing accounts and converts legacy Family links into groups.

create extension if not exists pgcrypto;

create table if not exists public.group_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check(char_length(trim(name)) between 1 and 80),
  kind text not null default 'study' check(kind in ('study','exam','certification','accountability','family')),
  mode text not null default 'view' check(mode in ('view','limited')),
  created_by uuid references auth.users(id) on delete set null,
  legacy_family_learner_id uuid unique references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check(role in ('owner','admin','contributor','member','observer')),
  share_progress boolean not null default true,
  share_activity boolean not null default true,
  share_config jsonb not null default '{"modules":["overall","subjects","tasks","certifications","exams","mocks","revision","assignments","resources","practice","projects","habits","goals","interviews","jobs","timer"],"fields":["progress","counts","study","mock","activity"],"records":["task","goal","plan","note"]}'::jsonb,
  joined_at timestamptz not null default now(),
  primary key(group_id,user_id)
);

create table if not exists public.group_invites (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  code_hash text not null unique,
  invited_role text not null default 'member' check(invited_role in ('admin','contributor','member','observer')),
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.group_progress_snapshots (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  module_type text not null,
  display_name text not null default '',
  progress_percent numeric(5,2) not null default 0 check(progress_percent between 0 and 100),
  completed_count integer not null default 0 check(completed_count>=0),
  total_count integer not null default 0 check(total_count>=0),
  study_minutes integer not null default 0 check(study_minutes>=0),
  mock_average numeric(5,2) not null default 0 check(mock_average between 0 and 100),
  active_minutes integer not null default 0 check(active_minutes>=0),
  screen_changes integer not null default 0 check(screen_changes>=0),
  last_seen timestamptz,
  last_updated timestamptz not null default now(),
  primary key(group_id,user_id,module_type)
);

create table if not exists public.group_shared_records (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  record_type text not null check(record_type in ('task','goal','plan','note')),
  title text not null check(char_length(trim(title)) between 1 and 160),
  details text not null default '' check(char_length(details)<=2000),
  due_date date,
  version integer not null default 1 check(version>0),
  created_by uuid not null references auth.users(id) on delete cascade,
  updated_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check(char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  expires_at timestamptz not null default (now()+interval '30 days')
);

create table if not exists public.group_message_reads (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key(group_id,user_id)
);

create index if not exists group_members_user_idx on public.group_members(user_id,group_id);
create index if not exists group_invites_group_expiry_idx on public.group_invites(group_id,expires_at desc);
create index if not exists group_snapshots_group_idx on public.group_progress_snapshots(group_id,last_updated desc);
create index if not exists group_shared_records_group_idx on public.group_shared_records(group_id,updated_at desc) where deleted_at is null;
create index if not exists group_messages_group_date_idx on public.group_messages(group_id,created_at desc);
create index if not exists group_messages_expiry_idx on public.group_messages(expires_at);

alter table public.group_profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_invites enable row level security;
alter table public.group_progress_snapshots enable row level security;
alter table public.group_shared_records enable row level security;
alter table public.group_messages enable row level security;
alter table public.group_message_reads enable row level security;

create or replace function public.group_is_member(p_group_id uuid,p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public,auth as $$
 select exists(select 1 from public.group_members m join public.groups g on g.id=m.group_id where m.group_id=p_group_id and m.user_id=p_user_id and g.deleted_at is null)
$$;

create or replace function public.group_has_role(p_group_id uuid,p_roles text[],p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public,auth as $$
 select exists(select 1 from public.group_members m join public.groups g on g.id=m.group_id where m.group_id=p_group_id and m.user_id=p_user_id and m.role=any(p_roles) and g.deleted_at is null)
$$;

revoke all on function public.group_is_member(uuid,uuid),public.group_has_role(uuid,text[],uuid) from public,anon;
grant execute on function public.group_is_member(uuid,uuid),public.group_has_role(uuid,text[],uuid) to authenticated;

drop policy if exists "group profiles visible to connections" on public.group_profiles;
drop policy if exists "users insert own group profile" on public.group_profiles;
drop policy if exists "users update own group profile" on public.group_profiles;
create policy "group profiles visible to connections" on public.group_profiles for select to authenticated using (
 user_id=auth.uid() or exists(select 1 from public.group_members mine join public.group_members theirs on theirs.group_id=mine.group_id where mine.user_id=auth.uid() and theirs.user_id=group_profiles.user_id));
create policy "users insert own group profile" on public.group_profiles for insert to authenticated with check(user_id=auth.uid());
create policy "users update own group profile" on public.group_profiles for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());

drop policy if exists "members read groups" on public.groups;
create policy "members read groups" on public.groups for select to authenticated using(public.group_is_member(id));

drop policy if exists "members read memberships" on public.group_members;
create policy "members read memberships" on public.group_members for select to authenticated using(public.group_is_member(group_id));

drop policy if exists "managers read group invites" on public.group_invites;
create policy "managers read group invites" on public.group_invites for select to authenticated using(public.group_has_role(group_id,array['owner','admin']));

drop policy if exists "members read progress snapshots" on public.group_progress_snapshots;
create policy "members read progress snapshots" on public.group_progress_snapshots for select to authenticated using(public.group_is_member(group_id));

drop policy if exists "members read shared records" on public.group_shared_records;
drop policy if exists "editors create shared records" on public.group_shared_records;
drop policy if exists "editors update shared records" on public.group_shared_records;
create policy "members read shared records" on public.group_shared_records for select to authenticated using(public.group_is_member(group_id));
create policy "editors create shared records" on public.group_shared_records for insert to authenticated with check(created_by=auth.uid() and updated_by=auth.uid() and public.group_has_role(group_id,array['owner','admin','contributor']) and exists(select 1 from public.groups g where g.id=group_id and g.mode='limited'));
create policy "editors update shared records" on public.group_shared_records for update to authenticated using(public.group_has_role(group_id,array['owner','admin','contributor'])) with check(updated_by=auth.uid() and public.group_has_role(group_id,array['owner','admin','contributor']));

create or replace function public.group_enforce_message()
returns trigger language plpgsql set search_path=public,auth as $$
begin
 if tg_op='INSERT' then
  new.sender_id:=auth.uid();new.created_at:=now();new.edited_at:=null;new.expires_at:=now()+interval '30 days';
 else
  new.group_id:=old.group_id;new.sender_id:=old.sender_id;new.created_at:=old.created_at;new.expires_at:=old.expires_at;new.edited_at:=now();
 end if;
 return new;
end $$;
drop trigger if exists group_enforce_message_trigger on public.group_messages;
create trigger group_enforce_message_trigger before insert or update on public.group_messages for each row execute function public.group_enforce_message();

drop policy if exists "members read group messages" on public.group_messages;
drop policy if exists "members send group messages" on public.group_messages;
drop policy if exists "senders edit recent group messages" on public.group_messages;
drop policy if exists "senders delete group messages" on public.group_messages;
drop policy if exists "members manage group reads" on public.group_message_reads;
create policy "members read group messages" on public.group_messages for select to authenticated using(public.group_is_member(group_id));
create policy "members send group messages" on public.group_messages for insert to authenticated with check(sender_id=auth.uid() and public.group_is_member(group_id));
create policy "senders edit recent group messages" on public.group_messages for update to authenticated using(sender_id=auth.uid() and created_at>now()-interval '15 minutes' and public.group_is_member(group_id)) with check(sender_id=auth.uid() and public.group_is_member(group_id));
create policy "senders delete group messages" on public.group_messages for delete to authenticated using(sender_id=auth.uid() and public.group_is_member(group_id));
create policy "members manage group reads" on public.group_message_reads for all to authenticated using(user_id=auth.uid() and public.group_is_member(group_id)) with check(user_id=auth.uid() and public.group_is_member(group_id));

create or replace function public.group_ensure_profile(p_display_name text default '')
returns public.group_profiles language plpgsql security definer set search_path=public,auth as $$
declare result public.group_profiles;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 insert into public.group_profiles(user_id,display_name) values(auth.uid(),left(coalesce(nullif(trim(p_display_name),''),'Nestlyra user'),120))
 on conflict(user_id) do update set
  display_name=case
   when nullif(trim(coalesce(p_display_name,'')),'') is null then group_profiles.display_name
   else excluded.display_name
  end,
  updated_at=now()
 returning * into result;
 return result;
end $$;

create or replace function public.group_create(p_name text,p_kind text default 'study',p_mode text default 'view')
returns table(group_id uuid) language plpgsql security definer set search_path=public,auth as $$
declare created uuid;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if p_kind not in ('study','exam','certification','accountability','family') then raise exception 'Invalid group type'; end if;
 if p_mode not in ('view','limited') then raise exception 'Invalid collaboration mode'; end if;
 if char_length(trim(coalesce(p_name,''))) not between 1 and 80 then raise exception 'Group name must be 1 to 80 characters'; end if;
 perform public.group_ensure_profile('');
 insert into public.groups(name,kind,mode,created_by) values(trim(p_name),p_kind,p_mode,auth.uid()) returning id into created;
 insert into public.group_members(group_id,user_id,role) values(created,auth.uid(),'owner');
 return query select created;
end $$;

alter table public.group_members add column if not exists share_config jsonb not null default '{"modules":["overall","subjects","tasks","certifications","exams","mocks","revision","assignments","resources","practice","projects","habits","goals","interviews","jobs","timer"],"fields":["progress","counts","study","mock","activity"],"records":["task","goal","plan","note"]}'::jsonb;

drop function if exists public.group_list();
create function public.group_list()
returns table(group_id uuid,group_name text,group_kind text,group_mode text,viewer_role text,share_progress boolean,share_activity boolean,share_config jsonb,member_count integer,last_message_at timestamptz,unread_count bigint)
language sql security definer set search_path=public,auth as $$
 select g.id,g.name,g.kind,g.mode,m.role,m.share_progress,m.share_activity,m.share_config,
  (select count(*)::integer from public.group_members all_members where all_members.group_id=g.id),
  (select max(msg.created_at) from public.group_messages msg where msg.group_id=g.id),
  (select count(*) from public.group_messages msg where msg.group_id=g.id and msg.sender_id<>auth.uid() and msg.created_at>coalesce((select reads.last_read_at from public.group_message_reads reads where reads.group_id=g.id and reads.user_id=auth.uid()),'epoch'::timestamptz))
 from public.group_members m join public.groups g on g.id=m.group_id
 where m.user_id=auth.uid() and g.deleted_at is null
 order by 10 desc nulls last,g.updated_at desc,g.name
$$;

create or replace function public.group_members_list(p_group_id uuid)
returns table(user_id uuid,display_name text,role text,share_progress boolean,share_activity boolean,joined_at timestamptz)
language plpgsql security definer set search_path=public,auth as $$
begin
 if not public.group_is_member(p_group_id) then raise exception 'Group access denied'; end if;
 return query select m.user_id,coalesce(p.display_name,'Group member'),m.role,m.share_progress,m.share_activity,m.joined_at from public.group_members m left join public.group_profiles p on p.user_id=m.user_id where m.group_id=p_group_id order by case m.role when 'owner' then 1 when 'admin' then 2 when 'contributor' then 3 when 'member' then 4 else 5 end,m.joined_at;
end $$;

create or replace function public.group_generate_invite(p_group_id uuid,p_code text,p_role text default 'member')
returns table(invite_id uuid,expires_at timestamptz) language plpgsql security definer set search_path=public,auth,extensions as $$
declare normalized text:=upper(trim(coalesce(p_code,'')));
begin
 if not public.group_has_role(p_group_id,array['owner','admin']) then raise exception 'Only a group owner or admin can create invitations'; end if;
 if normalized !~ '^NEST-[A-Z0-9]{6}$' then raise exception 'Invalid invitation-code format'; end if;
 if p_role not in ('contributor','member','observer') then raise exception 'Invalid invitation permission'; end if;
 delete from public.group_invites where group_id=p_group_id;
 return query insert into public.group_invites(group_id,created_by,code_hash,invited_role,expires_at) values(p_group_id,auth.uid(),encode(extensions.digest(normalized,'sha256'),'hex'),p_role,now()+interval '15 minutes') returning id,group_invites.expires_at;
end $$;

create or replace function public.group_redeem_invite(p_code text)
returns table(group_id uuid,group_name text,member_role text) language plpgsql security definer set search_path=public,auth,extensions as $$
#variable_conflict use_column
declare compact text:=upper(regexp_replace(coalesce(p_code,''),'[^A-Z0-9]','','g'));normalized text;chosen public.group_invites;name_value text;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 normalized:=case when compact ~ '^NEST[A-Z0-9]{6}$' then 'NEST-'||substring(compact from 5) else upper(trim(coalesce(p_code,''))) end;
 if normalized !~ '^NEST-[A-Z0-9]{6}$' then raise exception 'Invalid or expired group code'; end if;
 select invite.* into chosen from public.group_invites invite join public.groups g on g.id=invite.group_id where invite.code_hash=encode(extensions.digest(normalized,'sha256'),'hex') and invite.used_at is null and invite.expires_at>now() and g.deleted_at is null for update of invite;
 if chosen.id is null then raise exception 'Invalid or expired group code'; end if;
 if exists(select 1 from public.group_members membership where membership.group_id=chosen.group_id and membership.user_id=auth.uid()) then raise exception 'You already belong to this group'; end if;
 perform public.group_ensure_profile('');
 insert into public.group_members(group_id,user_id,role) values(chosen.group_id,auth.uid(),chosen.invited_role);
 update public.group_invites set used_at=now(),used_by=auth.uid() where id=chosen.id;
 select name into name_value from public.groups where id=chosen.group_id;
 return query select chosen.group_id as group_id,name_value as group_name,chosen.invited_role as member_role;
end $$;

create or replace function public.group_change_member_role(p_group_id uuid,p_user_id uuid,p_role text)
returns boolean language plpgsql security definer set search_path=public,auth as $$
begin
 if not public.group_has_role(p_group_id,array['owner','admin']) then raise exception 'Permission denied'; end if;
 if p_role not in ('admin','contributor','member','observer') then raise exception 'Invalid role'; end if;
 if exists(select 1 from public.group_members where group_id=p_group_id and user_id=p_user_id and role='owner') then raise exception 'Transfer ownership before changing the owner'; end if;
 update public.group_members set role=p_role where group_id=p_group_id and user_id=p_user_id;
 if not found then raise exception 'Member not found'; end if;
 return true;
end $$;

create or replace function public.group_transfer_ownership(p_group_id uuid,p_user_id uuid)
returns boolean language plpgsql security definer set search_path=public,auth as $$
begin
 if not public.group_has_role(p_group_id,array['owner']) then raise exception 'Only the current owner can transfer ownership'; end if;
 if p_user_id=auth.uid() then raise exception 'You already own this group'; end if;
 if not exists(select 1 from public.group_members where group_id=p_group_id and user_id=p_user_id) then raise exception 'Choose a current group member'; end if;
 update public.group_members set role='admin' where group_id=p_group_id and user_id=auth.uid() and role='owner';
 update public.group_members set role='owner' where group_id=p_group_id and user_id=p_user_id;
 update public.groups set created_by=p_user_id,updated_at=now() where id=p_group_id;
 return true;
end $$;

create or replace function public.group_remove_member(p_group_id uuid,p_user_id uuid)
returns boolean language plpgsql security definer set search_path=public,auth as $$
begin
 if not public.group_has_role(p_group_id,array['owner','admin']) then raise exception 'Permission denied'; end if;
 if exists(select 1 from public.group_members where group_id=p_group_id and user_id=p_user_id and role='owner') then raise exception 'The group owner cannot be removed'; end if;
 delete from public.group_members where group_id=p_group_id and user_id=p_user_id;
 return found;
end $$;

create or replace function public.group_leave(p_group_id uuid)
returns boolean language plpgsql security definer set search_path=public,auth as $$
declare own_role text;owner_count integer;
begin
 select role into own_role from public.group_members where group_id=p_group_id and user_id=auth.uid();
 if own_role is null then raise exception 'You are not a member of this group'; end if;
 if own_role='owner' then select count(*) into owner_count from public.group_members where group_id=p_group_id and role='owner';if owner_count<=1 then raise exception 'Transfer ownership or delete the group before leaving';end if;end if;
 delete from public.group_members where group_id=p_group_id and user_id=auth.uid();return true;
end $$;

create or replace function public.group_delete(p_group_id uuid)
returns boolean language plpgsql security definer set search_path=public,auth as $$
begin
 if not public.group_has_role(p_group_id,array['owner']) then raise exception 'Only the owner can delete this group'; end if;
 update public.groups set deleted_at=now(),updated_at=now() where id=p_group_id;return found;
end $$;

create or replace function public.group_update_sharing(p_group_id uuid,p_share_progress boolean,p_share_activity boolean)
returns boolean language plpgsql security definer set search_path=public,auth as $$
begin
 update public.group_members set share_progress=coalesce(p_share_progress,true),share_activity=coalesce(p_share_activity,true) where group_id=p_group_id and user_id=auth.uid();if not found then raise exception 'Group membership not found';end if;return true;
end $$;

create or replace function public.group_update_share_config(p_group_id uuid,p_config jsonb)
returns boolean language plpgsql security definer set search_path=public,auth as $$
declare clean jsonb;
begin
 if not public.group_is_member(p_group_id) then raise exception 'Group membership not found'; end if;
 if jsonb_typeof(p_config)<>'object' or jsonb_typeof(p_config->'modules')<>'array' or jsonb_typeof(p_config->'fields')<>'array' or jsonb_typeof(p_config->'records')<>'array' then raise exception 'Invalid sharing configuration'; end if;
 if exists(select 1 from jsonb_array_elements_text(p_config->'modules') value where value not in ('overall','subjects','tasks','certifications','exams','mocks','revision','assignments','resources','practice','projects','habits','goals','interviews','jobs','timer')) then raise exception 'Invalid shared module'; end if;
 if exists(select 1 from jsonb_array_elements_text(p_config->'fields') value where value not in ('progress','counts','study','mock','activity')) then raise exception 'Invalid shared field'; end if;
 if exists(select 1 from jsonb_array_elements_text(p_config->'records') value where value not in ('task','goal','plan','note')) then raise exception 'Invalid shared-record type'; end if;
 clean:=jsonb_build_object('modules',p_config->'modules','fields',p_config->'fields','records',p_config->'records');
 update public.group_members set share_config=clean where group_id=p_group_id and user_id=auth.uid();
 delete from public.group_progress_snapshots where group_id=p_group_id and user_id=auth.uid() and not(module_type=any(array(select jsonb_array_elements_text(clean->'modules'))));
 update public.group_progress_snapshots set
  progress_percent=case when clean->'fields' ? 'progress' then progress_percent else 0 end,
  completed_count=case when clean->'fields' ? 'counts' then completed_count else 0 end,
  total_count=case when clean->'fields' ? 'counts' then total_count else 0 end,
  study_minutes=case when clean->'fields' ? 'study' then study_minutes else 0 end,
  mock_average=case when clean->'fields' ? 'mock' then mock_average else 0 end,
  active_minutes=case when clean->'fields' ? 'activity' then active_minutes else 0 end,
  screen_changes=case when clean->'fields' ? 'activity' then screen_changes else 0 end,
  last_seen=case when clean->'fields' ? 'activity' then last_seen else null end
 where group_id=p_group_id and user_id=auth.uid();
 return true;
end $$;

create or replace function public.group_publish_snapshot(p_group_id uuid,p_snapshot jsonb)
returns boolean language plpgsql security definer set search_path=public,auth as $$
declare member public.group_members;profile_name text;module_name text:=left(coalesce(nullif(trim(p_snapshot->>'module_type'),''),'overall'),40);
begin
 select * into member from public.group_members where group_id=p_group_id and user_id=auth.uid();if member.user_id is null then raise exception 'Group membership not found';end if;
 if not(member.share_config->'modules' ? module_name) then delete from public.group_progress_snapshots where group_id=p_group_id and user_id=auth.uid() and module_type=module_name;return true;end if;
 select display_name into profile_name from public.group_profiles where user_id=auth.uid();
 insert into public.group_progress_snapshots(group_id,user_id,module_type,display_name,progress_percent,completed_count,total_count,study_minutes,mock_average,active_minutes,screen_changes,last_seen,last_updated)
 values(p_group_id,auth.uid(),module_name,coalesce(profile_name,'Group member'),case when member.share_progress and member.share_config->'fields' ? 'progress' then least(100,greatest(0,coalesce((p_snapshot->>'progress_percent')::numeric,0))) else 0 end,case when member.share_progress and member.share_config->'fields' ? 'counts' then greatest(0,coalesce((p_snapshot->>'completed_count')::integer,0)) else 0 end,case when member.share_progress and member.share_config->'fields' ? 'counts' then greatest(0,coalesce((p_snapshot->>'total_count')::integer,0)) else 0 end,case when member.share_progress and member.share_config->'fields' ? 'study' then greatest(0,coalesce((p_snapshot->>'study_minutes')::integer,0)) else 0 end,case when member.share_progress and member.share_config->'fields' ? 'mock' then least(100,greatest(0,coalesce((p_snapshot->>'mock_average')::numeric,0))) else 0 end,case when member.share_activity and member.share_config->'fields' ? 'activity' then greatest(0,coalesce((p_snapshot->>'active_minutes')::integer,0)) else 0 end,case when member.share_activity and member.share_config->'fields' ? 'activity' then greatest(0,coalesce((p_snapshot->>'screen_changes')::integer,0)) else 0 end,case when member.share_activity and member.share_config->'fields' ? 'activity' then nullif(p_snapshot->>'last_seen','')::timestamptz else null end,now())
 on conflict(group_id,user_id,module_type) do update set display_name=excluded.display_name,progress_percent=excluded.progress_percent,completed_count=excluded.completed_count,total_count=excluded.total_count,study_minutes=excluded.study_minutes,mock_average=excluded.mock_average,active_minutes=excluded.active_minutes,screen_changes=excluded.screen_changes,last_seen=excluded.last_seen,last_updated=now();
 return true;
end $$;

create or replace function public.group_save_shared_record(p_id uuid,p_group_id uuid,p_type text,p_title text,p_details text default '',p_due_date date default null,p_expected_version integer default 0)
returns public.group_shared_records language plpgsql security definer set search_path=public,auth as $$
declare result public.group_shared_records;
begin
 if not public.group_has_role(p_group_id,array['owner','admin','contributor']) or not exists(select 1 from public.groups where id=p_group_id and mode='limited') then raise exception 'This group is not editable';end if;
 if p_type not in ('task','goal','plan','note') then raise exception 'Invalid shared-record type';end if;
 if not exists(select 1 from public.group_members where group_id=p_group_id and user_id=auth.uid() and share_config->'records' ? p_type) then raise exception 'This shared-record type is disabled in your sharing controls';end if;
 if p_id is null then
  insert into public.group_shared_records(group_id,record_type,title,details,due_date,created_by,updated_by) values(p_group_id,p_type,left(trim(p_title),160),left(coalesce(p_details,''),2000),p_due_date,auth.uid(),auth.uid()) returning * into result;
 else
  update public.group_shared_records set record_type=p_type,title=left(trim(p_title),160),details=left(coalesce(p_details,''),2000),due_date=p_due_date,version=version+1,updated_by=auth.uid(),updated_at=now() where id=p_id and group_id=p_group_id and version=p_expected_version and deleted_at is null returning * into result;
  if result.id is null then raise exception 'Version conflict: reload the record before saving';end if;
 end if;
 return result;
end $$;

create or replace function public.group_delete_shared_record(p_id uuid,p_group_id uuid)
returns boolean language plpgsql security definer set search_path=public,auth as $$
begin
 if not public.group_has_role(p_group_id,array['owner','admin','contributor']) then raise exception 'Permission denied'; end if;
 update public.group_shared_records set deleted_at=now(),updated_by=auth.uid(),updated_at=now(),version=version+1 where id=p_id and group_id=p_group_id and deleted_at is null;
 return found;
end $$;

create or replace function public.group_mark_read(p_group_id uuid)
returns boolean language plpgsql security definer set search_path=public,auth as $$
begin
 if not public.group_is_member(p_group_id) then raise exception 'Group access denied';end if;
 insert into public.group_message_reads(group_id,user_id,last_read_at) values(p_group_id,auth.uid(),now()) on conflict(group_id,user_id) do update set last_read_at=excluded.last_read_at;return true;
end $$;

create or replace function public.cleanup_group_messages()
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,auth as $$
declare expired_count bigint:=0;pressure_count bigint:=0;database_bytes bigint;message_count bigint;
begin
 delete from public.group_messages where expires_at<=now();get diagnostics expired_count=row_count;database_bytes:=pg_database_size(current_database());
 if database_bytes>=393216000 then select count(*) into message_count from public.group_messages where created_at<now()-interval '1 day';if message_count>0 then with oldest as (select id from public.group_messages where created_at<now()-interval '1 day' order by created_at limit greatest(100,ceil(message_count*.25)::integer)) delete from public.group_messages messages using oldest where messages.id=oldest.id;get diagnostics pressure_count=row_count;end if;end if;
 return jsonb_build_object('expired_deleted',expired_count,'pressure_deleted',pressure_count,'database_bytes',database_bytes,'database_percent',round(database_bytes::numeric/524288000*100,1));
end $$;

create or replace function public.group_cleanup_after_write()
returns trigger language plpgsql security definer set search_path=pg_catalog,public,auth as $$ begin perform public.cleanup_group_messages();return null;end $$;
drop trigger if exists group_cleanup_after_write_trigger on public.group_messages;
create trigger group_cleanup_after_write_trigger after insert on public.group_messages for each statement execute function public.group_cleanup_after_write();

-- Legacy migration. Existing Parent/Learner links become Family groups.
do $$
begin
 if to_regclass('public.family_profiles') is not null then
  execute 'insert into public.group_profiles(user_id,display_name,created_at,updated_at) select user_id,coalesce(nullif(display_name,'''') ,''Nestlyra user''),created_at,updated_at from public.family_profiles on conflict(user_id) do update set display_name=excluded.display_name,updated_at=now()';
 end if;
 if to_regclass('public.family_links') is not null then
  execute 'insert into public.groups(name,kind,mode,created_by,legacy_family_learner_id) select left(coalesce(nullif(p.display_name,''''),''Family'')||'' Family'',80),''family'',''view'',l.learner_id,l.learner_id from (select distinct learner_id from public.family_links) l left join public.family_profiles p on p.user_id=l.learner_id on conflict(legacy_family_learner_id) do nothing';
  execute 'insert into public.group_members(group_id,user_id,role) select g.id,g.legacy_family_learner_id,''owner'' from public.groups g where g.legacy_family_learner_id is not null on conflict(group_id,user_id) do nothing';
  execute 'insert into public.group_members(group_id,user_id,role) select g.id,l.parent_id,''observer'' from public.family_links l join public.groups g on g.legacy_family_learner_id=l.learner_id on conflict(group_id,user_id) do nothing';
 end if;
 if to_regclass('public.family_chat_rooms') is not null and to_regclass('public.family_chat_messages') is not null then
  execute 'insert into public.group_messages(id,group_id,sender_id,body,created_at,edited_at,expires_at) select m.id,g.id,m.sender_id,m.body,m.created_at,m.edited_at,m.expires_at from public.family_chat_messages m join public.family_chat_rooms r on r.id=m.room_id join public.groups g on g.legacy_family_learner_id=r.learner_id on conflict(id) do nothing';
 end if;
 if to_regclass('public.family_chat_rooms') is not null and to_regclass('public.family_chat_reads') is not null then
  execute 'insert into public.group_message_reads(group_id,user_id,last_read_at) select g.id,reads.user_id,reads.last_read_at from public.family_chat_reads reads join public.family_chat_rooms r on r.id=reads.room_id join public.groups g on g.legacy_family_learner_id=r.learner_id on conflict(group_id,user_id) do update set last_read_at=greatest(group_message_reads.last_read_at,excluded.last_read_at)';
 end if;
end $$;

-- Remove legacy policies that exposed complete tracker records to observers.
drop policy if exists "linked parents read learner tracker" on public.user_tracker_data;
drop policy if exists "linked parents update learner tracker" on public.user_tracker_data;
drop policy if exists "linked parents read activity" on public.family_activity;
drop policy if exists "linked parents clear activity" on public.family_activity;

-- Account deletion transfers an owned group when possible, otherwise deletes it.
create or replace function public.delete_own_account()
returns boolean language plpgsql security definer set search_path=pg_catalog,public,auth as $$
declare account_id uuid:=auth.uid();owned record;successor uuid;
begin
 if account_id is null then raise exception 'Authentication required';end if;
 for owned in select group_id from public.group_members where user_id=account_id and role='owner' loop
  select user_id into successor from public.group_members where group_id=owned.group_id and user_id<>account_id order by case role when 'admin' then 1 when 'contributor' then 2 when 'member' then 3 else 4 end,joined_at limit 1;
  if successor is null then update public.groups set deleted_at=now(),updated_at=now() where id=owned.group_id;else update public.group_members set role='owner' where group_id=owned.group_id and user_id=successor;end if;
 end loop;
 delete from auth.users where id=account_id;if not found then raise exception 'Account no longer exists';end if;return true;
end $$;

revoke all on function public.group_ensure_profile(text),public.group_create(text,text,text),public.group_list(),public.group_members_list(uuid),public.group_generate_invite(uuid,text,text),public.group_redeem_invite(text),public.group_change_member_role(uuid,uuid,text),public.group_transfer_ownership(uuid,uuid),public.group_remove_member(uuid,uuid),public.group_leave(uuid),public.group_delete(uuid),public.group_update_sharing(uuid,boolean,boolean),public.group_update_share_config(uuid,jsonb),public.group_publish_snapshot(uuid,jsonb),public.group_save_shared_record(uuid,uuid,text,text,text,date,integer),public.group_delete_shared_record(uuid,uuid),public.group_mark_read(uuid),public.cleanup_group_messages(),public.delete_own_account() from public,anon;
grant execute on function public.group_ensure_profile(text),public.group_create(text,text,text),public.group_list(),public.group_members_list(uuid),public.group_generate_invite(uuid,text,text),public.group_redeem_invite(text),public.group_change_member_role(uuid,uuid,text),public.group_transfer_ownership(uuid,uuid),public.group_remove_member(uuid,uuid),public.group_leave(uuid),public.group_delete(uuid),public.group_update_sharing(uuid,boolean,boolean),public.group_update_share_config(uuid,jsonb),public.group_publish_snapshot(uuid,jsonb),public.group_save_shared_record(uuid,uuid,text,text,text,date,integer),public.group_delete_shared_record(uuid,uuid),public.group_mark_read(uuid),public.cleanup_group_messages(),public.delete_own_account() to authenticated;

grant select on public.group_profiles,public.groups,public.group_members,public.group_invites,public.group_progress_snapshots,public.group_shared_records,public.group_messages,public.group_message_reads to authenticated;
grant insert,update on public.group_profiles to authenticated;
grant insert,update on public.group_shared_records to authenticated;
grant select,insert,delete on public.group_messages to authenticated;
revoke update on public.group_messages from authenticated;
grant update(body) on public.group_messages to authenticated;
grant select,insert,update on public.group_message_reads to authenticated;

do $$ begin alter publication supabase_realtime add table public.group_messages;exception when duplicate_object then null;end $$;

do $$ declare old_job bigint;
begin
 if exists(select 1 from pg_extension where extname='pg_cron') then
  select jobid into old_job from cron.job where jobname='nestlyra-group-message-retention' limit 1;if old_job is not null then perform cron.unschedule(old_job);end if;
  perform cron.schedule('nestlyra-group-message-retention','23 * * * *','select public.cleanup_group_messages();');
 end if;
exception when undefined_table or insufficient_privilege then raise notice 'pg_cron unavailable; cleanup also runs after every message send.';
end $$;
