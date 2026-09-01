-- TULSHII subscription and entitlement foundation (v1).
-- Safe to run repeatedly. This migration is additive and does not modify the
-- existing Family, Groups, messaging or tracker tables.

begin;

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.subscription_settings (
  singleton boolean primary key default true check (singleton),
  trial_days smallint not null default 7 check (trial_days between 0 and 90),
  trial_seat_limit smallint not null default 1 check (trial_seat_limit between 1 and 25),
  payment_grace_days smallint not null default 7 check (payment_grace_days between 0 and 60),
  family_seat_limit smallint not null default 5 check (family_seat_limit between 1 and 25),
  redemption_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.subscription_settings(singleton)
values(true)
on conflict(singleton) do nothing;

create table if not exists public.subscription_plans (
  code text primary key check (code ~ '^[a-z0-9][a-z0-9_]{2,63}$'),
  display_name text not null check (char_length(trim(display_name)) between 3 and 120),
  description text not null default '',
  interval_unit text not null check (interval_unit in ('day','week','month','year','one_time')),
  interval_count smallint not null default 1 check (interval_count between 1 and 120),
  price_minor integer check (price_minor is null or price_minor >= 0),
  currency text check (currency is null or currency ~ '^[A-Z]{3}$'),
  trial_days smallint not null default 7 check (trial_days between 0 and 90),
  seat_limit smallint not null default 5 check (seat_limit between 1 and 25),
  lifetime_downloads boolean not null default true,
  provider text check (provider is null or provider in ('lemon_squeezy','stripe','paddle','manual')),
  provider_variant_id text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider,provider_variant_id)
);

-- Prices and provider IDs intentionally remain unset until the commercial
-- values are final. A plan is not public until is_active is explicitly enabled.
insert into public.subscription_plans(
  code,display_name,description,interval_unit,interval_count,trial_days,seat_limit,lifetime_downloads,is_active
) values
  ('family_annual','TULSHII Family Annual','One owner and up to four invited members.','year',1,7,5,true,false),
  ('family_3_year','TULSHII Family 3-Year','One owner and up to four invited members for three years.','year',3,7,5,true,false)
on conflict(code) do nothing;

create table if not exists public.subscription_households (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null default 'My family' check (char_length(trim(display_name)) between 1 and 120),
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (trial_ends_at is null or (trial_started_at is not null and trial_ends_at > trial_started_at))
);

create table if not exists public.subscription_members (
  household_id uuid not null references public.subscription_households(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','member')),
  invited_by uuid references auth.users(id) on delete set null,
  joined_at timestamptz not null default now(),
  primary key(household_id,user_id)
);

create table if not exists public.subscription_trial_claims (
  user_id uuid primary key references auth.users(id) on delete cascade,
  household_id uuid references public.subscription_households(id) on delete set null,
  claimed_at timestamptz not null default now()
);

create table if not exists public.subscription_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.subscription_households(id) on delete cascade,
  invited_email text not null check (char_length(invited_email) between 3 and 320),
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  invited_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (expires_at > created_at)
);

create table if not exists public.subscription_records (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.subscription_households(id) on delete cascade,
  plan_code text not null references public.subscription_plans(code) on update cascade,
  provider text not null check (provider in ('lemon_squeezy','stripe','paddle','manual')),
  provider_customer_id text,
  provider_subscription_id text not null,
  status text not null check (status in ('trialing','active','past_due','paused','cancelled','expired','refunded','disputed')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  grace_ends_at timestamptz,
  cancel_at_period_end boolean not null default false,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  last_event_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider,provider_subscription_id),
  check (current_period_end is null or current_period_start is null or current_period_end > current_period_start)
);

create table if not exists public.subscription_entitlements (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.subscription_households(id) on delete cascade,
  entitlement_code text not null check (entitlement_code ~ '^[a-z0-9][a-z0-9_]{2,63}$'),
  source_type text not null check (source_type in ('provider_payment','redemption','manual')),
  source_ref text not null check (char_length(source_ref) between 1 and 255),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  revoke_reason text,
  created_at timestamptz not null default now(),
  check (expires_at is null or expires_at > starts_at)
);

