# Nestlyra migration & architecture notes — 23 Aug 2026

Use this as the handoff/context note when the work environment is available again.

## Brand decisions

- Umbrella brand locked: **Nestlyra**.
- Planned product names:
  - **Nestlyra Focus** — Study, Career & Productivity.
  - **Nestlyra Together** — Couple, Family & Shared Life.
- Long-term product structure remains **two customer-facing apps on one shared technical platform**.

## Long-term architecture decision

### Nestlyra Focus
- Personal-first/offline-first.
- Personal tracker data: IndexedDB/local browser storage + optional Google Drive sync.
- Supabase is for shared platform services only: auth, profiles, groups, memberships, invites, progress projections, text chat, notifications and small activity metadata.
- Supabase Storage is NOT part of V1 for personal/group files.

### Nestlyra Together
- Shared-first Couple/Family app.
- Primary shared structured data will use Supabase, not Notion as the production backend.
- Shared V1 records: tasks, goals, plans, expenses, check-ins, preferences, short notes and similar text/number/date data.
- No heavy file/photo/video uploads in Supabase V1.
- Co-edit design: Presence for UX, atomic version-checked saves, conflict preservation/copies, activity log; no Google-Docs-style character collaboration and no CRDT/OT in V1.
- Shared editing requires internet in V1; offline can show cached/read-only data.

### Etsy bundle role
- Primary Web App.
- Offline HTML Lite edition.
- Windows EXE skipped in V1.
- Category-specific Notion template as an independent companion edition, NOT app backend and NOT automatically synchronized.
- Google Sheets Lite companion where useful.
- Screenshot-based user guide.
- Listing/preset determines default enabled modules for Study, Job, Certification, Couple, Daily, etc.

## Hosting migration completed today

### Source of truth
- GitHub repo remains: `pawansiddh/pawansiddh.github.io`.
- `main` currently remains the production source branch.
- Existing GitHub Pages deployment was intentionally kept working during migration.

### Accidental/temporary Worker deployment
- First Cloudflare flow created a Worker/static-assets deployment:
  - `https://nestlyra.pawankumarsiddh1233.workers.dev`
- This is NOT the preferred public brand URL.
- Do not delete immediately until the Pages deployment is fully proven/stable.

### Correct Cloudflare Pages deployment
- Cloudflare Pages project name: **nestlyra**.
- GitHub repo connected: `pawansiddh/pawansiddh.github.io`.
- Production branch: `main`.
- Framework preset: None/static.
- Build command: `exit 0`.
- Build output directory: `.`.
- Root directory: default/root.
- Environment variables were not added during migration.
- Preferred free public URL is now:
  - **https://nestlyra.pages.dev**
- App UI loads correctly there and existing dashboard data was confirmed visible after login.

## Deployment safety change

- An `.assetsignore` file was added to the GitHub repository after the first Worker deployment uploaded repository metadata such as `.git`/`.wrangler` assets.
- Purpose: prevent Git metadata/Wrangler temporary files from being exposed as static assets on future Worker-style deployments.

## Authentication migration completed

Problem observed:
- Opening `nestlyra.pages.dev` worked, but Google/Supabase login redirected back to `https://pawansiddh.github.io/#...`.

Fix made in Supabase:
- Authentication → URL Configuration → **Site URL** changed to:
  - `https://nestlyra.pages.dev`
- Added Redirect URL:
  - `https://nestlyra.pages.dev/**`
- Old GitHub redirect was intentionally kept temporarily during migration/testing.

Result:
- Google login now returns to **nestlyra.pages.dev** instead of the old GitHub Pages domain.
- Existing application data appears normally after login.

## Current working state

- GitHub source still works.
- Cloudflare Pages deployment works.
- Supabase/Google-login flow through Supabase now lands on Nestlyra Pages.
- Existing user dashboard data loads on the new domain.
- Do NOT disable/delete the old GitHub Pages deployment yet.
- Do NOT delete the temporary Worker deployment yet until all application flows are tested.

## Next work-session priorities

1. Full regression test on `nestlyra.pages.dev`:
   - email login/signup
   - Google login
   - logout/password reset
   - local storage / offline behavior
   - Supabase cloud sync
   - parent/learner linking
   - invite-code lifecycle
   - family messaging + realtime
   - job tracker
   - subjects/modules/topics
   - notes/tasks/calendar
   - PWA/service worker
   - mobile responsive behavior
2. Update visible branding from old Study Tracker/PODGiftCreations references to **Nestlyra** where appropriate.
3. Decide exact repo/monorepo migration path for `apps/focus`, `apps/together`, shared packages and adapters without breaking the current production app.
4. Move development toward feature branches/PRs so `main` stays stable once real Etsy users arrive.
5. Keep `nestlyra.pages.dev` for beta/free launch; later attach `nestlyra.com` to the same Cloudflare project when revenue/users justify buying the domain.
6. After the Pages version is fully stable, stop promoting the GitHub Pages URL and later remove the temporary Worker deployment.

## Important rule for future changes

Do not turn the companion formats into multi-master sync targets. The Web App, Notion template, Sheets edition and HTML Lite are alternative/companion environments. Only explicitly supported sync paths should exist (e.g. Focus personal data ↔ Drive; Together shared data ↔ Supabase).
