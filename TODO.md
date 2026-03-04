# TODO

## P2 — Accessibility
- [ ] Sleep quality rating buttons (SleepLogModal) — no aria-label or aria-pressed
- [ ] Sleep factor toggle buttons (SleepLogModal) — no aria-label or aria-pressed
- [ ] Journal mood emoji buttons (JournalEntryModal) — emoji-only content with no aria-label
- [ ] Edit/Delete icon-only buttons on Sleep, Exercise, Journal, Nutrition pages — no aria-label
- [ ] Exercise type + intensity buttons (ExerciseLogModal) — no aria-label or aria-pressed
- [ ] Nutrition meal type buttons + food item remove button (NutritionMealModal) — no aria-label/aria-pressed
- [ ] Journal tag remove button (JournalEntryModal) — × character with no aria-label
- [ ] Habit completion cells (HabitCalendarGrid) — td elements need role="checkbox", aria-checked, aria-label

## P2 — Quality
- [ ] preferencesStore updatePreferences — logs error but doesn't set error state; inconsistent with habitStore pattern
- [ ] ProgressRing.tsx — hardcoded text-slate-700 needs dark: prefix (currently low-impact, only used if reintroduced)

## P2 — Test Coverage
- [ ] SimpleHabitModal — no tests; primary habit creation path
- [ ] OnboardingFlow — expand tests to cover all 4 steps navigation, habit selection validation, name input

## P3 — Nice to Have
- [ ] Google Auth — authentication for cross-device sync
- [ ] Address 34 Dependabot vulnerabilities (1 critical, 16 high)
- [ ] HabitCalendarGrid DEBUG_GRID could use process.env check instead of URL param for cleaner dev experience
- [ ] Pre-commit hook could also run tests (currently only tsc) — evaluate if test suite stays fast enough
- [ ] Input.tsx className override doesn't merge well with base dark classes — consider using cn() for user's className too