create table if not exists public.subscription_provider_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('lemon_squeezy','stripe','paddle','manual')),
  provider_event_id text not null,
  event_type text not null,
  household_id uuid references public.subscription_households(id) on delete set null,
  subscription_id uuid references public.subscription_records(id) on delete set null,
  payload_sha256 text check (payload_sha256 is null or payload_sha256 ~ '^[a-f0-9]{64}$'),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text,
  unique(provider,provider_event_id)
);

-- Reserved for a future approved marketplace channel. No authenticated RPC is
-- granted for issuing or redeeming these codes in v1.
create table if not exists public.subscription_redemption_codes (
  id uuid primary key default gen_random_uuid(),
  channel text not null default 'etsy' check (channel in ('etsy','partner','manual')),
  external_order_ref text,
  plan_code text not null references public.subscription_plans(code) on update cascade,
  code_hash text not null unique check (code_hash ~ '^[a-f0-9]{64}$'),
  status text not null default 'issued' check (status in ('issued','redeemed','revoked','expired')),
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  redeemed_by uuid references auth.users(id) on delete set null,
  redeemed_household_id uuid references public.subscription_households(id) on delete set null,
  redeemed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  check (expires_at is null or expires_at > issued_at)
);

create unique index if not exists subscription_one_lifetime_entitlement_idx
  on public.subscription_entitlements(household_id,entitlement_code)
  where expires_at is null and revoked_at is null;
create unique index if not exists subscription_redemption_order_idx
  on public.subscription_redemption_codes(channel,external_order_ref)
  where external_order_ref is not null;
create index if not exists subscription_members_household_idx on public.subscription_members(household_id,joined_at);
create index if not exists subscription_invites_household_idx on public.subscription_invites(household_id,created_at desc);
create index if not exists subscription_invites_expiry_idx on public.subscription_invites(expires_at) where accepted_at is null and revoked_at is null;
create index if not exists subscription_records_household_idx on public.subscription_records(household_id,last_event_at desc);
create index if not exists subscription_events_household_idx on public.subscription_provider_events(household_id,received_at desc);

create or replace function public.subscription_touch_updated_at()
returns trigger
language plpgsql
set search_path=public
as $$
begin
  new.updated_at:=now();
  return new;
end
$$;

drop trigger if exists subscription_settings_touch on public.subscription_settings;
create trigger subscription_settings_touch before update on public.subscription_settings
for each row execute function public.subscription_touch_updated_at();
drop trigger if exists subscription_plans_touch on public.subscription_plans;
create trigger subscription_plans_touch before update on public.subscription_plans
for each row execute function public.subscription_touch_updated_at();
drop trigger if exists subscription_households_touch on public.subscription_households;
create trigger subscription_households_touch before update on public.subscription_households
for each row execute function public.subscription_touch_updated_at();
drop trigger if exists subscription_records_touch on public.subscription_records;
create trigger subscription_records_touch before update on public.subscription_records
for each row execute function public.subscription_touch_updated_at();

create or replace function public.subscription_household_for_user(p_user_id uuid default auth.uid())
returns uuid
language sql
stable
security definer
set search_path=public,auth
as $$
  select m.household_id
  from public.subscription_members m
  where m.user_id=p_user_id
  limit 1
$$;

create or replace function public.subscription_seat_limit_for_household(p_household_id uuid)
returns integer
language plpgsql
stable
security definer
set search_path=public,auth
as $$
declare
  result integer;
begin
  select max(p.seat_limit)::integer into result
  from public.subscription_records r
  join public.subscription_plans p on p.code=r.plan_code
  where r.household_id=p_household_id
    and (
      (r.status in ('trialing','active','cancelled') and coalesce(r.current_period_end,'infinity'::timestamptz)>now())
      or (r.status='past_due' and r.grace_ends_at>now())
    );

  if result is null then
    select s.trial_seat_limit into result from public.subscription_settings s where s.singleton=true;
  end if;
  return coalesce(result,1);
end
$$;

create or replace function public.subscription_enforce_member()
returns trigger
language plpgsql
security definer
set search_path=public,auth
as $$
declare
  household_owner uuid;
  allowed_seats integer;
  used_seats integer;
