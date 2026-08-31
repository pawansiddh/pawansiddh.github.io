# HISTORICAL PRE-DEMO2 AUDIT — SUPERSEDED FOR DEMO 2

> **Demo 2 authority:** Use [`FINANCE_DEMO2_FINAL_STATE.md`](./FINANCE_DEMO2_FINAL_STATE.md) for the current `/finance-demo2/` state. This document is retained only to explain the stable Finance state from which Demo 2 was created. Later Demo 2 decisions—Phase 1 R3, remaining Phase 1 controllers, Daily Briefing R2, Calendar Studio, Co-edit, offline-first sync, Phase 2, final branding and UI controls—supersede conflicting statements below. The historical v6/`patch6` runtime requirement must not be restored in Demo 2.

# PAVENRO Finance — Final Audit / Latest Decision Wins

This document records the final intended state after reviewing the original Finance reference screenshots, the Finance master build prompt, and every later user correction. When two requirements conflict, the later decision in this file wins.

## Product / repository boundary
- Product identity is PAVENRO Finance.
- Finance changes are restricted to `finance-demo/`.
- Do not modify Pavenro Focus production root files, Focus service worker, Focus CSS/JS, auth, or root assets.

## Navigation evolution and final state
- Original build started with 8 Finance defaults: Dashboard, Accounts, Transactions, Bills, Budget, Income, Funds & Goals, Documents.
- Later explicit change added Calendar as a Finance section. Final core set therefore includes Calendar as well.
- Optional modules: Subscriptions, Debt, Net Worth, Investments, Reports, Notes, Tax Records, Paydays.
- `+ More sections` remains a quiet navigation entry to Navigation & Modules.
- Settings / Help & Support remain utility controls and may be configurable.

## Sidebar final state
- Expanded brand is `PAVENRO | FINANCE` once only.
- Remove repeated `PAVENRO FINANCE` section labels.
- Remove the old bottom Pawan/profile card; leave the bottom area clean.
- Remove the vertical three-dot control beside the brand.
- Collapse uses the panel-layout icon requested by the user, not `<`.
- Collapsed state is a narrow ChatGPT-style icon rail.
- Rail shows mini P, expand control, Search icon, section icons only.
- Rail hides labels and all help `?` controls.
- Expanded help `?` controls are plain/subtle text with NO outer circle/border.
- Brand must remain visible on green, blue/dark, and other themes.

## Search / top bar final state
- Search must not remain permanently visible in the top bar.
- Search is invoked from the sidebar Search control and appears as a floating search field/popover.
- Current Finance section title lives in the top bar to save vertical space.
- Currency mark beside the title follows selected currency (₹, $, €, £, etc.).
- Top bar keeps month, currency selector, New Transaction, bell notifications and avatar/settings.
- Remove duplicate large page heading / PAVENRO FOCUS · FINANCE content branding below the top bar.

## Dashboard final state
- Browser page stays fixed to the viewport; the overall page does not vertically scroll.
- Tables/lists/detail cards can scroll internally when necessary.
- All lower dashboard content, including Recent Transactions and all four Quick Actions, stays visible.
- KPI text must not clip descenders such as g/p/y/j or hide secondary text.
- Cards use very quiet borders; stronger border should appear only subtly on hover.
- Quick Actions are visually distinct/attractive: Add Expense, Add Income, Add Bill, Transfer.
- Safe to Spend, Cash Flow, Spending by Category, Budget Health, Upcoming Bills, Savings Goals and Recent Transactions remain connected to the same stored demo data.

## Spacing rule — applies everywhere
- Never concatenate adjacent information visually.
- Examples that must never return: `Rent30 Aug 2026`, `$179.70Upcoming`, `To SBI SavingsAugust 2026`, `$10,000Completed`.
- Name/date, amount/status, source/date, account/status and similar combinations require visible spacing or stacked layout.
- This applies globally, not only to Dashboard.

## Graph final state
- Keep donut charts; do not replace them with horizontal bars.
- Donut center amount/value and label are separate lines and centered in the hole.
- Center values must shrink/fit instead of overlapping the ring or label.
- Legends must remain readable and not collide with the chart.
- Multi-line graphs must show which line is which and provide hover/tool-tip information where supported by the feature layer.

## Editing / forms final state
- One container/record = one Edit control.
- Table rows may each have one row Edit.
- Do not show duplicate Edit/Edit Limit/Edit Goal buttons in one detail card.
- Category fields are dropdown-first with reusable categories.
- `Other` / `Add custom category` allows a user-defined category which can be reused later.
- Receipt attachment in Transactions must be a real local file selection/attachment workflow, not only a toast.
- Debt Add/Edit uses a full form: name/type/lender/original amount/remaining/APR/payment/frequency/next date/linked account/status/notes.
- Net Worth has `+ New Asset` with editable asset records.
- Investments has a full New Investment/Edit form with provider/type/invested/current value/units/date/account/status/notes.
- Subscriptions remains a complete working optional section rather than a broken placeholder.

## Settings / localization final state
- Avatar opens the full Settings center.
- Settings includes appearance, Navigation & Modules, notifications, categories, language/region, data & backup, profile/security/help where provided by feature layer.
- Currency selector supports the Finance currency list and all displayed money follows selected currency.
- Language selection is intended to translate the full interface, not only the sidebar.
- Arabic was explicitly removed and must not appear again; saved Arabic preference falls back to English/LTR.
- Retained languages must resize/fit without heading/navigation overlap.

## Notifications / Calendar
- Top-right notification control is a bell with unread indication and a proper dropdown.
- Finance Calendar contains finance events such as bill due dates, paydays/income, goal reminders, document expiry and custom finance events.

## Connected data behavior retained from original specification
- Bills → Transactions + Accounts + Budget + Dashboard.
- Income → Transactions + Accounts + Dashboard + Safe to Spend.
- Transactions → Accounts + Budget + Dashboard + analytics.
- Funds & Goals → Accounts + Transactions + Savings Progress.
- Documents can link to Accounts/Bills/Transactions/Income and expiry reminders.
- Internal transfers are not counted as income/spending.
- Demo data remains realistic, fictional, removable/restorable.

## Live runtime after final audit
1. Base Finance feature layer (v4)
2. v5 feature layer
3. v6 feature layer
4. `finance-baseline-v3.js` LAST

`finance-baseline-v3.js` is the sole final presentation authority. Future visual/layout fixes must modify this final baseline rather than introduce another sidebar/search/layout patch that can reintroduce old behavior.
