-- Study Tracker messaging hotfix
-- Run this once in Supabase SQL Editor to replace the older ambiguous function.
create or replace function public.family_chat_list_rooms()
returns table(
 room_id uuid,
 learner_id uuid,
 learner_name text,
 viewer_role text,
 participant_count integer,
 last_message_at timestamptz,
 unread_count bigint
)
language plpgsql
security definer
set search_path=public,auth
as $$
begin
 if auth.uid() is null then
  raise exception 'Authentication required';
 end if;

 insert into public.family_chat_rooms(learner_id)
 select distinct links.learner_id
 from public.family_links as links
 where links.parent_id=auth.uid() or links.learner_id=auth.uid()
 on conflict on constraint family_chat_rooms_learner_id_key do nothing;

 return query
 select
  rooms.id,
  rooms.learner_id,
  coalesce(profiles.display_name,'Learner'),
  case when rooms.learner_id=auth.uid() then 'learner' else 'parent' end,
  (1+(
   select count(*)
   from public.family_links as participant_links
   where participant_links.learner_id=rooms.learner_id
  ))::integer,
  (
   select max(messages.created_at)
   from public.family_chat_messages as messages
   where messages.room_id=rooms.id
  ),
  (
   select count(*)
   from public.family_chat_messages as messages
   where messages.room_id=rooms.id
    and messages.sender_id<>auth.uid()
    and messages.created_at>coalesce((
     select reads.last_read_at
     from public.family_chat_reads as reads
     where reads.room_id=rooms.id and reads.user_id=auth.uid()
    ),'epoch'::timestamptz)
  )
 from public.family_chat_rooms as rooms
 left join public.family_profiles as profiles on profiles.user_id=rooms.learner_id
 where rooms.learner_id=auth.uid()
  or exists(
   select 1
   from public.family_links as accessible_links
   where accessible_links.learner_id=rooms.learner_id
    and accessible_links.parent_id=auth.uid()
  )
 order by 6 desc nulls last,3;
end $$;

revoke all on function public.family_chat_list_rooms() from public,anon;
grant execute on function public.family_chat_list_rooms() to authenticated;