begin
  select h.owner_user_id into household_owner
  from public.subscription_households h
  where h.id=new.household_id
  for update;

  if household_owner is null then raise exception 'Subscription household not found'; end if;
  if new.role='owner' and new.user_id<>household_owner then raise exception 'Only the household owner can hold the owner role'; end if;
  if new.role='member' and new.user_id=household_owner then raise exception 'The household owner must hold the owner role'; end if;

  if tg_op='INSERT' or new.household_id<>old.household_id then
    allowed_seats:=public.subscription_seat_limit_for_household(new.household_id);
    select count(*)::integer into used_seats from public.subscription_members m where m.household_id=new.household_id;
    if used_seats>=allowed_seats then raise exception 'This membership has no available seats'; end if;
  end if;
  return new;
end
$$;

drop trigger if exists subscription_members_enforce on public.subscription_members;
create trigger subscription_members_enforce before insert or update on public.subscription_members
for each row execute function public.subscription_enforce_member();

alter table public.subscription_settings enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.subscription_households enable row level security;
alter table public.subscription_members enable row level security;
alter table public.subscription_trial_claims enable row level security;
alter table public.subscription_invites enable row level security;
alter table public.subscription_records enable row level security;
alter table public.subscription_entitlements enable row level security;
alter table public.subscription_provider_events enable row level security;
alter table public.subscription_redemption_codes enable row level security;

drop policy if exists "public reads configured subscription plans" on public.subscription_plans;
create policy "public reads configured subscription plans"
on public.subscription_plans for select to anon,authenticated
using(is_active and price_minor is not null and currency is not null and provider is not null and provider_variant_id is not null);

create or replace function public.subscription_access()
returns table(
  household_id uuid,
  household_role text,
  access_state text,
  plan_code text,
  plan_name text,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  grace_ends_at timestamptz,
  seat_limit integer,
  seats_used integer,
  can_use_app boolean,
  can_invite boolean,
  can_download boolean
)
language plpgsql
stable
security definer
set search_path=public,auth
as $$
declare
  account_id uuid:=auth.uid();
  membership public.subscription_members;
  household public.subscription_households;
  paid record;
  paid_found boolean:=false;
  result_state text:='none';
  result_plan_code text;
  result_plan_name text;
  result_period_end timestamptz;
  result_grace_end timestamptz;
  result_limit integer:=0;
  result_used integer:=0;
  result_app boolean:=false;
  result_invite boolean:=false;
  result_download boolean:=false;
begin
  if account_id is null then raise exception 'Authentication required'; end if;

  select m.* into membership
  from public.subscription_members m
  where m.user_id=account_id;

  if membership.user_id is null then
    return query select null::uuid,null::text,'none'::text,null::text,null::text,null::timestamptz,
      null::timestamptz,null::timestamptz,0,0,false,false,false;
    return;
  end if;

  select h.* into household from public.subscription_households h where h.id=membership.household_id;
  select r.*,p.display_name as selected_plan_name,p.seat_limit as selected_seat_limit
    into paid
  from public.subscription_records r
  join public.subscription_plans p on p.code=r.plan_code
  where r.household_id=household.id
    and (
      (r.status in ('trialing','active','cancelled') and coalesce(r.current_period_end,'infinity'::timestamptz)>now())
      or (r.status='past_due' and r.grace_ends_at>now())
    )
  order by
    case when r.status in ('trialing','active','cancelled') then 0 else 1 end,
    r.last_event_at desc
  limit 1;
  paid_found:=found;

  select exists(
    select 1 from public.subscription_entitlements e
    where e.household_id=household.id and e.entitlement_code='download_package'
      and e.revoked_at is null and (e.expires_at is null or e.expires_at>now())
  ) into result_download;

  select count(*)::integer into result_used from public.subscription_members m where m.household_id=household.id;

  if paid_found then
    result_plan_code:=paid.plan_code;
    result_plan_name:=paid.selected_plan_name;
    result_period_end:=paid.current_period_end;
    result_grace_end:=paid.grace_ends_at;
    result_limit:=paid.selected_seat_limit;
    if paid.status='past_due' then
      result_state:='grace';
      result_app:=true;
      result_invite:=false;
    else
      result_state:='active';
      result_app:=true;
      result_invite:=membership.role='owner' and result_used<result_limit;
    end if;
  elsif not exists(select 1 from public.subscription_records r where r.household_id=household.id)
    and household.trial_ends_at>now() then
    result_state:='trialing';
    result_limit:=1;
    result_app:=true;
    result_invite:=false;
  else
    result_state:='expired';
    result_limit:=public.subscription_seat_limit_for_household(household.id);
  end if;

  return query select household.id,membership.role,result_state,result_plan_code,result_plan_name,
    household.trial_ends_at,result_period_end,result_grace_end,result_limit,result_used,
    result_app,result_invite,result_download;
