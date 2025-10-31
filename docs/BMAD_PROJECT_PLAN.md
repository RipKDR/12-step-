# BMAD Project Plan
**PM Agent Output**  
**Date**: 2025-01-27  
**Status**: Ready for Development

## Overview

This project plan breaks down the remaining S2-S6 roadmap work into prioritized, actionable tasks with timeline estimates. The plan is organized by sprint, aligned with the existing 6-sprint roadmap structure, with dependencies clearly identified.

---

## Priority Framework

**P0 - Critical (Blocking)**: Must complete before production release
- Offline sync functionality
- Placeholder replacements (PostHog, Sentry, Encryption)
- Geofencing integration

**P1 - High (User-Facing)**: Core user experience features
- Complete mobile UI forms
- Sponsor read-only views
- Quick actions (craving log, call sponsor)

**P2 - Medium (Quality)**: Quality, testing, accessibility
- Test coverage
- WCAG 2.2 AA compliance
- Type safety improvements

**P3 - Low (Polish)**: Nice-to-have, enhancements
- Calendar export verification
- Documentation updates
- Performance optimizations

---

## Sprint Breakdown

### SPRINT 2 COMPLETION (Daily Core)
**Goal**: Complete all S2 features with full UI and offline support  
**Duration**: 1.5 weeks  
**Dependencies**: None (foundation complete)

#### Tasks

| Task ID | Task | Priority | Effort | Dependencies | Assignee |
|---------|------|----------|--------|--------------|----------|
| S2-1 | Complete daily entry form UI | P1 | 8h | None | Mobile Dev |
| S2-2 | Implement quick craving log action | P1 | 4h | S2-1 | Mobile Dev |
| S2-3 | Implement streak milestones UI | P1 | 6h | None | Mobile Dev |
| S2-4 | Add daily nudge notification setup | P1 | 4h | S2-1 | Mobile Dev |
| S2-5 | Complete offline sync for daily entries | P0 | 12h | None | Mobile Dev |
| S2-6 | Test daily entry flow end-to-end | P2 | 4h | S2-1, S2-5 | QA |

**Sprint 2 Deliverables**:
- ✅ Fully functional daily entry form
- ✅ Quick craving log from home screen
- ✅ Streak celebrations with milestones
- ✅ Daily nudge notifications working
- ✅ Offline-first daily entries with sync

---

### SPRINT 3 COMPLETION (Sponsor Link)
**Goal**: Complete sponsor relationship flows and read-only views  
**Duration**: 2 weeks  
**Dependencies**: S2 complete (for shared daily entries)

#### Tasks

| Task ID | Task | Priority | Effort | Dependencies | Assignee |
|---------|------|----------|--------|--------------|----------|
| S3-1 | Improve mobile sponsor connection UX | P1 | 6h | None | Mobile Dev |
| S3-2 | Replace dashboard mock data with tRPC | P1 | 8h | None | Web Dev |
| S3-3 | Implement shared step entries view | P1 | 8h | S3-2 | Web Dev |
| S3-4 | Implement shared daily entries view | P1 | 8h | S3-2 | Web Dev |
| S3-5 | Implement shared action plans view | P1 | 8h | S3-2 | Web Dev |
| S3-6 | Add "Call me" action (messaging integration) | P1 | 10h | None | Full-Stack |
| S3-7 | Add "Need help" action (urgent notification) | P1 | 6h | None | Full-Stack |
| S3-8 | Real-time sponsor notifications | P2 | 8h | S3-6, S3-7 | Backend Dev |
| S3-9 | Test sponsor access controls (RLS) | P0 | 6h | S3-3, S3-4, S3-5 | QA |

**Sprint 3 Deliverables**:
- ✅ Improved sponsor connection flow
- ✅ Sponsor dashboard with real data
- ✅ Read-only views of all shared content types
- ✅ "Call me" and "Need help" actions
- ✅ Verified RLS policies working correctly

---

### SPRINT 4 COMPLETION (Plans & Routines)
**Goal**: Complete action plans and routines UI and completion flows  
**Duration**: 2 weeks  
**Dependencies**: S2, S3 (for sharing functionality)

#### Tasks

| Task ID | Task | Priority | Effort | Dependencies | Assignee |
|---------|------|----------|--------|--------------|----------|
| S4-1 | Implement action plans if-then builder UI | P1 | 12h | None | Mobile Dev |
| S4-2 | Implement emergency contacts form | P1 | 6h | S4-1 | Mobile Dev |
| S4-3 | Complete action plans mobile UI | P1 | 8h | S4-1, S4-2 | Mobile Dev |
| S4-4 | Implement routines mobile UI | P1 | 12h | None | Mobile Dev |
| S4-5 | Implement routine completion flow | P1 | 8h | S4-4 | Mobile Dev |
| S4-6 | Test routine nudges cron job | P2 | 4h | None | QA |
| S4-7 | Test weekly check-in cron job | P2 | 4h | None | QA |
| S4-8 | Action plans sharing with sponsor | P2 | 6h | S4-3, S3-5 | Full-Stack |

