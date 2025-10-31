# BMAD User Stories
**Scrum Master Agent Output**  
**Date**: 2025-01-27  
**Status**: Ready for Development

## Overview

This document contains detailed user stories for the highest-priority tasks from the project plan. Each story includes comprehensive context, acceptance criteria, technical details, dependencies, edge cases, accessibility requirements, and testing strategy.

---

## Story 1: Complete Offline Sync for Daily Entries
**Story ID**: S2-5  
**Priority**: P0 (Critical - Blocking)  
**Effort**: 12h  
**Sprint**: S2 - Daily Core

### User Persona
**Primary**: Mobile app user in recovery  
**Secondary**: User with unreliable internet connection

### Context
Users need to log daily entries even when offline (e.g., on the subway, in areas with poor connectivity). The app should work seamlessly offline and sync when connectivity returns. This is critical for a recovery companion where consistent daily logging is essential for progress tracking.

### User Story
**As a** user in recovery,  
**I want to** log daily entries offline and have them automatically sync when I'm online,  
**So that** I can maintain my recovery journal consistently regardless of connectivity.

### Acceptance Criteria

1. **Offline Functionality**
   - [ ] User can create/edit daily entries when offline
   - [ ] Entries are saved to local SQLite database immediately
   - [ ] User sees visual indicator that entry is pending sync
   - [ ] Entries persist across app restarts

2. **Sync Functionality**
   - [ ] When online, pending entries sync automatically in background
   - [ ] Sync happens on app foreground and on network reconnect
   - [ ] User sees sync status (syncing/synced/error)
   - [ ] Conflicts are resolved (last-write-wins initially)

3. **Data Consistency**
   - [ ] Local entries match server entries after sync
   - [ ] No duplicate entries created
   - [ ] Timestamps preserved correctly
   - [ ] Share status preserved

### Technical Context

**Related Files**:
- `apps/mobile/lib/sync.ts` - Sync utilities (has TODOs)
- `apps/mobile/lib/db.ts` - SQLite database operations (has sync TODOs)
- `packages/api/src/routers/daily.ts` - Daily entries API
- `apps/mobile/app/(tabs)/daily.tsx` - Daily entry screen

**Database Tables**:
- `daily_entries` (Supabase) - Server database
- Local SQLite `daily_entries` table (needs creation)

**API Endpoints to Use**:
- `daily.upsert` - Create/update daily entry
- `daily.getByDate` - Fetch specific entry
- `daily.getRecent` - Fetch recent entries

**RLS Policies**: User can only access their own entries (already enforced)

**Privacy Implications**: None - this is user's own data

### Implementation Plan

1. **Create Local SQLite Table**
   - Schema matching Supabase `daily_entries` table
   - Add `sync_status` column (pending/synced/syncing/error)
   - Add `server_id` column (UUID from Supabase after sync)
   - Add `local_id` column (temporary ID before sync)

2. **Update Database Layer** (`apps/mobile/lib/db.ts`)
   - `createDailyEntryLocal()` - Insert into SQLite
   - `getDailyEntriesLocal()` - Query SQLite
   - `updateDailyEntryLocal()` - Update SQLite
   - `markEntrySynced()` - Update sync status

3. **Update Sync Logic** (`apps/mobile/lib/sync.ts`)
   - `syncDailyEntries()` - Sync pending entries to server
   - Call `daily.upsert` for each pending entry
   - Update local entry with `server_id` and `sync_status`
   - Handle errors gracefully (retry later)

4. **Update UI** (`apps/mobile/app/(tabs)/daily.tsx`)
   - Save to local DB immediately on save
   - Trigger sync in background
   - Show sync indicator (icon + status text)
   - Handle offline state gracefully

5. **Integration Points**
   - Hook into network status (use `@react-native-community/netinfo`)
   - Sync on app foreground (use `AppState`)
   - Sync on network reconnect (use netinfo listener)

### Dependencies
- None - this is a standalone feature

### Edge Cases

1. **Conflict Resolution**
   - Scenario: User edits entry offline, then edits same entry on another device online
   - Resolution: Last-write-wins (use `updated_at` timestamp)
   - UI: Show conflict warning to user if detected

