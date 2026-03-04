# TODO

## P1 — Dark Mode & Error Handling
- [ ] Fix Button.tsx secondary/ghost variants — hardcoded light colors (bg-white, text-slate-700) render broken in dark mode; used in OnboardingFlow
- [ ] Fix Input.tsx — hardcoded light colors (bg-white, text-slate-900, text-slate-700 label) render broken in dark mode; used in OnboardingFlow
- [ ] OnboardingFlow handleComplete — no try/catch around async updatePreferences + addHabit loop; silent failures during onboarding
- [ ] OnboardingFlow inner step content — hardcoded light colors (text-slate-700, bg-slate-50, bg-blue-50) throughout all 4 steps; unreadable in dark mode

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

## P2 — Test Coverage
- [ ] OnboardingFlow — no tests; complex 4-step wizard with async side effects
- [ ] SimpleHabitModal — no tests; primary habit creation path

## P3 — Nice to Have
- [ ] Google Auth — authentication for cross-device sync
- [ ] Address 34 Dependabot vulnerabilities (1 critical, 16 high)
- [ ] HabitCalendarGrid DEBUG_GRID could use process.env check instead of URL param for cleaner dev experience
- [ ] Pre-commit hook could also run tests (currently only tsc) — evaluate if test suite stays fast enough