**Sprint 4 Deliverables**:
- ✅ Complete action plans UI with if-then builder
- ✅ Complete routines UI with completion tracking
- ✅ Routine nudges working via cron
- ✅ Weekly check-ins generating summaries
- ✅ Action plans shareable with sponsors

---

### SPRINT 5 COMPLETION (Triggers & Context)
**Goal**: Complete geofencing integration and support card features  
**Duration**: 1.5 weeks  
**Dependencies**: S4 (for action plans integration)

#### Tasks

| Task ID | Task | Priority | Effort | Dependencies | Assignee |
|---------|------|----------|--------|--------------|----------|
| S5-1 | Integrate geofencing on app startup | P0 | 8h | None | Mobile Dev |
| S5-2 | Implement location picker UI | P1 | 10h | None | Mobile Dev |
| S5-3 | Implement radius selector | P1 | 4h | S5-2 | Mobile Dev |
| S5-4 | Complete trigger locations CRUD UI | P1 | 8h | S5-2, S5-3 | Mobile Dev |
| S5-5 | Test geofencing background task | P0 | 6h | S5-1 | QA |
| S5-6 | Implement breathing timer | P1 | 6h | None | Mobile Dev |
| S5-7 | Implement 5-4-3-2-1 grounding exercise | P1 | 8h | None | Mobile Dev |
| S5-8 | Add crisis resources (region-configurable) | P1 | 6h | None | Mobile Dev |
| S5-9 | Test geofence → action plan flow | P1 | 4h | S5-1, S4-1 | QA |

**Sprint 5 Deliverables**:
- ✅ Geofencing working on app startup
- ✅ Complete trigger locations UI
- ✅ Support card fully functional
- ✅ Breathing timer and grounding exercises
- ✅ Crisis resources with regional config

---

### SPRINT 6 COMPLETION (Polish & Safety)
**Goal**: Production readiness, testing, accessibility, observability  
**Duration**: 2 weeks  
**Dependencies**: All previous sprints

#### Tasks

| Task ID | Task | Priority | Effort | Dependencies | Assignee |
|---------|------|----------|--------|--------------|----------|
| S6-1 | Replace PostHog placeholder | P0 | 6h | None | Full-Stack |
| S6-2 | Replace Sentry placeholder | P0 | 6h | None | Full-Stack |
| S6-3 | Replace encryption placeholder | P0 | 8h | None | Backend Dev |
| S6-4 | Implement data export UI flow | P1 | 8h | None | Mobile Dev |
| S6-5 | Implement delete account UI flow | P1 | 6h | None | Mobile Dev |
| S6-6 | Comprehensive a11y audit | P2 | 12h | All UI complete | QA + Dev |
| S6-7 | Fix a11y issues (WCAG 2.2 AA) | P2 | 16h | S6-6 | Dev |
| S6-8 | Unit tests for critical paths | P2 | 16h | None | Dev |
| S6-9 | Integration tests for tRPC routers | P2 | 12h | None | Dev |
| S6-10 | E2E tests for critical flows | P2 | 12h | None | QA |
| S6-11 | RLS policy test suite | P0 | 8h | None | QA |
| S6-12 | Risk-based supportive prompts UI | P2 | 8h | None | Mobile Dev |
| S6-13 | Performance testing | P3 | 8h | None | QA |
| S6-14 | Documentation final review | P3 | 4h | All features | Tech Writer |

**Sprint 6 Deliverables**:
- ✅ Production-ready observability (PostHog + Sentry)
- ✅ Secure message encryption
- ✅ Data export/delete UI flows
- ✅ WCAG 2.2 AA compliant
- ✅ >70% test coverage on critical paths
- ✅ Verified RLS policies
- ✅ Complete documentation

---

## Critical Path Analysis

### Blocking Dependencies

```
S2 (Offline Sync) → Blocks all offline-first features
  ↓
S3 (Sponsor Views) → Blocks sponsor portal completion
  ↓
S4 (Action Plans) → Blocks geofencing action plan integration
  ↓
S5 (Geofencing) → Depends on S4
  ↓
S6 (Production Ready) → Depends on all previous
```

### Parallel Work Streams

**Stream A: Mobile Development** (Can work in parallel)
- S2-1, S2-2, S2-3, S2-4 (daily core)
- S4-1, S4-2, S4-3, S4-4, S4-5 (plans & routines)
- S5-1, S5-2, S5-3, S5-4, S5-6, S5-7, S5-8 (triggers & support)
- S6-4, S6-5, S6-12 (polish)

**Stream B: Web Development** (Can work in parallel)
- S3-2, S3-3, S3-4, S3-5 (sponsor portal)
- Can work independently from mobile

**Stream C: Backend/Infrastructure** (Can work in parallel)
- S2-5 (offline sync backend support)
- S3-6, S3-7, S3-8 (messaging, notifications)
- S5-5 (geofencing testing)
- S6-1, S6-2, S6-3 (placeholder replacements)
- S6-11 (RLS testing)

**Stream D: QA/Testing** (Follows development)
- Can test as features complete
- S6-6, S6-7, S6-10, S6-13 (comprehensive testing)

