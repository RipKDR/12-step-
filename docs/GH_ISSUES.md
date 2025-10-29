# GitHub Issues Backlog

## Milestone: S1 – Foundation
- [ ] Supabase project: set auth email templates & domain
- [ ] Run `supabase_recovery_app_schema.sql`
- [ ] Seed `steps` with neutral prompts (no copyrighted content)
- [ ] Setup Next.js 14 web portal (tRPC, NextAuth/Supabase)
- [ ] Setup Expo app (tabs: Home, Step Work, Daily, Plans, Me)
- [ ] Supabase client config (anon key, URL via `.env`)
- [ ] Profiles: create/update + timezone selection

## Milestone: S2 – Daily Core
- [ ] Daily Entry screen + local cache; 0–10 cravings slider
- [ ] Feelings/tag input (multiselect)
- [ ] Craving Event quick action (FAB) + optional location
- [ ] Streak computation (local midnight, user tz)
- [ ] Push registration + “daily nudge”

## Milestone: S3 – Sponsor Link
- [ ] Link by code (pending → accept → active)
- [ ] Step entries: per‑entry share toggle + badge
- [ ] Sponsor portal read-only views
- [ ] “Call me” quick action (push to sponsor)

## Milestone: S4 – Plans & Routines
- [ ] Action plan CRUD (if‑then, checklist, contacts)
- [ ] Routine scheduler (daily/weekly JSON)
- [ ] Completion logger & history
- [ ] Weekly check-in generator card

## Milestone: S5 – Triggers & Context
- [ ] Trigger locations CRUD (label, lat/lng, radius)
- [ ] Background geofencing task
- [ ] On-enter: show plan; optional sponsor notification
- [ ] Support Card (breathing/grounding timers)

## Milestone: S6 – Polish & Safety
- [ ] Data export (JSON/ZIP) & delete account
- [ ] Accessibility pass (scalable fonts, labels)
- [ ] PostHog (anonymous) + Sentry
- [ ] Risk heuristics (non-medical) and supportive prompts
