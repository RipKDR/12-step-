# Missing Files & Code Analysis

## Critical Missing Components

### 1. **Meetings API Router** ❌
**Location**: `packages/api/src/routers/meetings.ts`
**Status**: Missing
**Impact**: Mobile app calls `trpc.meetings.search.useQuery` but router doesn't exist
**Reference**: `apps/mobile/app/(tabs)/me/meetings.tsx:22`

### 2. **BMLT API Integration** ❌
**Location**: Utility file needed for meeting search
**Status**: Missing
**Impact**: Cannot find NA meetings via BMLT API
**Reference**: Meetings screen references BMLT but no implementation

### 3. **PostHog Analytics Integration** ⚠️
**Location**: Should be in `apps/mobile/lib/analytics.ts` and `apps/web/src/lib/analytics.ts`
**Status**: Missing
**Impact**: No anonymous analytics tracking
**Note**: Mentioned in docs but not implemented

### 4. **Sentry Error Tracking** ⚠️
**Location**: Should be in `apps/mobile/lib/sentry.ts` and `apps/web/src/lib/sentry.ts`
**Status**: Missing
**Impact**: No error tracking/monitoring
**Note**: Mentioned in docs but not implemented

### 5. **Libsodium Encryption Utilities** ❌
**Location**: `packages/utils/src/encryption.ts` or similar
**Status**: Missing
**Impact**: Messages stored as ciphertext but no encryption/decryption logic
**Reference**: Messages table has `content_ciphertext` and `nonce` fields

### 6. **Calendar Export (.ics)** ⚠️
**Location**: `apps/mobile/lib/calendar.ts` or utility function
**Status**: Missing
**Impact**: Cannot export meetings to calendar
**Reference**: `apps/mobile/app/(tabs)/me/meetings.tsx:65-77` (placeholder)

### 7. **Risk Signal Scoring Algorithm** ❌
**Location**: `packages/api/src/utils/riskScoring.ts` or similar
**Status**: Missing
**Impact**: Risk signals table exists but no scoring logic
**Note**: Should analyze daily entries, cravings, streaks to generate risk score (0-100)

### 8. **Messages Router** ⚠️
**Location**: `packages/api/src/routers/messages.ts`
**Status**: Missing (placeholder in sponsor router)
**Impact**: Cannot send/receive encrypted messages between sponsor/sponsee
**Reference**: `packages/api/src/routers/sponsor.ts:393-415` (placeholder)

### 9. **Test Files** ❌
**Location**: Missing across entire codebase
**Status**: No test files found
**Impact**: No test coverage
**Expected**: Unit tests, integration tests per testing.mdc rules

### 10. **Environment Files** ⚠️
**Location**: 
- `apps/mobile/.env.example`
- `apps/web/.env.example`
**Status**: Only root `env.example` exists
**Impact**: Unclear separation of mobile vs web config

## Database Schema Issues

### Missing Field
- `profiles.program` - Referenced in code but schema shows it exists ✓
- `daily_entries.share_with_sponsor` vs `is_shared_with_sponsor` - Inconsistency in naming
- `routines.description` - Referenced in types but may be missing from actual schema

## API Router Registration

### Missing from root.ts
- `meetings` router (referenced in mobile app but not registered)
- `messages` router (messages functionality exists but no dedicated router)

## Type Definitions

### Missing Schemas
- Meeting search result types
- BMLT API response types
- Calendar export types
- Risk scoring input/output types

## Next Steps

1. **Priority 1 (Critical)**:
   - Create meetings router
   - Create BMLT API client
   - Create encryption utilities

2. **Priority 2 (Important)**:
   - PostHog/Sentry integration
   - Messages router
   - Risk scoring algorithm

3. **Priority 3 (Nice to Have)**:
   - Calendar export
   - Test files structure
   - Separate env files

