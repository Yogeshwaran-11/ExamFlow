# ExamFlow Testing Guide 🧪

This document describes the automated testing suite and manual QA checklist for ExamFlow.

---

## 1. Test Architecture Overview

ExamFlow incorporates testing across three levels:
1. **Unit Tests (Vitest)**: Testing business logic, Spaced Repetition calculation, schedule data integrity, timer state machines, and catch-up priority algorithms.
2. **Component Tests (React Testing Library & Vitest)**: Verifying UI state transitions, touch targets, and interaction callbacks.
3. **End-to-End Tests (Playwright)**: Verifying key user journeys including auth, daily routines, plan review, and focus sessions.

---

## 2. Unit & Component Tests

### How to Run
```bash
# Run all unit tests once
pnpm test --run

# Run with interactive UI
pnpm test:ui

# Filter for a specific test file
pnpm test src/test/schedule.test.ts
```

### Test Coverage Summary

| File | Scope & Tested Contracts |
| :--- | :--- |
| `src/test/spaced-repetition.test.ts` | • Creates 3 active recall intervals (+1, +3, +7 days).<br>• Prevents duplicate recall entries.<br>• Filters due tasks where `scheduledDate <= today` and `status = not_started`.<br>• Identifies weak topics when confidence rating $\le 2$. |
| `src/test/schedule.test.ts` | • Validates all 24 days (2026-11-16 to 2026-12-09).<br>• Verifies 6 exam days and 5 light days match specs.<br>• Verifies full days total exactly 390 minutes.<br>• Verifies exam day afternoon sessions are $\le 210$ minutes.<br>• Confirms 2026-12-09 has 0 afternoon study minutes.<br>• Validates 8 milestones and 13 skimmed topics. |
| `src/test/timer.test.ts` | • Timestamp-based time tracking (resilient to tab closes).<br>• Pause and resume time arithmetic.<br>• LocalStorage serialization and active session recovery.<br>• Idempotent `stop()` preventing duplicate session logging. |
| `src/test/catchup.test.ts` | • Past-due task detection.<br>• Priority ordering: next exam practice > IT numericals > Prob ANOVA > core > skimmed.<br>• Multi-day slip detection on consecutive missed days.<br>• Protected status enforcement: protected tasks never droppable.<br>• Skimmed topics surfaced first for dropping. |
| `src/test/StudyBlockCard.test.tsx` | • Rendering block labels and subjects.<br>• Completion and skip callback execution.<br>• Completed (green) and skipped (gray) styling classes.<br>• Skimmed badge display.<br>• Accessible touch targets ($\ge 44$px). |
| `src/test/RecallTaskCard.test.tsx` | • Recall iteration badge display.<br>• Callback invocations for "Remembered" and "Forgot".<br>• Weak topic callback trigger on forgotten cards. |

---

## 3. End-to-End Tests (Playwright)

### How to Run
```bash
# Run all E2E specs
pnpm test:e2e

# Run with Playwright UI mode
npx playwright test --ui

# Run in debug mode
npx playwright test --debug
```

### Test Coverage
- `tests/e2e/auth.spec.ts`: Registration, invalid password handling, password reset, and route guards.
- `tests/e2e/today.spec.ts`: Today dashboard loading, progress bar updates, due recall list, and light day banners.
- `tests/e2e/plan.spec.ts`: 24-day timeline navigation, exam indicators, light day indicators, and block inspect view.
- `tests/e2e/timer.spec.ts`: Countdown timer start, pause/resume continuity, page reload recovery, and session recording.

> **Note on E2E in CI/Offline**: E2E specs wrap network and backend dependencies in graceful skips when running in offline or unconfigured environments.

---

## 4. Manual QA Verification Checklist (25 Steps)

Follow this 25-step journey in a desktop or mobile browser to verify end-to-end functionality:

1. [ ] **Launch**: Open [http://localhost:5173](http://localhost:5173). Verify redirect to `/auth/login`.
2. [ ] **Demo Mode**: Click "Explore in Demo Mode" (or log in). Verify redirect to `/` (Today page).
3. [ ] **Today Header**: Verify header greets the student ("Good morning/afternoon Yogesh") and shows current date.
4. [ ] **Exam Countdown**: Verify countdown card points to the earliest exam (Full Stack — 27 Nov) with remaining days.
5. [ ] **Study Blocks**: Verify today's planned study blocks are listed in proper order with duration badges.
6. [ ] **Mark Complete**: Click "Mark Done" on the first block. Verify the card turns green and daily progress updates.
7. [ ] **Skip Block**: Click "Skip" on a block. Select a reason (e.g. "Ran out of time"). Verify card turns gray.
8. [ ] **Due Recalls**: Inspect the active recall section. Click "Remembered" on a recall task.
9. [ ] **Weak Topic Trigger**: Click "Forgot" on a recall task. Verify topic appears in the "Weak Topics" panel.
10. [ ] **Timer Navigation**: Tap the floating action button "Start Focus Session" or navigate to `/timer`.
11. [ ] **Timer Start**: Select a subject and click "Start". Verify countdown starts ticking.
12. [ ] **Timer Pause & Resume**: Click "Pause", wait 3 seconds, then click "Resume". Verify elapsed time was preserved.
13. [ ] **Timer Persistence**: With timer running, refresh the page. Verify timer automatically recovers running state.
14. [ ] **Timer Stop**: Click "Stop". Verify prompt to save session and session history reflects actual minutes.
15. [ ] **Plan Tab**: Tap "Plan" in bottom nav. Verify Day View shows current day's blocks.
16. [ ] **Plan Full View**: Switch to "Full Plan" or "Week View". Verify all 24 days (16 Nov - 9 Dec) are navigable.
17. [ ] **Light Day Indicator**: Inspect 26 Nov. Verify light day icon/banner indicates early finish.
18. [ ] **Exam Day Indicator**: Inspect 27 Nov. Verify exam badge and afternoon study schedule.
19. [ ] **Dec 9 Rule**: Inspect 9 Dec. Verify only morning formula reading is scheduled.
20. [ ] **Subjects Tab**: Tap "Subjects" in bottom nav. Verify all 6 subjects are displayed with exam dates.
21. [ ] **Subject Detail**: Click into "Full Stack Development". Verify 5 readiness indicator bars render without single score.
22. [ ] **Stats Tab**: Tap "Stats" in bottom nav. Verify bar chart and pie chart display study distribution.
23. [ ] **Notes Tab**: Tap "Notes" in bottom nav. Create a new markdown note, pin it, and verify auto-save.
24. [ ] **Formula Sheets**: Verify pinned formula sheets appear in the Formula Sheet view.
25. [ ] **Settings & Dark Mode**: Tap "Settings". Toggle Theme between Light, Dark, and System. Verify smooth theme transition.

---

## 5. Known Limitations When Firebase Not Configured

When `VITE_FIREBASE_API_KEY` is not set or set to `demo-key`:
- Firebase Cloud Sync is replaced by local `localStorage` and `IndexedDB` caching.
- Auth uses a local mock session without server-side validation.
- Multi-device sync is disabled; data remains local to the active browser instance.
- Offline backup and restore (JSON export/import in Settings) remains fully functional.
