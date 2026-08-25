import fs from 'node:fs';
import assert from 'node:assert/strict';

const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8');
const groups=fs.readFileSync(new URL('./groups.js',import.meta.url),'utf8');
const schema=fs.readFileSync(new URL('./supabase-groups-migration.sql',import.meta.url),'utf8');
const worker=fs.readFileSync(new URL('./sw.js',import.meta.url),'utf8');

assert.doesNotMatch(html,/data-auth-mode=/,'Separate Parent/Learner login tabs must be removed');
assert.doesNotMatch(html,/id="parentLoginForm"/,'Legacy Parent login form must not remain reachable');
assert.match(html,/One Nestlyra account/);
assert.match(html,/src="groups\.js"/);
assert.match(app,/await familyResolveAuthenticatedRole\(cloudUser\);\s*await loadCloud\(\)/);
assert.doesNotMatch(app,/role!==['"]learner|role===['"]parent/,'Login must not enforce a permanent Parent/Learner role');

for(const role of ['owner','admin','contributor','member','observer'])assert.match(groups,new RegExp(`\\b${role}\\b`));
for(const kind of ['study','exam','certification','accountability','family'])assert.match(groups,new RegExp(`\\b${kind}\\b`));
assert.match(groups,/group_generate_invite/);
assert.match(groups,/group_redeem_invite/);
assert.match(groups,/group_transfer_ownership/);
assert.match(groups,/group_publish_snapshot/);
assert.match(groups,/group_save_shared_record/);
assert.match(groups,/group_messages/);
assert.doesNotMatch(groups,/from\(['"]user_tracker_data['"]\)/,'Groups must not read complete private tracker records');

for(const table of ['group_profiles','groups','group_members','group_invites','group_progress_snapshots','group_shared_records','group_messages','group_message_reads'])assert.match(schema,new RegExp(`create table if not exists public\\.${table}`));
for(const table of ['group_profiles','groups','group_members','group_invites','group_progress_snapshots','group_shared_records','group_messages','group_message_reads'])assert.match(schema,new RegExp(`alter table public\\.${table} enable row level security`));
assert.match(schema,/delete from public\.group_invites where group_id=p_group_id/,'A new invitation must revoke the old group invitation');
assert.match(schema,/interval '15 minutes'/);
assert.match(schema,/interval '30 days'/);
assert.match(schema,/legacy_family_learner_id/,'Legacy Family links must migrate instead of being discarded');
assert.match(schema,/then group_profiles\.display_name/,'Blank internal profile setup must preserve an existing display name');
assert.match(schema,/drop policy if exists "linked parents read learner tracker"/,'Legacy full-tracker observer access must be removed');
assert.match(schema,/Transfer ownership or delete the group before leaving/);
assert.match(schema,/Version conflict: reload the record before saving/);
assert.match(schema,/if database_bytes>=393216000/,'75% free-tier pressure cleanup must remain server enforced');
assert.match(worker,/nestlyra-focus-v33-groups/);
assert.match(worker,/\.\/groups\.js/);
assert.match(worker,/\.\/supabase-groups-migration\.sql/);

const dollarTags=(schema.match(/\$\$/g)||[]).length;
assert.equal(dollarTags%2,0,'SQL dollar-quoted blocks must be balanced');
const parentheses=[...schema].reduce((depth,char)=>depth+(char==='('?1:char===')'?-1:0),0);
assert.equal(parentheses,0,'SQL parentheses must be balanced');

console.log('Groups architecture regression passed: neutral login, roles, invitations, RLS, privacy, migration, messaging and lifecycle.');