end
$$;

create or replace function public.subscription_start_trial(p_household_name text default 'My family')
returns table(
  household_id uuid,
  household_role text,
  access_state text,
  plan_code text,
  plan_name text,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  grace_ends_at timestamptz,
  seat_limit integer,
  seats_used integer,
  can_use_app boolean,
  can_invite boolean,
  can_download boolean
)
language plpgsql
security definer
set search_path=public,auth
as $$
declare
  account_id uuid:=auth.uid();
  created_household uuid;
  configured_trial_days integer;
begin
  if account_id is null then raise exception 'Authentication required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(account_id::text,0));

  if exists(select 1 from public.subscription_members m where m.user_id=account_id) then
    return query select * from public.subscription_access();
    return;
  end if;
  if exists(select 1 from public.subscription_trial_claims c where c.user_id=account_id) then
    raise exception 'The free trial has already been used by this account';
  end if;

  select s.trial_days into configured_trial_days from public.subscription_settings s where s.singleton=true;
  insert into public.subscription_households(owner_user_id,display_name,trial_started_at,trial_ends_at)
  values(account_id,left(coalesce(nullif(trim(p_household_name),''),'My family'),120),now(),now()+make_interval(days=>coalesce(configured_trial_days,7)))
  returning id into created_household;
  insert into public.subscription_members(household_id,user_id,role)
  values(created_household,account_id,'owner');
  insert into public.subscription_trial_claims(user_id,household_id)
  values(account_id,created_household);

  return query select * from public.subscription_access();
end
$$;

create or replace function public.subscription_create_invite(p_email text)
returns table(invite_code text,invited_email text,expires_at timestamptz)
language plpgsql
security definer
set search_path=public,auth,extensions
as $$
declare
  account_id uuid:=auth.uid();
  access_record record;
  normalized_email text:=lower(trim(coalesce(p_email,'')));
  raw_code text;
  result_expiry timestamptz:=now()+interval '7 days';
begin
  if account_id is null then raise exception 'Authentication required'; end if;
  if normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Enter a valid email address'; end if;

  select * into access_record from public.subscription_access();
  if access_record.household_role<>'owner' then raise exception 'Only the membership owner can invite members'; end if;
  if access_record.access_state<>'active' then raise exception 'An active paid membership is required to invite members'; end if;
  if not access_record.can_invite then raise exception 'This membership has no available seats'; end if;
  if normalized_email=lower(coalesce(auth.jwt()->>'email','')) then raise exception 'The owner already belongs to this membership'; end if;

  update public.subscription_invites i set revoked_at=now()
  where i.household_id=access_record.household_id and i.invited_email=normalized_email
    and i.accepted_at is null and i.revoked_at is null;

  raw_code:='TUL-'||upper(encode(extensions.gen_random_bytes(9),'hex'));
  insert into public.subscription_invites(household_id,invited_email,token_hash,invited_by,expires_at)
  values(access_record.household_id,normalized_email,encode(extensions.digest(raw_code,'sha256'),'hex'),account_id,result_expiry);

  return query select raw_code,normalized_email,result_expiry;
end
$$;

create or replace function public.subscription_accept_invite(p_code text)
returns table(
  household_id uuid,
  household_role text,
  access_state text,
  plan_code text,
  plan_name text,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  grace_ends_at timestamptz,
  seat_limit integer,
  seats_used integer,
  can_use_app boolean,
  can_invite boolean,
  can_download boolean
)
language plpgsql
security definer
set search_path=public,auth,extensions
as $$
declare
  account_id uuid:=auth.uid();
  account_email text:=lower(coalesce(auth.jwt()->>'email',''));
  normalized_code text:=upper(trim(coalesce(p_code,'')));
  chosen public.subscription_invites;
