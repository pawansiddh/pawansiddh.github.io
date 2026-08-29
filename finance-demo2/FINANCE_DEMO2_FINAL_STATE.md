# PAVENRO Finance Demo 2 — Consolidated Final State Contract

This file is the Demo 2 acceptance contract. When an older Demo 2 experiment conflicts with a later follow-up, the later follow-up wins. The runtime should load only the effective final state, not replay superseded experiments.

## Protected boundary
- `/finance-demo/` remains protected and unchanged unless explicitly promoted.
- All experimental/consolidation work remains under `/finance-demo2/`.

## Stable base inherited when Demo 2 was created
Demo 2 was copied from the restored stable Finance build at commit `80315fb2cac4ceec1f5ab93ed8fd2ff3c4169c4c` and created at `791f58f111a475b45dd8940bc730104a26b9f109`.

Effective inherited presentation/features:
- Finance feature patch v4.
- Finance v5 patch.
- `finance-baseline-v3.js` presentation baseline.
- Search/sidebar hard-r3c behavior and category/icon corrections.
- Duplicate sidebar rail icon removal.
- Debt Control Center with payoff simulator, calculators and Snowball vs Avalanche.
- Theme Studio with final theme/font/density preferences.
- Notification bell contrast correction.

`patch6` is not part of the effective live state: its repository payload is malformed. The historical loader attempted it, failed, then continued through the baseline fallback. Consolidated Demo 2 therefore skips it deliberately instead of wasting time reproducing a failure.

## Latest-decision chains

| Feature chain | Superseded / rejected | Effective final state |
| --- | --- | --- |
| Demo 2 boot mask | Real loading DOM that changed measurements | CSS-only hidden boot mask from the layout-safe startup (`62a8b0f...`) |
| Phase 1 Accounts/Transactions/Bills/Budget | R1 then R2; R2 MutationObserver caused repeated status columns/loop | Phase 1 R3 (`f9bd69b...`) |
| Phase 1 remaining core | Earlier placeholder forms | `finance-phase1-core2-r1.js` for Income, Goals, Documents, transfers, Budget edit |
| Phase 1 planning | Old optional placeholders | `finance-phase1-planning-r1.js` for Calendar support, Subscriptions, Net Worth, Investments |
| Phase 1 records | Old optional placeholders | `finance-phase1-records-r1.js` for Reports, Notes, Tax Records, Paydays |
| Bill/transaction status | Brief visual dropdown update that reverted | `finance-phase1-status-fix-r1.js` persistent reversible status |
| Dead visible buttons | Buttons falling through to demo/no-op behavior | `finance-interaction-audit-r1.js` interaction coverage |
| Controller state access | Patch-local/window-only state assumptions | `finance-state-bridge-r1.js` exposes one live Finance state/save/render bridge |
| Daily Briefing | R1 / invisible first implementation | Daily Briefing R2 with popup, 5 voice slots, speech speed, preview/show-now controls |
| Calendar | Basic event list | Calendar Studio R1 + Phase 2 Year view; Month/Week/Day/Year, finance categories, edit/delete/add-on-date |
| Co-edit history | No durable attribution | Co-edit Audit R1 for editor/time/change context, local-first audit, Drive-first design |
| Offline behavior | Accidental browser persistence only | Offline Sync R1 + service worker + IndexedDB outbox; Drive-first sync adapter when connected |
| Phase 2 UX | Forms remaining open, simple document upload, missing status/category/year behaviors | `finance-phase2-r1.js` |
| Branding | Plain `PAVENRO | FINANCE` / mini P | Brand Sidebar R1: designed PAVENRO wordmark expanded, P+leaf icon collapsed |
| Top navigation/settings/period | Theme shortcut in topbar, briefing block on every Settings page, no full period control | UI Controls R1: appearance inside Settings, dedicated top-nav settings, month+year selection, empty-period state, working history surface |

## Explicitly not loaded
- Phase 1 R1.
- Phase 1 R2.
- Daily Briefing R1.
- Any earlier post-r3c Accounts/Snapshot/UI overrides that were reverted before the stable Demo 2 copy.
- Broken `patch6`.
- Any duplicate visual patch whose function is already represented by a later final controller.

