# TODO

## P2 — Bugs
- [ ] ErrorBoundary — text-gray-200/text-gray-400 hardcoded for dark backgrounds only; invisible in light mode
- [ ] OnboardingFlow habit selection — uses motion.div with onClick instead of button; keyboard users can't select habits

## P3 — Nice to Have
- [ ] Google Auth — authentication for cross-device sync
- [ ] Address 34 Dependabot vulnerabilities (1 critical, 16 high)
- [ ] HabitCalendarGrid DEBUG_GRID could use process.env check instead of URL param for cleaner dev experience
- [ ] Pre-commit hook could also run tests (currently only tsc) — evaluate if test suite stays fast enough
- [ ] Input.tsx className override doesn't merge well with base dark classes — consider using cn() for user's className too
- [ ] Error boundary logging — ErrorBoundary in AppShell could log caught errors to a more persistent store for debugging
