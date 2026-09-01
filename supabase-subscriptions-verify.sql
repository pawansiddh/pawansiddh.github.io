-- Read-only verification for supabase-subscriptions-v1.sql.
-- A successful run returns three result sets and raises no exception.

do $$
declare
  expected_tables text[]:=array[
    'subscription_settings','subscription_plans','subscription_households',
    'subscription_members','subscription_trial_claims','subscription_invites',
    'subscription_records','subscription_entitlements',
    'subscription_provider_events','subscription_redemption_codes'
  ];
  missing text;
  insecure text;
  unexpected_function text;
begin
  select string_agg(name,', ' order by name) into missing
  from unnest(expected_tables) name
  where to_regclass('public.'||name) is null;
  if missing is not null then raise exception 'Missing subscription tables: %',missing; end if;

  select string_agg(c.relname,', ' order by c.relname) into insecure
  from pg_class c
  join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relname=any(expected_tables) and not c.relrowsecurity;
  if insecure is not null then raise exception 'RLS is not enabled on: %',insecure; end if;

  if has_table_privilege('anon','public.subscription_households','select')
    or has_table_privilege('authenticated','public.subscription_records','select')
    or has_table_privilege('authenticated','public.subscription_provider_events','select') then
    raise exception 'A private billing table has an unexpected direct read grant';
  end if;

  if to_regprocedure('public.subscription_access()') is null
    or to_regprocedure('public.subscription_start_trial(text)') is null
    or to_regprocedure('public.subscription_apply_provider_event(text,text,text,uuid,text,text,text,text,timestamp with time zone,timestamp with time zone,timestamp with time zone,boolean,timestamp with time zone,text,boolean)') is null then
    raise exception 'A required subscription function is missing';
  end if;

  select string_agg(p.proname,', ' order by p.proname) into unexpected_function
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname like 'subscription_%'
    and has_function_privilege('anon',p.oid,'execute');
  if unexpected_function is not null then
    raise exception 'Anonymous users can unexpectedly execute: %',unexpected_function;
  end if;

  select string_agg(p.proname,', ' order by p.proname) into unexpected_function
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname like 'subscription_%'
    and has_function_privilege('authenticated',p.oid,'execute')
    and p.proname not in (
      'subscription_access','subscription_start_trial','subscription_create_invite',
      'subscription_accept_invite','subscription_list_members','subscription_list_invites',
      'subscription_revoke_invite','subscription_remove_member',
      'subscription_leave_household','subscription_has_entitlement'
    );
  if unexpected_function is not null then
    raise exception 'Signed-in users can unexpectedly execute: %',unexpected_function;
  end if;

  if has_function_privilege(
    'authenticated',
    'public.subscription_apply_provider_event(text,text,text,uuid,text,text,text,text,timestamp with time zone,timestamp with time zone,timestamp with time zone,boolean,timestamp with time zone,text,boolean)',
    'execute'
  ) or not has_function_privilege(
    'service_role',
    'public.subscription_apply_provider_event(text,text,text,uuid,text,text,text,text,timestamp with time zone,timestamp with time zone,timestamp with time zone,boolean,timestamp with time zone,text,boolean)',
    'execute'
  ) then raise exception 'Provider event RPC privileges are incorrect'; end if;

  if not exists(select 1 from public.subscription_settings where singleton=true and trial_days=7 and trial_seat_limit=1 and payment_grace_days=7 and family_seat_limit=5 and redemption_enabled=false) then
    raise exception 'Subscription defaults do not match the approved launch rules';
  end if;
  if (select count(*) from public.subscription_plans where code in ('family_annual','family_3_year') and seat_limit=5 and lifetime_downloads)=2 is not true then
    raise exception 'Draft family plans are missing or invalid';
  end if;
end
$$;

select code,display_name,interval_unit,interval_count,price_minor,currency,seat_limit,lifetime_downloads,is_active
from public.subscription_plans
where code in ('family_annual','family_3_year')
order by interval_count;

select tablename,rowsecurity
from pg_tables
where schemaname='public' and tablename like 'subscription_%'
order by tablename;

select routine_name,security_type
from information_schema.routines
where routine_schema='public' and routine_name like 'subscription_%'
order by routine_name;
