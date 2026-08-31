# HISTORICAL INHERITED BASELINE — NOT THE DEMO 2 AUTHORITY

> **Demo 2 rule:** For `/finance-demo2/`, the authoritative latest-state contract is [`FINANCE_DEMO2_FINAL_STATE.md`](./FINANCE_DEMO2_FINAL_STATE.md). This inherited baseline documents the stable build Demo 2 started from. Where this file conflicts with the Demo 2 final-state contract, the Demo 2 contract wins. In particular, the historical v6/`patch6` requirement below must **not** be restored in Demo 2 because that payload is malformed and was never part of the effective working Demo 2 runtime.

# PAVENRO Finance Canonical Baseline

This file is the permanent acceptance contract for `/finance-demo/`. `FINANCE_FINAL_AUDIT.md` records the full latest-decision history; when an older requirement conflicts with that audit, the later audited decision wins.

## Repository boundary
- Finance work may change files under `finance-demo/` only.
- Never change the Focus production root, root service worker, Focus CSS/JS, authentication, or other root assets while working on Finance.

## Application identity
- Product name: PAVENRO Finance.
- Sidebar brand: `PAVENRO | FINANCE` exactly once.
- No duplicate `PAVENRO FINANCE` / `PAVENRO FOCUS · FINANCE` content labels.
- Brand must remain visible on every appearance theme.

## Sidebar
- Expanded: full brand, Search, section icons + labels, subtle help `?`.
- No 3-dot menu beside brand.
- Collapse uses the panel-layout icon, not `<`.
- Collapsed state is a narrow icon rail.
- Rail shows mini P, expand control, Search and section icons only.
- Rail never shows section labels or help controls.
- Help `?` has no outer circle/border.
- Bottom user/profile card is removed.
- Sidebar/rail preference persists locally.
- `+ More sections` remains the quiet entry to Navigation & Modules.

## Search / top bar
- Search must NOT permanently occupy the top bar.
- Search opens only when invoked from the sidebar Search control and closes when clicking outside.
- Top bar shows the current Finance section title and currency mark matching selected currency.
- Top bar retains month, currency selector, New Transaction, bell notifications and avatar/settings controls supplied by the feature layer.
- No duplicate large section heading below it.

## Layout and viewport
- App shell is locked to the viewport.
- Browser page itself does not vertically scroll.
- Long tables/lists/detail panels scroll internally.
- Dashboard lower row and all four Quick Actions remain visible.
- Text descenders (g, p, y, j) and secondary KPI text must never clip.
- Card borders are visually quiet; hover may add only a subtle emphasis.

## Global spacing rule
- Adjacent data must never visually concatenate.
- Invalid examples that must not return: `Rent30 Aug 2026`, `$179.70Upcoming`, `To SBI SavingsAugust 2026`, `$10,000Completed`.
- Name/date, amount/status, account/status, source/date and equivalent pairs require visible spacing or stacked presentation throughout the application.

## Finance sections
Final core set: Dashboard, Accounts, Transactions, Bills, Budget, Income, Funds & Goals, Documents, Calendar.
Optional: Subscriptions, Debt, Net Worth, Investments, Reports, Notes, Tax Records, Paydays.
Navigation & Modules controls optional/utility visibility. Calendar is core because it was explicitly added after the original 8-section specification.

## Editing / categories
- Every record/container has one Edit action.
- No duplicate Edit / Edit Limit / Edit Goal / Edit Account buttons inside the same detail container.
- Table rows may each have one Edit action.
- Category selection is dropdown-first with reusable categories.
- `Other` / `Add custom category` permits reusable custom user categories.

## Graphs
- Donut charts stay donut charts.
- Center values fit inside the hole without overlap.
- Center label and amount are separate and centered.
- Legends do not collide with the donut.
- Line/bar charts retain legends and hover details from the feature layer.

## Data/features that must remain functional
- Full seeded demo data across all sections.
- Accounts and transfers.
- Transactions and real local receipt attachment workflow.
- Bills and recurring fields.
- Budget calculations.
- Income sources/paydays.
- Funds & Goals contributions/progress.
- Documents and expiry metadata.
- Calendar finance events.
- Subscriptions.
- Debt full form and payments.
- Net Worth `+ New Asset` and editable assets.
- Investment full form, editing, value updates/contributions.
- Notification bell/dropdown.
- Avatar opens Settings center.
- Appearance themes.
- Currency selector.
- Offline-first/demo persistence supplied by the feature layers.

## Language
- Supported language UI continues from the feature translation layer.
- Arabic is intentionally unsupported and must not appear in the selector.
- A previously saved Arabic preference falls back to English/LTR.
- Retained languages must fit without overlapping controls.

## Runtime architecture
Live order is strictly:
1. Base Finance patch (v4 feature/core fixes)
2. v5 feature patch
3. v6 feature patch
4. `finance-baseline-v3.js` LAST

`finance-baseline-v3.js` is the sole authoritative presentation controller. Do not add another sidebar/rail/search/top-title/layout patch. Future visual corrections must modify this final baseline directly.