2. **Network Flakiness**
   - Scenario: Network connects/disconnects during sync
   - Resolution: Retry sync with exponential backoff
   - UI: Show "Retrying sync..." message

3. **Large Entry Counts**
   - Scenario: User has 100+ pending entries
   - Resolution: Batch sync (10 entries at a time)
   - UI: Show progress (e.g., "Syncing 5/100 entries")

4. **Entry Deletion**
   - Scenario: User deletes entry offline
   - Resolution: Track deletion in local DB, sync deletion when online
   - UI: Entry disappears immediately, sync deletion later

5. **Share Status Change**
   - Scenario: User toggles share status while offline
   - Resolution: Sync share status change when entry syncs
   - UI: Show pending share status change indicator

### Accessibility Requirements

- **WCAG 2.2 AA**:
  - Sync status must be announced to screen readers
  - Use `accessibilityLabel` for sync indicator
  - Error messages must be accessible
  - Loading states must be announced

- **Touch Targets**: All buttons ≥44x44dp

- **Visual Indicators**:
  - Sync status icon with color coding (green=synced, yellow=pending, red=error)
  - Contrast ratio ≥4.5:1 for status text

### Testing Strategy

**Unit Tests**:
- `syncDailyEntries()` function logic
- Conflict resolution logic
- SQLite operations (create, read, update)

**Integration Tests**:
- Offline create → Online sync flow
- Conflict resolution flow
- Network state change handling

**E2E Tests**:
- Create entry offline → Open app online → Verify sync
- Create entry → Go offline → Edit → Go online → Verify sync
- Create entry on device A → Create entry on device B → Verify conflict resolution

**Manual Testing**:
- Test on real device with airplane mode
- Test with flaky network connection
- Test with 100+ pending entries

---

## Story 2: Replace PostHog Placeholder Implementation
**Story ID**: S6-1  
**Priority**: P0 (Critical - Blocking Production)  
**Effort**: 6h  
**Sprint**: S6 - Polish & Safety

### User Persona
**Primary**: Product team / Analytics team  
**Secondary**: Engineering team (for debugging)

### Context
The app currently uses `console.log` for analytics tracking, which provides no real insights into user behavior, feature adoption, or errors. PostHog provides privacy-respecting analytics (anonymous IDs, no PII) which is essential for understanding how users interact with the app and improving the recovery companion experience.

### User Story
**As a** product manager,  
**I want to** track user engagement and feature usage through PostHog analytics,  
**So that** I can make data-driven decisions to improve the recovery companion.

### Acceptance Criteria

1. **Package Installation**
   - [ ] `@posthog/react-native` installed in mobile app
   - [ ] `posthog-js` installed in web app
   - [ ] Packages properly configured in package.json

2. **Initialization**
   - [ ] PostHog initialized on app startup (mobile)
   - [ ] PostHog initialized on page load (web)
   - [ ] API key loaded from environment variables
   - [ ] Anonymous user IDs used (no PII)

3. **Event Tracking**
   - [ ] Track screen views (automatic)
   - [ ] Track button clicks (manual)
   - [ ] Track feature usage (daily entries, step work, etc.)
   - [ ] Sanitize events (no free-text user content)

4. **User Identification**
   - [ ] Identify users with anonymous ID (not email/handle)
   - [ ] Track user properties (program type, timezone - no PII)
   - [ ] Reset user ID on logout

### Technical Context

**Related Files**:
- `apps/mobile/lib/analytics.ts` - Mobile analytics (has placeholder)
- `apps/web/src/lib/analytics.ts` - Web analytics (has placeholder)
- `.env.example` - Environment variable template
- `apps/mobile/app/_layout.tsx` - App initialization
- `apps/web/src/app/layout.tsx` - Web initialization

**API Endpoints**: None (client-side only)

**RLS Policies**: N/A (client-side analytics)

**Privacy Implications**: 
- Must NOT track free-text content (step entries, daily notes)
- Must use anonymous IDs only
- Must comply with privacy-first design principles

### Implementation Plan

1. **Install Packages**
   ```bash
   cd apps/mobile && pnpm add @posthog/react-native
   cd apps/web && pnpm add posthog-js
   ```

