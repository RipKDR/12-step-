# Architecture & Stack

## Goals
- **RLS-by-default** security with user‑controlled sharing to sponsors.
- **Offline‑friendly** mobile logging and fast, typed API.
- **Minimal maintenance** (serverless/managed where sensible).

## Stack
- **Mobile App:** Expo (React Native, TypeScript); SecureStore + SQLite; Notifications + Background tasks (geofencing).
- **Web Portal:** Next.js 14 (App Router) + tRPC; Sponsor & Admin views.
- **Backend:** tRPC routes hosted in Next.js (server actions) + Supabase Postgres.
- **Data/Auth/Storage:** Supabase (Auth, RLS Postgres, Buckets).
- **Observability:** Sentry, PostHog (privacy‑respecting, anonymous ids).
- **CI/CD:** GitHub Actions → Vercel deploy (web) → EAS build (mobile).

## High‑Level Flow
1. User signs up (Supabase Auth). Creates profile (timezone).
2. Picks program (NA/AA). Step prompts load from `steps` table.
3. Writes **step entries** (versioned). Optionally shares with sponsor.
4. Logs **daily entries** and quick **craving events** (with optional location).
5. Creates **action plans** (if‑then) and **routines** (nudges).
6. Links sponsor via code; sponsor can see **only shared** items.
7. Optional **trigger locations** (geofences) → on‑enter show plan + notify sponsor.
8. Weekly **check‑in** summary is generated and (optionally) shared.
