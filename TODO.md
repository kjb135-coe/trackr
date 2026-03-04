# TODO

## P2 — Quality
- [ ] ProgressRing.tsx — hardcoded text-slate-700 needs dark: prefix (currently low-impact, only used if reintroduced)

## P2 — Test Coverage
- [ ] OnboardingFlow — expand tests to cover all 4 steps navigation, habit selection validation, name input

## P3 — Nice to Have
- [ ] Google Auth — authentication for cross-device sync
- [ ] Address 34 Dependabot vulnerabilities (1 critical, 16 high)
- [ ] HabitCalendarGrid DEBUG_GRID could use process.env check instead of URL param for cleaner dev experience
- [ ] Pre-commit hook could also run tests (currently only tsc) — evaluate if test suite stays fast enough
- [ ] Input.tsx className override doesn't merge well with base dark classes — consider using cn() for user's className too
- [ ] Error boundary logging — ErrorBoundary in AppShell could log caught errors to a more persistent store for debugging
- [ ] Surface preferencesStore.error in AppShell error toast — now that error state exists, display it to users