---

## Resource Allocation

### Team Roles
- **Mobile Dev**: 1 FTE (focuses on React Native/Expo)
- **Web Dev**: 0.5 FTE (focuses on Next.js portal)
- **Backend Dev**: 0.5 FTE (focuses on tRPC, Supabase, cron jobs)
- **Full-Stack Dev**: 0.5 FTE (supports both mobile/web as needed)
- **QA Engineer**: 0.5 FTE (testing, a11y audit)
- **Tech Writer**: 0.25 FTE (documentation)

### Timeline Estimate

**Total Duration**: ~9 weeks (with parallel streams)

- **S2**: 1.5 weeks
- **S3**: 2 weeks (can overlap with S4)
- **S4**: 2 weeks (can overlap with S3)
- **S5**: 1.5 weeks
- **S6**: 2 weeks

**Critical Path**: ~7 weeks if done sequentially, ~9 weeks with realistic parallelization and dependencies.

---

## Risk Assessment

### High Risk Items

1. **Offline Sync Complexity** (S2-5)
   - **Risk**: Sync conflict resolution may be complex
   - **Mitigation**: Start early, use proven patterns (last-write-wins initially)
   - **Contingency**: Phase 1: Simple sync, Phase 2: Conflict resolution

2. **Geofencing Background Task** (S5-1, S5-5)
   - **Risk**: iOS/Android background task limitations
   - **Mitigation**: Test early on real devices, follow Expo best practices
   - **Contingency**: Fall back to foreground-only geofencing if needed

3. **RLS Policy Testing** (S6-11)
   - **Risk**: Complex policies, hard to test comprehensively
   - **Mitigation**: Create test user accounts, automated RLS test suite
   - **Contingency**: Manual security audit if automated tests incomplete

### Medium Risk Items

4. **Encryption Implementation** (S6-3)
   - **Risk**: Libsodium integration complexity
   - **Mitigation**: Use well-documented libraries, test thoroughly
   - **Contingency**: Phase encryption rollout (optional initially)

5. **Accessibility Compliance** (S6-6, S6-7)
   - **Risk**: May find many issues, time-consuming to fix
   - **Mitigation**: Audit early, fix incrementally
   - **Contingency**: Prioritize critical a11y issues, defer non-critical

---

## Milestones & Deliverables

### Milestone 1: Daily Core Complete (End of S2)
- ✅ Daily entries fully functional
- ✅ Offline sync working
- ✅ Streaks and milestones
- **Date**: Week 1.5

### Milestone 2: Sponsor Portal Functional (End of S3)
- ✅ Real data in dashboard
- ✅ Read-only views working
- ✅ "Call me" / "Need help" actions
- **Date**: Week 3.5

### Milestone 3: Plans & Routines Complete (End of S4)
- ✅ Action plans UI complete
- ✅ Routines UI complete
- ✅ Cron jobs verified
- **Date**: Week 5.5

### Milestone 4: Triggers & Support Complete (End of S5)
- ✅ Geofencing functional
- ✅ Support card complete
- **Date**: Week 7

### Milestone 5: Production Ready (End of S6)
- ✅ All placeholders replaced
- ✅ Test coverage >70%
- ✅ WCAG 2.2 AA compliant
- ✅ Documentation complete
- **Date**: Week 9

---

## Task Dependencies Graph

```
S2-5 (Offline Sync) ──┐
                       ├─> Blocks all offline features
S5-1 (Geofencing) ────┘

S3-2 (Dashboard Data) ──> S3-3, S3-4, S3-5 (Shared Views)

S4-1 (If-then Builder) ──> S4-2 (Contacts) ──> S4-3 (Complete UI)

S4-4 (Routines UI) ──> S4-5 (Completion Flow)

S5-2 (Location Picker) ──> S5-3 (Radius) ──> S5-4 (Complete UI)

S6-6 (A11y Audit) ──> S6-7 (Fix Issues)

All Features ──> S6-8, S6-9, S6-10 (Testing)
```

---

## Success Metrics

### Completion Metrics
- **S2**: 5/6 tasks complete = 83% (acceptable, can defer daily nudge if needed)
- **S3**: 9/9 tasks complete = 100%
- **S4**: 8/8 tasks complete = 100%
- **S5**: 9/9 tasks complete = 100%
- **S6**: 14/14 tasks complete = 100%

### Quality Metrics
- Test coverage: >70% on critical paths
- Accessibility: WCAG 2.2 AA compliant
- Type safety: 0 `any` types in production code
- Performance: <2s initial load, <500ms API responses

---

## Next Steps

1. **Scrum Master Agent** should create detailed user stories for:
   - Top 5-10 highest priority tasks from this plan
   - Include full context, acceptance criteria, technical details

2. **Developer Agent** should start with:
   - S2-5 (Offline Sync) - highest priority blocking task
   - S6-1, S6-2, S6-3 (Placeholder replacements) - blocking production

3. **QA Agent** should prepare:
   - Test plans for each sprint
   - RLS policy test suite
   - Accessibility audit checklist

---

**End of PM Agent Report**

