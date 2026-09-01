import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const migration=readFileSync(new URL('./supabase-subscriptions-v1.sql',import.meta.url),'utf8');
const verification=readFileSync(new URL('./supabase-subscriptions-verify.sql',import.meta.url),'utf8');
const smoke=readFileSync(new URL('./supabase-subscriptions-smoke-test.sql',import.meta.url),'utf8');
const runbook=readFileSync(new URL('./docs/SUBSCRIPTION_SYSTEM.md',import.meta.url),'utf8');

const tables=[
  'subscription_settings','subscription_plans','subscription_households','subscription_members',
  'subscription_trial_claims','subscription_invites','subscription_records',
  'subscription_entitlements','subscription_provider_events','subscription_redemption_codes'
];
for(const table of tables){
  assert.match(migration,new RegExp(`create table if not exists public\\.${table}\\b`));
  assert.match(migration,new RegExp(`alter table public\\.${table} enable row level security`));
  assert.match(verification,new RegExp(`'${table}'`));
}

for(const fn of ['subscription_access','subscription_start_trial','subscription_create_invite',
  'subscription_accept_invite','subscription_list_members','subscription_remove_member',
  'subscription_has_entitlement','subscription_apply_provider_event']){
  assert.match(migration,new RegExp(`function public\\.${fn}\\(`));
  assert.match(runbook,new RegExp(`\\b${fn}\\b`));
}

assert.doesNotMatch(migration,/\bdrop\s+(table|schema)\b/i,'Migration must never drop a table or schema');
assert.doesNotMatch(migration,/\btruncate\b/i,'Migration must never truncate data');
assert.doesNotMatch(migration,/delete\s+from\s+public\.(family_|group_|user_tracker_data)/i,'Migration must not delete existing app data');
assert.doesNotMatch(migration,/service_role[^\n]*(eyJ|sb_secret_)/i,'Service secrets must not be committed');
assert.match(migration,/redemption_enabled boolean not null default false/);
assert.match(migration,/trial_days smallint not null default 7/);
assert.match(migration,/trial_seat_limit smallint not null default 1/);
assert.match(migration,/family_seat_limit smallint not null default 5/);
assert.match(migration,/payment_grace_days smallint not null default 7/);
assert.match(migration,/grant execute on function public\.subscription_apply_provider_event[\s\S]+to service_role;/);
assert.doesNotMatch(migration,/grant execute on function public\.subscription_apply_provider_event[\s\S]{0,300}to authenticated;/);
assert.match(smoke,/^begin;/m);
assert.match(smoke,/^rollback;/m);
assert.match(smoke,/subscription_start_trial/);
assert.match(smoke,/subscription_apply_provider_event/);
assert.match(smoke,/subscription_create_invite/);
assert.doesNotMatch(smoke,/^commit;/m,'Smoke test must never commit its temporary writes');

console.log('Subscription foundation static checks passed.');
