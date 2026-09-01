-- Transactional production smoke test for the subscription foundation.
-- It temporarily simulates trial and paid access for the oldest auth user, then
-- rolls every write back. A successful run returns one row containing
-- `subscription smoke test passed` and leaves no subscription data behind.

begin;

create temporary table subscription_smoke_context(account_id uuid not null) on commit drop;
insert into subscription_smoke_context(account_id)
select id from auth.users order by created_at limit 1;

do $$
begin
  if not exists(select 1 from subscription_smoke_context) then
    raise exception 'Create at least one Supabase Auth user before running this smoke test';
  end if;
end
$$;

select set_config('request.jwt.claim.sub',(select account_id::text from subscription_smoke_context),true);
select set_config(
  'request.jwt.claims',
  jsonb_build_object(
    'sub',(select account_id::text from subscription_smoke_context),
    'email','owner-smoke-test@tulshii.invalid',
    'role','authenticated'
  )::text,
  true
);

set local role authenticated;
do $$
declare access_row record;
begin
  select * into access_row from public.subscription_start_trial('Rollback-only smoke test');
  if access_row.access_state<>'trialing' or access_row.seat_limit<>1
    or access_row.can_use_app is not true or access_row.can_invite is not false then
    raise exception 'Trial access smoke test failed';
  end if;
end
$$;
reset role;

update public.subscription_plans
set provider='manual',provider_variant_id='rollback-smoke-family-annual',
  price_minor=1000,currency='USD',is_active=true
where code='family_annual';

do $$
declare applied boolean;
begin
  select public.subscription_apply_provider_event(
    'manual','rollback-smoke-event','subscription_payment_success',
    (select account_id from subscription_smoke_context),'family_annual',
    'rollback-smoke-customer','rollback-smoke-subscription','active',
    now(),now()+interval '1 year',null,false,now(),null,true
  ) into applied;
  if applied is not true then raise exception 'Provider event smoke test failed'; end if;
end
$$;

set local role authenticated;
do $$
declare
  access_row record;
  invite_row record;
begin
  select * into access_row from public.subscription_access();
  if access_row.access_state<>'active' or access_row.seat_limit<>5
    or access_row.can_use_app is not true or access_row.can_invite is not true
    or access_row.can_download is not true then
    raise exception 'Paid entitlement smoke test failed';
  end if;

  select * into invite_row from public.subscription_create_invite('member-smoke-test@tulshii.invalid');
  if invite_row.invite_code !~ '^TUL-[A-F0-9]{18}$' then
    raise exception 'Invitation smoke test failed';
  end if;
end
$$;
reset role;

rollback;

select 'subscription smoke test passed' as result;
