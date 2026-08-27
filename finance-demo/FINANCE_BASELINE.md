# PAVENRO Finance Canonical Baseline

This file is the permanent acceptance contract for `/finance-demo/`.

## Repository boundary
- Finance work may change files under `finance-demo/` only.
- Never change the Focus production root, root service worker, Focus CSS/JS, authentication, or other root assets while working on Finance.

## Application identity
- Product name: PAVENRO Finance.
- Sidebar brand: `PAVENRO | FINANCE` exactly once.
- No duplicate `PAVENRO FINANCE` / `PAVENRO FOCUS · FINANCE` content labels.
- Brand must remain visible on every appearance theme.

## Sidebar
- Expanded width: full brand, Search, section icons + labels, subtle help `?`.
- No 3-dot menu beside brand.
- Collapse control uses panel-layout icon, not `<`.
- Collapsed state is a narrow icon rail.
- Rail shows mini P mark, expand control, Search, section icons only.
- Rail never shows section labels or help controls.
- Help `?` has no outer circle/border.
- Bottom user/profile card is not shown in the sidebar.
- Sidebar/rail preference persists locally.

## Search
- Search must NOT permanently occupy the top bar.
- Search opens only when invoked from the sidebar Search control.
- Search closes when clicking outside.

## Top bar
- Shows current Finance section title.
- Shows currency mark matching selected currency.
- Retains month, currency selector, New Transaction, bell notifications, and avatar/settings controls supplied by the feature layer.
- No duplicate large section heading below it.

## Layout and viewport
- App shell is locked to the viewport.
- Browser page itself does not vertically scroll.
- Long tables/lists/detail panels scroll internally.
- Dashboard lower row and Quick Actions remain visible.
- Text descenders (g, p, y, j) and secondary KPI text must never clip.
- Card borders are visually quiet; hover may add a very subtle emphasis.

## Finance sections
Core: Dashboard, Accounts, Transactions, Bills, Budget, Income, Funds & Goals, Documents, Calendar.
Optional: Subscriptions, Debt, Net Worth, Investments, Reports, Notes, Tax Records, Paydays.
Navigation & Modules controls visibility of optional/utility sections.

## Editing
- Every record/container has one Edit action.
- No duplicate Edit / Edit Limit / Edit Goal / Edit Account buttons inside the same detail container.
- Table rows may each have one Edit action.

## Categories
- Category selection is dropdown-first.
- Existing categories are reusable.
- `Other` / `Add custom category` permits custom user-defined categories.
- Users should not retype standard category names for every record.

## Graphs
- Donut charts stay donut charts.
- Center values must fit inside the hole without overlap.
- Center label and amount are separated and centered.
- Legends must not collide with the donut.
- Line/bar charts retain legends and hover details from the feature layer.

## Data/features that must remain functional
- Full seeded demo data across all sections.
- Accounts and transfers.
- Transactions and receipt attachment workflow.
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
- Hindi, Chinese, Japanese, Russian, German, French, Portuguese and other retained languages must fit without overlapping controls.

## Runtime architecture
Live order is strictly:
1. Base Finance patch (v4 feature/core fixes)
2. v5 feature patch (dashboard, donuts, translations, edit rules)
3. v6 feature patch (forms, receipts, Debt/Net Worth/Investments, spacing/sidebar feature fixes)
4. `finance-baseline-v2.js` LAST

`finance-baseline-v2.js` is the sole authoritative presentation controller. Do not add another sidebar/rail/search/top-title controller and do not create a new UI patch layer for routine fixes. Future UI corrections must modify the canonical baseline controller itself.