2. **Update Environment Variables**
   - Add `EXPO_PUBLIC_POSTHOG_API_KEY` to mobile `.env.example`
   - Add `NEXT_PUBLIC_POSTHOG_API_KEY` to web `.env.example`
   - Document in README

3. **Update Mobile Analytics** (`apps/mobile/lib/analytics.ts`)
   - Replace `console.log` with actual PostHog calls
   - Initialize PostHog on app startup
   - Track screen views automatically
   - Track events manually (sanitized)
   - Identify users with anonymous ID

4. **Update Web Analytics** (`apps/web/src/lib/analytics.ts`)
   - Replace `console.log` with actual PostHog calls
   - Initialize PostHog on page load
   - Track page views automatically
   - Track events manually (sanitized)

5. **Update App Initialization**
   - Call `initializeAnalytics()` in mobile `_layout.tsx`
   - Call `initializeAnalytics()` in web `layout.tsx`

6. **Event Tracking Examples**
   - `screen_viewed` - Auto-tracked
   - `daily_entry_created` - Manual (no content)
   - `step_entry_created` - Manual (no content)
   - `sponsor_linked` - Manual
   - `action_plan_created` - Manual (no content)

### Dependencies
- PostHog account and API key
- Environment variables configured

### Edge Cases

1. **Missing API Key**
   - Scenario: API key not configured
   - Resolution: Fail gracefully, log warning, continue app functionality
   - UI: No impact (analytics failure shouldn't break app)

2. **Network Errors**
   - Scenario: PostHog API unreachable
   - Resolution: Queue events locally, retry when online
   - UI: No impact (silent retry)

3. **Privacy Violation**
   - Scenario: Accidentally track PII
   - Resolution: Sanitize all events, never track free-text content
   - Prevention: Code review, automated checks

### Accessibility Requirements
- N/A (background service, no UI)

### Testing Strategy

**Unit Tests**:
- Analytics initialization
- Event sanitization (verify no PII)
- User identification

**Integration Tests**:
- Event tracking on screen views
- Event tracking on button clicks
- User identification on login

**Manual Testing**:
- Verify events appear in PostHog dashboard
- Verify no PII in events
- Verify anonymous IDs used

---

## Story 3: Replace Sentry Placeholder Implementation
**Story ID**: S6-2  
**Priority**: P0 (Critical - Blocking Production)  
**Effort**: 6h  
**Sprint**: S6 - Polish & Safety

### User Persona
**Primary**: Engineering team  
**Secondary**: Support team (for user-reported issues)

### Context
The app currently uses `console.log` for error tracking, which provides no visibility into production errors. Sentry provides comprehensive error tracking with stack traces, user context, and release tracking, which is essential for maintaining a stable recovery companion app.

### User Story
**As an** engineer,  
**I want to** track and debug production errors through Sentry,  
**So that** I can quickly identify and fix issues affecting users in recovery.

### Acceptance Criteria

1. **Package Installation**
   - [ ] `@sentry/react-native` installed in mobile app
   - [ ] `@sentry/nextjs` installed in web app
   - [ ] Packages properly configured

2. **Initialization**
   - [ ] Sentry initialized on app startup (mobile)
   - [ ] Sentry initialized on server startup (web)
   - [ ] DSN loaded from environment variables
   - [ ] Environment set (development/production)

3. **Error Capture**
   - [ ] Capture unhandled exceptions
   - [ ] Capture handled errors (via `captureException()`)
   - [ ] Redact PII from error messages
   - [ ] Include user context (anonymous ID only)

4. **Release Tracking**
   - [ ] Track release version
   - [ ] Track build number
   - [ ] Source maps uploaded (for stack traces)

### Technical Context

**Related Files**:
- `apps/mobile/lib/sentry.ts` - Mobile error tracking (has placeholder)
- `apps/web/src/lib/sentry.ts` - Web error tracking (has placeholder)
- `.env.example` - Environment variable template
- `apps/mobile/app/_layout.tsx` - App initialization
- `apps/web/src/app/layout.tsx` - Web initialization
- `apps/web/next.config.mjs` - Next.js config (for Sentry plugin)

**API Endpoints**: None (client-side only)

**RLS Policies**: N/A

**Privacy Implications**:
- Must redact PII from error messages
- Must not log user content (step entries, daily notes)
- Must use anonymous user IDs

### Implementation Plan

1. **Install Packages**
   ```bash
   cd apps/mobile && pnpm add @sentry/react-native
   cd apps/web && pnpm add @sentry/nextjs
   ```

2. **Update Environment Variables**
   - Add `EXPO_PUBLIC_SENTRY_DSN` to mobile `.env.example`
   - Add `SENTRY_DSN` to web `.env.example`
   - Add `SENTRY_AUTH_TOKEN` for source maps (web)
   - Document in README

3. **Update Mobile Sentry** (`apps/mobile/lib/sentry.ts`)
   - Replace `console.log` with actual Sentry calls
   - Initialize Sentry on app startup
   - Configure error boundaries
   - Redact PII from error messages

4. **Update Web Sentry** (`apps/web/src/lib/sentry.ts`)
   - Replace `console.log` with actual Sentry calls
   - Initialize Sentry in `next.config.mjs` (Sentry plugin)
   - Configure error boundaries
   - Redact PII from error messages

5. **Add Error Boundaries**
   - React Error Boundary component (mobile)
   - Next.js Error Boundary (web)
   - Wrap app with error boundaries

6. **Source Maps** (Web)
   - Configure Sentry webpack plugin
   - Upload source maps on build
   - Test stack traces are readable

### Dependencies
- Sentry account and DSN
- Environment variables configured

### Edge Cases

1. **Missing DSN**
   - Scenario: DSN not configured
   - Resolution: Fail gracefully, log warning, continue app functionality
   - UI: No impact (error tracking failure shouldn't break app)

2. **Network Errors**
   - Scenario: Sentry API unreachable
   - Resolution: Queue errors locally, retry when online
   - UI: No impact (silent retry)

3. **PII in Error Messages**
   - Scenario: Error message contains user email/content
   - Resolution: Redact PII before sending to Sentry
   - Prevention: Sanitization function, code review

### Accessibility Requirements
- N/A (background service, no UI)

### Testing Strategy

**Unit Tests**:
- Error capture logic
- PII redaction
- User context attachment

**Integration Tests**:
- Error boundary catches errors
- Errors sent to Sentry
- PII redacted correctly

**Manual Testing**:
- Trigger test error, verify in Sentry dashboard
- Verify stack traces readable (with source maps)
- Verify no PII in Sentry

---

## Story 4: Complete Daily Entry Form UI
**Story ID**: S2-1  
**Priority**: P1 (High - User-Facing)  
**Effort**: 8h  
**Sprint**: S2 - Daily Core

### User Persona
**Primary**: User in recovery logging daily progress

### Context
Users need a complete, intuitive form to log their daily recovery progress. The current screen exists but needs full implementation of all fields (cravings intensity, feelings array, triggers array, coping actions array, gratitude, notes) with proper validation and user experience.

### User Story
**As a** user in recovery,  
**I want to** fill out a complete daily entry form with all my recovery data,  
**So that** I can track my progress comprehensively.

### Acceptance Criteria

1. **Form Fields**
   - [ ] Cravings intensity slider (0-10) with visual feedback
   - [ ] Feelings multi-select (chips or tags)
   - [ ] Triggers multi-select (chips or tags with ability to add custom)
   - [ ] Coping actions multi-select (chips or tags with ability to add custom)
   - [ ] Gratitude text field (optional)
   - [ ] Notes text field (optional)

2. **User Experience**
   - [ ] Form saves to local DB immediately (offline-first)
   - [ ] Form validates before save
   - [ ] Success feedback after save
   - [ ] Can edit existing entry
   - [ ] Can view entry history

3. **Share Toggle**
   - [ ] Toggle to share entry with sponsor
   - [ ] Clear indicator of share status
   - [ ] Can change share status after save

### Technical Context

**Related Files**:
- `apps/mobile/app/(tabs)/daily.tsx` - Daily entry screen (needs completion)
- `apps/mobile/lib/db.ts` - Local database operations
- `packages/api/src/routers/daily.ts` - Daily entries API
- `packages/types/src/index.ts` - TypeScript types
- `packages/ui/src/ChipSelector.tsx` - Chip selector component (may need enhancements)

**Database Tables**:
- `daily_entries` (Supabase + SQLite local)

**API Endpoints**:
- `daily.upsert` - Save entry
- `daily.getByDate` - Load existing entry

**RLS Policies**: User owns their entries

**Privacy Implications**: User controls sharing via toggle

### Implementation Plan

1. **Update Form Component** (`apps/mobile/app/(tabs)/daily.tsx`)
   - Use React Hook Form + Zod validation
   - Add all form fields with proper types
   - Implement cravings slider with visual scale
   - Implement multi-select for feelings/triggers/coping actions
   - Add "Add custom" functionality for triggers/coping actions

2. **Create/Update Types**
   - Ensure Zod schema matches API expectations
   - Type for daily entry form data

3. **Implement Save Logic**
   - Save to local DB first (Story S2-5)
   - Trigger sync in background
   - Show success message
   - Handle errors gracefully

4. **Implement Load Logic**
   - Load today's entry if exists
   - Pre-populate form fields
   - Show "Edit existing entry" indicator

5. **Implement Share Toggle**
   - Toggle switch with clear label
   - Save share status with entry
   - Visual indicator of share status

6. **UI/UX Polish**
   - Loading states
   - Error states
   - Success feedback
   - Form validation messages

### Dependencies
- Story S2-5 (Offline Sync) for local DB operations

### Edge Cases

1. **Partial Entry**
   - Scenario: User fills form partially and closes app
   - Resolution: Auto-save draft to local DB
   - UI: "Draft saved" indicator

2. **Entry Already Exists**
   - Scenario: User tries to create entry for date that exists
   - Resolution: Load existing entry, allow edit
   - UI: Show "Editing existing entry" message

3. **Network Error on Save**
   - Scenario: User saves but network fails
   - Resolution: Save to local, sync later (offline-first)
   - UI: Show "Saved offline, will sync when online"

### Accessibility Requirements

- **WCAG 2.2 AA**:
  - All form fields have `accessibilityLabel`
  - Validation errors announced to screen readers
  - Slider has `accessibilityValue` with current value
  - Multi-select chips are keyboard navigable
  - Touch targets ≥44x44dp

- **Visual**:
  - Form labels clearly visible
  - Error messages in high contrast
  - Success feedback clearly visible

### Testing Strategy

**Unit Tests**:
- Form validation logic
- Save to local DB
- Load from local DB

**Integration Tests**:
- Save entry → Verify in local DB
- Save entry → Sync to server → Verify on server
- Load existing entry → Edit → Save → Verify update

**E2E Tests**:
- Fill form → Save → Verify entry created
- Fill form offline → Save → Go online → Verify sync
- Edit existing entry → Save → Verify update

**Manual Testing**:
- Test all form fields
- Test validation
- Test offline save
- Test share toggle

---

## Story 5: Replace Dashboard Mock Data with Real tRPC Calls
**Story ID**: S3-2  
**Priority**: P1 (High - User-Facing)  
**Effort**: 8h  
**Sprint**: S3 - Sponsor Link

### User Persona
**Primary**: Sponsor viewing sponsee dashboard

### Context
The sponsor dashboard currently displays mock data, which prevents sponsors from seeing real sponsee information. This is a critical feature for sponsors to track sponsee progress and provide support.

### User Story
**As a** sponsor,  
**I want to** see real data about my sponsees on the dashboard,  
**So that** I can track their recovery progress and provide appropriate support.

### Acceptance Criteria

1. **Data Replacement**
   - [ ] Remove all mock data
   - [ ] Replace with tRPC calls
   - [ ] Show loading states while fetching
   - [ ] Show error states if fetch fails

2. **Dashboard Metrics**
   - [ ] Active sponsees count (real data)
   - [ ] Step entries this week (real data)
   - [ ] Daily logs this week (real data)
   - [ ] Needs attention count (real data - based on risk scores or engagement)

3. **Charts**
   - [ ] Cravings intensity trend (real data from shared entries)
   - [ ] Program distribution (real data)
   - [ ] Weekly progress chart (real data)

4. **Recent Activity**
   - [ ] Real step entries from sponsees
   - [ ] Real daily logs from sponsees
   - [ ] Real action plans from sponsees
   - [ ] Timestamps and sponsee names

### Technical Context

**Related Files**:
- `apps/web/src/app/dashboard/page.tsx` - Dashboard page (has mock data)
- `packages/api/src/routers/sponsor.ts` - Sponsor router
- `packages/api/src/routers/daily.ts` - Daily router
- `packages/api/src/routers/steps.ts` - Steps router
- `packages/api/src/routers/plans.ts` - Plans router

**Database Tables**:
- `sponsor_relationships` - Get active sponsees
- `step_entries` - Get shared step entries
- `daily_entries` - Get shared daily entries
- `action_plans` - Get shared action plans

**API Endpoints**:
- `sponsor.getRelationships` - Get sponsees
- `sponsor.getSharedContent` - Get shared content
- May need new aggregated endpoints for dashboard metrics

**RLS Policies**: Sponsor can only see shared content from active relationships

**Privacy Implications**: 
- Only show data explicitly shared by sponsees
- Respect RLS policies strictly

### Implementation Plan

1. **Analyze Data Needs**
   - Identify what data dashboard needs
   - Check if existing endpoints provide it
   - Create new aggregated endpoints if needed

2. **Update Dashboard Component** (`apps/web/src/app/dashboard/page.tsx`)
   - Remove mock data
   - Add tRPC queries for each data section
   - Add loading states (skeletons)
   - Add error states

3. **Create Aggregated Queries** (if needed)
   - `sponsor.getDashboardMetrics` - Aggregated metrics
   - Or use existing endpoints and aggregate client-side

4. **Update Charts**
   - Replace mock data with real data
   - Handle empty states gracefully
   - Format data for charts correctly

5. **Update Recent Activity**
   - Fetch real shared content
   - Sort by timestamp
   - Format for display

6. **Error Handling**
   - Handle no sponsees case
   - Handle no shared content case
   - Handle API errors gracefully

### Dependencies
- Sponsor relationships API (exists)
- Shared content API (exists, may need enhancements)

### Edge Cases

1. **No Sponsees**
   - Scenario: Sponsor has no active sponsees
   - Resolution: Show empty state with helpful message
   - UI: "No active sponsees yet. Share your sponsor code to connect."

2. **No Shared Content**
   - Scenario: Sponsor has sponsees but no shared content
   - Resolution: Show empty state per section
   - UI: "No shared content yet" with explanation

3. **Partial Data**
   - Scenario: Some sponsees share, some don't
   - Resolution: Show only shared content, aggregate correctly
   - UI: Clear indication of what's shared vs not

### Accessibility Requirements

- **WCAG 2.2 AA**:
  - Loading states announced to screen readers
  - Error states announced
  - Charts have text alternatives
  - Table data is accessible

- **Visual**:
  - Charts have high contrast
  - Data tables are readable
  - Empty states are clear

### Testing Strategy

**Unit Tests**:
- Data aggregation logic
- Chart data formatting

**Integration Tests**:
- Fetch dashboard data via tRPC
- Verify RLS policies enforced
- Verify only shared content shown

**E2E Tests**:
- Sponsor logs in → Views dashboard → Sees real data
- Sponsor has no sponsees → Sees empty state
- Sponsor has sponsees with no shared content → Sees appropriate empty states

**Manual Testing**:
- Test with real sponsor account
- Test with multiple sponsees
- Test with various sharing scenarios
- Test loading and error states

---

## Summary

These 5 user stories represent the highest priority tasks from the project plan:

1. **S2-5**: Offline Sync (P0, blocking)
2. **S6-1**: PostHog Analytics (P0, blocking production)
3. **S6-2**: Sentry Error Tracking (P0, blocking production)
4. **S2-1**: Daily Entry Form (P1, user-facing)
5. **S3-2**: Dashboard Real Data (P1, user-facing)

**Next Steps**: Developer Agent should start implementing these stories, beginning with the P0 items (S2-5, S6-1, S6-2) as they block other work and production deployment.

---

**End of Scrum Master Agent Report**

