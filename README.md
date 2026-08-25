# Nestlyra Focus

A responsive, private-first learning, exam, planning and career workspace designed and developed by Nestlyra.

## Features

- One neutral Nestlyra account for personal use and every group role, including Google sign-in
- A five-module starter course for first-time users
- Customizable navigation presets for children, certification, exams, job seeking and daily planning
- Subjects, modules, topics, tasks, habits, goals, exams, mock tests and revision queues
- Study, exam, certification, accountability and family groups with owner, admin, contributor, member and observer permissions
- Backward-compatible migration of legacy Parent/Learner links into Family groups
- Notes and calendar
- Day, Week and Month calendar views with category filters
- Integrated job application tracker with documents, editing, search, status filters, follow-ups and exports
- Job follow-ups displayed in the shared calendar and notification summary
- Aggregate-only progress/activity projections that keep private syllabus, notes, applications and documents out of Groups
- Text-only Group messaging with unread badges and retention controls
- Optional record-level co-edit for shared tasks, goals, plans and short notes
- Due/overdue states, configurable briefing voice, sounds and notifications
- Nestlyra light default plus user-selectable themes and typography
- Subject-only JSON import/export and Excel export
- Free browser extension for review-first job capture
- Installable PWA shell

Local profiles stay in the browser. Cloud accounts use Supabase for authentication, Groups, aggregate projections, text messaging and limited shared records. Subject import/export intentionally excludes profiles, jobs, messages, documents, notes, tasks, Groups and settings.

Run `supabase-groups-migration.sql` once before enabling Groups in production. The migration keeps existing accounts, converts legacy Family links and messages, and removes the old policy that exposed complete learner tracker records to linked parents.

## Deployment

The preferred Nestlyra beta is Cloudflare Pages. The existing GitHub Pages site remains the legacy production URL until migration is explicitly approved.
