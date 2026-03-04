# TODO

## P1 — Important
- [ ] Remove debug `console.warn` in HabitCalendarGrid.tsx:191 (or guard behind DEBUG_GRID flag)
- [ ] Delete dead code: `ControlPanel.tsx`, `services/storage.ts`, `ComingSoon.tsx` + their tests — none imported from live paths
- [ ] Add tsc --noEmit to CI/pre-commit hook now that it passes cleanly

## P2 — Quality
- [ ] Add tests for layout components (AppShell, Navigation) — critical UI with zero test coverage
- [ ] Add tests for HabitsPage and MonthlyCalendarPage
- [ ] Add ARIA labels to interactive elements — only 3 aria-labels in entire codebase (all in AppShell footer)
- [ ] Fix git push permissions — switch remote to HTTPS permanently (done for now) or add keegan-stepper SSH key
- [ ] DashboardPage.tsx still imports old MoodInsights component from PR #4 — verify it works with new dashboard components

## P3 — Nice to Have
- [ ] Google Auth — authentication for cross-device sync
- [ ] Address 34 Dependabot vulnerabilities (1 critical, 16 high)
- [ ] Replace `any` types in logger utility with `unknown`
- [ ] ErrorBoundary could use componentDidCatch to log errors via logger utility