## Effective runtime order
The consolidated loader fetches assets in parallel, then executes them in this deterministic order:

1. v4 feature patch
2. v5 feature patch
3. baseline v3 JS + CSS
4. search r3c
5. sidebar-clean CSS
6. Debt Control Center
7. Theme Studio engine
8. bell contrast
9. live state bridge
10. Phase 1 R3
11. Phase 1 core2
12. Phase 1 planning
13. Phase 1 records
14. status persistence fix
15. interaction audit
16. Daily Briefing R2
17. Calendar Studio R1
18. Co-edit Audit R1
19. Offline Sync R1
20. Phase 2 R1
21. Brand Sidebar R1
22. UI Controls R1

The boot report is available at `window.__PV_BOOT_REPORT__` and the final measured consolidated-loader duration is exposed as `document.documentElement.dataset.pvBootMs`.

## Functional acceptance checklist

### Shell / navigation
- Expanded sidebar shows designed PAVENRO wordmark; collapsed rail shows P+leaf app icon.
- Search is sidebar-invoked, not permanently occupying the topbar.
- Help & Support label appears when enabled and expanded.
- Navigation & Modules controls section visibility.
- Top Navigation settings control optional upper-bar items; page-specific Add, notifications and profile remain static.
- Selected month + selected year drive the current Finance period.
- A month with no records shows an empty state rather than fabricated data.

### Dashboard
- KPI text does not clip.
- Safe to Spend, cash flow, spending, budgets, bills, goals and transactions remain connected to live state.
- Quick Actions remain visible.

### Accounts
- Add/edit accounts and transfer flow work.
- Account cards/detail containers align consistently.

### Transactions
- Add/edit/delete/status actions work.
- Receipt attachment uses local IndexedDB.
- Status does not snap back after rerender.

### Bills
- Full bill form, reversible statuses and reminders.
- Paid/upcoming/scheduled/overdue updates persist.

### Budget
- Add budget/category forms.
- Category dropdown-first with Custom option.
- Edit limit and carry-forward behavior.

### Income
- Add/edit source.
- Status dropdown Pending/Received/Paused.
- Mark Received updates connected account/transaction behavior.

### Funds & Goals
- Add/edit goal and contribution flow.
- Progress connected to stored data.

### Documents
- Full metadata before upload.
- Multiple local attachments per logical document.
- Open/download/edit metadata behavior.

### Calendar
- Month/Week/Day/Year views.
- Add by clicking date, edit/delete manual event.
- Finance categories and source-linked scheduled events.

### Subscriptions
- Add/edit/status behavior.
- Cancel inside a form closes the form; archive/cancel status is a separate action.

### Debt
- Overview, payoff simulator, calculators and Snowball vs Avalanche remain available.
- Leaving Debt must not delay the next section.

### Net Worth / Investments
- Add/edit asset/liability/investment.
- Value update and contribution actions.

### Reports / Notes / Tax / Paydays
- Report generation/export/print path.
- Notes add/edit/pin/link/delete.
- Tax add/edit/status.
- Paydays add/edit and Income navigation.

### Settings / appearance / briefing
- Daily Briefing settings only appear in their dedicated Settings entry.
- Appearance themes/fonts/density are configured inside Settings, not through a permanent topbar Theme button.
- Daily Briefing popup and voice controls use locally installed browser/OS voices.

### Co-edit / offline
- Local changes remain usable with internet disconnected.
- Offline writes queue locally.
- Change History remains available offline.
- Permanent shared audit/data storage is Google Drive-first when the production workspace Drive adapter is connected.
- Supabase is reserved for capabilities Drive is poor at (membership/presence/realtime signaling), not the primary financial-record store.

## Performance contract
- Do not reintroduce sequential loading of every controller.
- Do not retry known-broken patch6.
- Do not load superseded R1/R2 controllers to reach a later R3 state.
- Optional controller failure must not trap the whole app on the loading screen.
- Service worker should cache the consolidated loader and final effective assets.
