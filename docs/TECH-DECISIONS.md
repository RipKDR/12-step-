# Tech Decisions

## Why Expo + Next.js + Supabase?
- **Expo** gives push, background tasks, sensors, and offline storage out‑of‑the‑box.
- **Next.js (App Router)** pairs well with tRPC and serverless cron/actions.
- **Supabase** provides Postgres + Auth + Storage with tight **RLS** control.

## Data Access
- Prefer **RLS‑safe** direct queries from client via Supabase JS for simple reads/writes.
- Use **tRPC** server procedures for composed actions (e.g., generate weekly check‑in, nudge orchestration) and to avoid shipping service role keys.

## Encryption
- Sensitive messages (chat) stored as **ciphertext** (`messages.content_ciphertext`).
- Keys stay on devices (libsodium); server never sees plaintext.

## Geofencing
- Use `expo-location` + `TaskManager` with coarse radius to conserve battery.
- Allow per‑trigger toggle, snooze, and global “pause” switch.

## Analytics
- PostHog with anonymous user id; **never** log step content or free‑text notes.
