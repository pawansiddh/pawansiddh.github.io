# TULSHII subscription system

This is the durable handoff for the TULSHII paid-access foundation. Read this file before changing billing, trials, family seats, downloads or marketplace codes.

## Current deployment

- Supabase organization: `Pawan Study Tracker`
- Supabase project: `study-tracker-production`
- Project reference: `lxwsshefxbjuqzdewfff`
- Region: Mumbai (`ap-south-1`)
- Current application origin: `https://pawansiddh.github.io`
- Future origin: `https://tulshii.com` (not yet purchased)
- Payment provider decision: Lemon Squeezy, not connected yet
- Migration: `supabase-subscriptions-v1.sql`
- Verification: `supabase-subscriptions-verify.sql`
- Rollback-only behavior test: `supabase-subscriptions-smoke-test.sql`

Never commit a Supabase service-role key, database password, Lemon Squeezy API key or webhook secret. The publishable Supabase browser key in `config.js` is intentionally public; RLS and server-only functions are the security boundary.

## Approved business rules

| Rule | Value |
|---|---|
| Trial | Seven days |
| Trial seats | One account; invitations disabled |
| Paid household | One owner/admin plus four invited members |
| Failed payment grace | Seven days of app access; invitations disabled |
| Cancellation | Access continues through the paid period |
| Paid downloads | Permanent household entitlement after a successful payment |
| Parent/Learner privacy | Completely separate from billing household membership |
| Marketplace codes | Reserved but disabled pending marketplace approval |

The annual and three-year plans are seeded as drafts. Their price, currency, provider and provider variant ID are deliberately null, and `is_active` is false. Do not expose a plan until all four commercial fields are populated and checked.

## Data model

| Object | Purpose |
|---|---|
| `subscription_settings` | One row containing trial, grace, seat and redemption defaults |
| `subscription_plans` | Provider-neutral product catalogue |
| `subscription_households` | The purchaser-owned billing household |
| `subscription_members` | Exactly one billing household per user; roles are owner or member |
| `subscription_trial_claims` | Prevents repeated trials for the same Supabase user ID |
| `subscription_invites` | Seven-day, email-bound, SHA-256-hashed invitation codes |
| `subscription_records` | Provider subscription lifecycle and paid-period state |
| `subscription_entitlements` | Permanent or expiring grants such as `download_package` |
| `subscription_provider_events` | Idempotency and audit metadata for verified webhooks; raw payloads are not stored |
| `subscription_redemption_codes` | Disabled foundation for a later approved marketplace flow |

These tables do not reference `family_links`, `family_profiles`, `groups` or tracker data. A billing member gains application access only. They do not gain permission to another person's notes, progress, messages or documents.

## Access state

`subscription_access()` returns one authoritative row for the signed-in user:

- `none`: no trial or household
- `trialing`: trial is still valid; one seat; no invitations
- `active`: paid period is valid; household invitations allowed while seats remain
- `grace`: renewal failed but the seven-day grace period is valid; no new invitations
- `expired`: app access is blocked; a permanent download entitlement may still remain

The UI must use `can_use_app`, `can_invite` and `can_download`; it must not recreate this state logic in JavaScript.

## Authenticated RPCs

- `subscription_start_trial(text)` creates the user's one trial and owner household.
- `subscription_access()` returns server-calculated access and entitlements.
- `subscription_create_invite(text)` returns a one-time code for a specific email; paid owner only.
- `subscription_accept_invite(text)` validates the signed-in email and consumes the code.
- `subscription_list_members()` and `subscription_list_invites()` are owner-only.
- `subscription_revoke_invite(uuid)` revokes an unused invitation.
- `subscription_remove_member(uuid)` removes a non-owner seat.
- `subscription_leave_household()` lets an invited member leave.
- `subscription_has_entitlement(text)` checks a named household grant.

All private tables have RLS enabled and no direct `anon` or `authenticated` table access. User operations go through the narrow security-definer RPCs above.

Supabase Security Advisor may report the authenticated RPCs as general `SECURITY DEFINER` warnings. They are intentionally callable by signed-in users, validate `auth.uid()` and ownership internally, and expose no direct table grants. The verification script asserts the exact allowlist. The provider-event RPC and internal helpers must never be executable by `anon` or `authenticated`.

## Provider webhook boundary

`subscription_apply_provider_event(...)` is executable only by `service_role`. A future Supabase Edge Function must:

1. Read the Lemon Squeezy webhook request as raw bytes.
2. Verify the signature using an Edge Function secret.
3. Reject missing or invalid signatures before parsing business fields.
4. Hash the payload with SHA-256.
5. Resolve the Supabase owner ID from signed checkout custom data.
6. Map the Lemon Squeezy variant ID to a configured active plan.
7. Call `subscription_apply_provider_event(...)`.
8. Return success for already processed event IDs.

Never call this RPC from the browser and never put the service-role key in `config.js` or GitHub Pages.

A successful payment sets `p_payment_succeeded=true`, which grants the household a non-expiring `download_package` entitlement. Cancellation or expiry does not remove that grant. Fraud, dispute and refund behavior must be finalized before live payments; v1 does not automatically revoke permanent downloads.

## Direct website checkout

Until `tulshii.com` exists, use `https://pawansiddh.github.io` as the allowed application origin and checkout return URL. At domain launch:

1. Add `https://tulshii.com` and exact callback paths to Supabase Auth URL configuration.
2. Update Lemon Squeezy checkout redirects and webhook environment values.
3. Keep the GitHub Pages origin during a short migration window.
4. Remove the old origin only after login, payment return and email-link tests pass.

No database migration is required for the domain change.

## Marketplace status

`subscription_redemption_codes` exists for future work, but `subscription_settings.redemption_enabled` is false and no authenticated issue/redeem function is installed. Do not enable it until the marketplace confirms that the product and delivery method comply with its current rules.

## Safe change procedure for future ChatGPT sessions

1. Read this file, `config.js`, and the newest `supabase-subscriptions-*.sql` files.
2. Run `git status --short` and preserve unrelated user changes.
3. Make every database change in a new idempotent migration; never edit production only through the dashboard.
4. Do not drop or repurpose existing Family, Groups, messages or tracker tables.
5. Run `node test-subscriptions-foundation.mjs` plus the existing project tests.
6. Apply the migration in the Supabase SQL Editor.
7. Run `supabase-subscriptions-verify.sql` and inspect Security Advisor.
8. Run `supabase-subscriptions-smoke-test.sql`; it must report success and roll back all writes.
9. Commit the migration, verification, code and documentation together.

## Remaining launch work

- Finalize annual and three-year prices and currency.
- Activate the two plans and add Lemon Squeezy variant IDs.
- Implement the signature-verifying Edge Function and configure secrets.
- Add checkout, subscription status, family member and download UI.
- Store downloadable files in a private Supabase Storage bucket and serve them through an entitlement-checking function.
- Update account deletion so a live provider subscription is cancelled before deleting its owner.
- Decide refund and chargeback rules for permanent downloads.
- Perform end-to-end tests in provider test mode before adding live keys.