begin
  if account_id is null then raise exception 'Authentication required'; end if;
  if account_email='' then raise exception 'A verified account email is required'; end if;
  if normalized_code !~ '^TUL-[A-F0-9]{18}$' then raise exception 'Invalid or expired invitation'; end if;
  if exists(select 1 from public.subscription_members m where m.user_id=account_id) then raise exception 'This account already belongs to a membership'; end if;

  select i.* into chosen
  from public.subscription_invites i
  where i.token_hash=encode(extensions.digest(normalized_code,'sha256'),'hex')
    and i.accepted_at is null and i.revoked_at is null and i.expires_at>now()
  for update;
  if chosen.id is null then raise exception 'Invalid or expired invitation'; end if;
  if chosen.invited_email<>account_email then raise exception 'Sign in with the email address that received this invitation'; end if;

  if not exists(
    select 1 from public.subscription_records r
    where r.household_id=chosen.household_id
      and r.status in ('trialing','active','cancelled')
      and coalesce(r.current_period_end,'infinity'::timestamptz)>now()
  ) then raise exception 'The owner does not currently have an active paid membership'; end if;

  insert into public.subscription_members(household_id,user_id,role,invited_by)
  values(chosen.household_id,account_id,'member',chosen.invited_by);
  update public.subscription_invites i set accepted_by=account_id,accepted_at=now() where i.id=chosen.id;

  return query select * from public.subscription_access();
end
$$;

create or replace function public.subscription_list_members()
returns table(user_id uuid,member_role text,display_name text,email text,joined_at timestamptz)
language plpgsql
stable
security definer
set search_path=public,auth
as $$
declare
  account_id uuid:=auth.uid();
  owned_household uuid;
