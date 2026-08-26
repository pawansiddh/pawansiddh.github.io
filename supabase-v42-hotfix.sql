-- Nestlyra v42 Groups invitation hotfix
-- Run once in Supabase SQL Editor. Existing users, groups and tracker data are preserved.

create extension if not exists pgcrypto with schema extensions;

create or replace function public.group_redeem_invite(p_code text)
returns table(group_id uuid,group_name text,member_role text)
language plpgsql
security definer
set search_path=public,auth,extensions as $$
#variable_conflict use_column
declare
  compact text:=upper(regexp_replace(coalesce(p_code,''),'[^A-Z0-9]','','g'));
  normalized text;
  chosen public.group_invites;
  name_value text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  normalized:=case when compact ~ '^NEST[A-Z0-9]{6}$' then 'NEST-'||substring(compact from 5) else upper(trim(coalesce(p_code,''))) end;
  if normalized !~ '^NEST-[A-Z0-9]{6}$' then raise exception 'Invalid or expired group code'; end if;

  select invite.* into chosen
  from public.group_invites invite
  join public.groups target_group on target_group.id=invite.group_id
  where invite.code_hash=encode(extensions.digest(normalized,'sha256'),'hex')
    and invite.used_at is null
    and invite.expires_at>now()
    and target_group.deleted_at is null
  for update of invite;

  if chosen.id is null then raise exception 'Invalid or expired group code'; end if;
  if exists(
    select 1
    from public.group_members membership
    where membership.group_id=chosen.group_id
      and membership.user_id=auth.uid()
  ) then raise exception 'You already belong to this group'; end if;

  perform public.group_ensure_profile('');
  insert into public.group_members(group_id,user_id,role)
  values(chosen.group_id,auth.uid(),chosen.invited_role);
  update public.group_invites invite
  set used_at=now(),used_by=auth.uid()
  where invite.id=chosen.id;
  select target_group.name into name_value
  from public.groups target_group
  where target_group.id=chosen.group_id;
  return query
  select chosen.group_id as group_id,
         name_value as group_name,
         chosen.invited_role as member_role;
end $$;

revoke all on function public.group_redeem_invite(text) from public,anon;
grant execute on function public.group_redeem_invite(text) to authenticated;

notify pgrst,'reload schema';
