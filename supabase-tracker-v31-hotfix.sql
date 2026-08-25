-- Nestlyra Focus v31 one-time Supabase update
-- Run this entire file once in Supabase SQL Editor.

-- Parent/Admin is a read-only observer of learner tracker data.
drop policy if exists "linked parents update learner tracker" on public.user_tracker_data;

create or replace function public.family_generate_invite(p_code text)
returns table(invite_id uuid,expires_at timestamptz)
language plpgsql security definer set search_path=public,auth,extensions as $$
declare normalized text:=upper(trim(coalesce(p_code,'')));
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if not exists(select 1 from public.family_profiles where user_id=auth.uid() and role='parent') then raise exception 'Parent/Admin role required'; end if;
 if normalized !~ '^FAM-[A-Z0-9]{6}$' then raise exception 'Invalid family code format'; end if;
 delete from public.family_invites fi where fi.parent_id=auth.uid();
 return query insert into public.family_invites(parent_id,code_hash,expires_at)
 values(auth.uid(),encode(extensions.digest(normalized,'sha256'),'hex'),now()+interval '15 minutes')
 returning family_invites.id,family_invites.expires_at;
end $$;
revoke all on function public.family_generate_invite(text) from public,anon;
grant execute on function public.family_generate_invite(text) to authenticated;

create or replace function public.family_chat_list_rooms()
returns table(room_id uuid,learner_id uuid,learner_name text,viewer_role text,participant_count integer,last_message_at timestamptz,unread_count bigint)
language plpgsql security definer set search_path=public,auth as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 insert into public.family_chat_rooms(learner_id)
 select distinct linked.learner_id from public.family_links as linked
 where linked.parent_id=auth.uid() or linked.learner_id=auth.uid()
 on conflict on constraint family_chat_rooms_learner_id_key do nothing;
 return query
 select rooms.id,rooms.learner_id,coalesce(profiles.display_name,'Learner'),
  case when rooms.learner_id=auth.uid() then 'learner' else 'parent' end,
  (1+(select count(*) from public.family_links as member_links where member_links.learner_id=rooms.learner_id))::integer,
  (select max(messages.created_at) from public.family_chat_messages as messages where messages.room_id=rooms.id),
  (select count(*) from public.family_chat_messages as unread_messages where unread_messages.room_id=rooms.id and unread_messages.sender_id<>auth.uid()
    and unread_messages.created_at>coalesce((select reads.last_read_at from public.family_chat_reads as reads where reads.room_id=rooms.id and reads.user_id=auth.uid()),'epoch'::timestamptz))
 from public.family_chat_rooms as rooms
 left join public.family_profiles as profiles on profiles.user_id=rooms.learner_id
 where rooms.learner_id=auth.uid() or exists(select 1 from public.family_links as accessible_links where accessible_links.learner_id=rooms.learner_id and accessible_links.parent_id=auth.uid())
 order by 6 desc nulls last,3;
end $$;
revoke all on function public.family_chat_list_rooms() from public,anon;
grant execute on function public.family_chat_list_rooms() to authenticated;
