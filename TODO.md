# TODO

## P2 — Quality
- [ ] OnboardingFlow uses Input/Card/Button from ui/ barrel — these generic ui components lack dark mode theming (they hardcode light colors like `text-slate-900`, `bg-white`)

## P3 — Nice to Have
- [ ] Google Auth — authentication for cross-device sync
- [ ] Address 34 Dependabot vulnerabilities (1 critical, 16 high)
- [ ] HabitCalendarGrid DEBUG_GRID could use process.env check instead of URL param for cleaner dev experience
- [ ] Pre-commit hook could also run tests (currently only tsc) — evaluate if test suite stays fast enough
- [ ] Add aria-labels to remaining interactive elements (quality/mood rating buttons, factor toggles, delete buttons in context menus)