begin
  if account_id is null then raise exception 'Authentication required'; end if;
  select h.id into owned_household from public.subscription_households h where h.owner_user_id=account_id;
  if owned_household is null then raise exception 'Only the membership owner can list members'; end if;

  return query
  select m.user_id,m.role,
    left(coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'),''),split_part(coalesce(u.email,''),'@',1),'Member'),120),
    u.email,m.joined_at
  from public.subscription_members m
  join auth.users u on u.id=m.user_id
  where m.household_id=owned_household
  order by case when m.role='owner' then 0 else 1 end,m.joined_at;
end
$$;

create or replace function public.subscription_list_invites()
returns table(invite_id uuid,invited_email text,expires_at timestamptz,accepted_at timestamptz,revoked_at timestamptz,created_at timestamptz)
language plpgsql
stable
security definer
set search_path=public,auth
as $$
declare
  account_id uuid:=auth.uid();
  owned_household uuid;
begin
  if account_id is null then raise exception 'Authentication required'; end if;
  select h.id into owned_household from public.subscription_households h where h.owner_user_id=account_id;
  if owned_household is null then raise exception 'Only the membership owner can list invitations'; end if;
  return query select i.id,i.invited_email,i.expires_at,i.accepted_at,i.revoked_at,i.created_at
  from public.subscription_invites i where i.household_id=owned_household order by i.created_at desc;
end
$$;

create or replace function public.subscription_revoke_invite(p_invite_id uuid)
returns boolean
language plpgsql
security definer
set search_path=public,auth
as $$
begin
  update public.subscription_invites i set revoked_at=now()
  where i.id=p_invite_id and i.accepted_at is null and i.revoked_at is null
    and exists(select 1 from public.subscription_households h where h.id=i.household_id and h.owner_user_id=auth.uid());
  if not found then raise exception 'Active invitation not found or permission denied'; end if;
  return true;
end
$$;

create or replace function public.subscription_remove_member(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path=public,auth
as $$
declare
  owned_household uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_user_id=auth.uid() then raise exception 'The owner cannot remove their own account'; end if;
  select h.id into owned_household from public.subscription_households h where h.owner_user_id=auth.uid();
  if owned_household is null then raise exception 'Only the membership owner can remove members'; end if;
  delete from public.subscription_members m where m.household_id=owned_household and m.user_id=p_user_id and m.role='member';
  if not found then raise exception 'Member not found'; end if;
  return true;
end
$$;

create or replace function public.subscription_leave_household()
returns boolean
language plpgsql
security definer
set search_path=public,auth
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  delete from public.subscription_members m where m.user_id=auth.uid() and m.role='member';
  if not found then raise exception 'Only an invited member can leave a membership'; end if;
  return true;
end
$$;

create or replace function public.subscription_has_entitlement(p_entitlement_code text)
returns boolean
language sql
stable
security definer
set search_path=public,auth
as $$
  select exists(
    select 1
    from public.subscription_members m
    join public.subscription_entitlements e on e.household_id=m.household_id
    where m.user_id=auth.uid() and e.entitlement_code=p_entitlement_code
      and e.revoked_at is null and (e.expires_at is null or e.expires_at>now())
  )
$$;

-- Called only by a signature-verifying Edge Function with the service-role key.
-- It is idempotent by provider_event_id and ignores out-of-order state updates.
create or replace function public.subscription_apply_provider_event(
  p_provider text,
  p_provider_event_id text,
  p_event_type text,
  p_owner_user_id uuid,
  p_plan_code text,
  p_provider_customer_id text,
  p_provider_subscription_id text,
  p_status text,
  p_current_period_start timestamptz,
  p_current_period_end timestamptz,
  p_grace_ends_at timestamptz,
  p_cancel_at_period_end boolean,
  p_occurred_at timestamptz,
  p_payload_sha256 text,
  p_payment_succeeded boolean default false
)
returns boolean
language plpgsql
security definer
set search_path=public,auth
as $$
declare
  target_household uuid;
  existing_role text;
  bound_household uuid;
  target_subscription uuid;
  configured_grace_days integer;
begin
  if p_provider is null or p_provider not in ('lemon_squeezy','stripe','paddle','manual') then raise exception 'Unsupported billing provider'; end if;
  if p_status is null or p_status not in ('trialing','active','past_due','paused','cancelled','expired','refunded','disputed') then raise exception 'Unsupported subscription status'; end if;
  if p_occurred_at is null then raise exception 'Provider event time is required'; end if;
  if nullif(trim(p_provider_event_id),'') is null or nullif(trim(p_provider_subscription_id),'') is null then raise exception 'Provider event and subscription IDs are required'; end if;
  if p_payload_sha256 is not null and p_payload_sha256 !~ '^[a-f0-9]{64}$' then raise exception 'Invalid payload hash'; end if;
  if not exists(select 1 from auth.users u where u.id=p_owner_user_id) then raise exception 'Subscription owner account not found'; end if;
  if not exists(
    select 1 from public.subscription_plans p
    where p.code=p_plan_code and p.is_active and p.provider=p_provider and p.provider_variant_id is not null
  ) then raise exception 'Active provider plan mapping not found'; end if;

  perform pg_advisory_xact_lock(hashtextextended(p_provider||':'||p_provider_subscription_id,0));
  if exists(select 1 from public.subscription_provider_events e where e.provider=p_provider and e.provider_event_id=p_provider_event_id) then return false; end if;

  select m.household_id,m.role into target_household,existing_role
  from public.subscription_members m where m.user_id=p_owner_user_id;
  if target_household is not null and existing_role<>'owner' then raise exception 'A family member must leave their current membership before purchasing another'; end if;

  if target_household is null then
    insert into public.subscription_households(owner_user_id,display_name)
    values(p_owner_user_id,'My family') returning id into target_household;
    insert into public.subscription_members(household_id,user_id,role)
    values(target_household,p_owner_user_id,'owner');
  end if;

  select r.household_id into bound_household
  from public.subscription_records r
  where r.provider=p_provider and r.provider_subscription_id=trim(p_provider_subscription_id);
  if bound_household is not null and bound_household<>target_household then
    raise exception 'Provider subscription is already bound to another household';
  end if;

  select s.payment_grace_days into configured_grace_days from public.subscription_settings s where s.singleton=true;
  insert into public.subscription_records(
    household_id,plan_code,provider,provider_customer_id,provider_subscription_id,status,
    current_period_start,current_period_end,grace_ends_at,cancel_at_period_end,
    started_at,ended_at,last_event_at
  ) values(
    target_household,p_plan_code,p_provider,nullif(trim(p_provider_customer_id),''),trim(p_provider_subscription_id),p_status,
    p_current_period_start,p_current_period_end,
    case when p_status='past_due' then coalesce(p_grace_ends_at,p_occurred_at+make_interval(days=>coalesce(configured_grace_days,7))) else p_grace_ends_at end,
    coalesce(p_cancel_at_period_end,false),coalesce(p_current_period_start,p_occurred_at),
    case when p_status in ('expired','refunded','disputed') then p_occurred_at else null end,p_occurred_at
  )
  on conflict(provider,provider_subscription_id) do update set
    household_id=excluded.household_id,
    plan_code=excluded.plan_code,
    provider_customer_id=coalesce(excluded.provider_customer_id,subscription_records.provider_customer_id),
    status=excluded.status,
    current_period_start=excluded.current_period_start,
    current_period_end=excluded.current_period_end,
    grace_ends_at=excluded.grace_ends_at,
    cancel_at_period_end=excluded.cancel_at_period_end,
    ended_at=excluded.ended_at,
    last_event_at=excluded.last_event_at
  where excluded.last_event_at>=subscription_records.last_event_at
  returning id into target_subscription;

  if target_subscription is null then
    select r.id into target_subscription from public.subscription_records r
    where r.provider=p_provider and r.provider_subscription_id=p_provider_subscription_id;
  end if;

  insert into public.subscription_provider_events(
    provider,provider_event_id,event_type,household_id,subscription_id,payload_sha256,occurred_at,processed_at
  ) values(
    p_provider,trim(p_provider_event_id),left(trim(p_event_type),160),target_household,target_subscription,p_payload_sha256,p_occurred_at,now()
  );

  if p_payment_succeeded and exists(
    select 1 from public.subscription_plans p where p.code=p_plan_code and p.lifetime_downloads
  ) then
    insert into public.subscription_entitlements(household_id,entitlement_code,source_type,source_ref)
    values(target_household,'download_package','provider_payment',p_provider||':'||p_provider_event_id)
    on conflict do nothing;
  end if;
  return true;
end
$$;

revoke all on table
  public.subscription_settings,
  public.subscription_plans,
  public.subscription_households,
  public.subscription_members,
  public.subscription_trial_claims,
  public.subscription_invites,
  public.subscription_records,
  public.subscription_entitlements,
  public.subscription_provider_events,
  public.subscription_redemption_codes
from public,anon,authenticated;

grant select on public.subscription_plans to anon,authenticated;
grant all on table
  public.subscription_settings,
  public.subscription_plans,
  public.subscription_households,
  public.subscription_members,
  public.subscription_trial_claims,
  public.subscription_invites,
  public.subscription_records,
  public.subscription_entitlements,
  public.subscription_provider_events,
  public.subscription_redemption_codes
to service_role;

revoke all on function public.subscription_touch_updated_at() from public,anon,authenticated;
revoke all on function public.subscription_household_for_user(uuid) from public,anon,authenticated;
revoke all on function public.subscription_seat_limit_for_household(uuid) from public,anon,authenticated;
revoke all on function public.subscription_enforce_member() from public,anon,authenticated;
revoke all on function public.subscription_access() from public,anon;
revoke all on function public.subscription_start_trial(text) from public,anon;
revoke all on function public.subscription_create_invite(text) from public,anon;
revoke all on function public.subscription_accept_invite(text) from public,anon;
revoke all on function public.subscription_list_members() from public,anon;
revoke all on function public.subscription_list_invites() from public,anon;
revoke all on function public.subscription_revoke_invite(uuid) from public,anon;
revoke all on function public.subscription_remove_member(uuid) from public,anon;
revoke all on function public.subscription_leave_household() from public,anon;
revoke all on function public.subscription_has_entitlement(text) from public,anon;
revoke all on function public.subscription_apply_provider_event(text,text,text,uuid,text,text,text,text,timestamptz,timestamptz,timestamptz,boolean,timestamptz,text,boolean) from public,anon,authenticated;

grant execute on function public.subscription_access(),public.subscription_start_trial(text),
  public.subscription_create_invite(text),public.subscription_accept_invite(text),
  public.subscription_list_members(),public.subscription_list_invites(),
  public.subscription_revoke_invite(uuid),public.subscription_remove_member(uuid),
  public.subscription_leave_household(),public.subscription_has_entitlement(text)
to authenticated;
grant execute on function public.subscription_apply_provider_event(text,text,text,uuid,text,text,text,text,timestamptz,timestamptz,timestamptz,boolean,timestamptz,text,boolean)
to service_role;

comment on table public.subscription_households is 'Paid-access household. Separate from Parent/Learner Family sharing.';
comment on table public.subscription_members is 'One billing owner plus invited paid-plan members; never grants tracker-data visibility.';
comment on table public.subscription_redemption_codes is 'Reserved and disabled until a marketplace channel is approved.';
comment on function public.subscription_apply_provider_event(text,text,text,uuid,text,text,text,text,timestamptz,timestamptz,timestamptz,boolean,timestamptz,text,boolean)
  is 'Service-role-only idempotent webhook state transition after signature verification.';

commit;
