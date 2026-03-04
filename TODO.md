# TODO

## P0 — High Impact
- [ ] Replace `any` types in active code — `SimpleHabitModal.onSave`, `HabitsPage.handleEditHabit`, `AppShell.handleSaveHabit` should use `HabitV2`
- [ ] Replace `console.error()` with `logger.error()` in habitStore.ts (4 instances at lines 84, 97, 108, 129)
- [ ] Add React Error Boundary wrapping AppShell to catch component crashes gracefully

## P1 — Important
- [ ] Remove debug `console.warn` in HabitCalendarGrid.tsx:191 (or guard behind DEBUG_GRID flag)
- [ ] Delete dead code: `ControlPanel.tsx`, `services/storage.ts`, `ComingSoon.tsx` — none imported from live paths
- [ ] Add tsc --noEmit to CI/pre-commit hook now that it passes cleanly

## P2 — Quality
- [ ] Add tests for layout components (AppShell, Navigation) — critical UI with zero test coverage
- [ ] Add tests for HabitsPage and MonthlyCalendarPage
- [ ] Add ARIA labels to interactive elements — only 3 aria-labels in entire codebase
- [ ] Fix git push permissions — switch remote to HTTPS permanently or add keegan-stepper SSH key to kjb135-coe repo

## P3 — Nice to Have
- [ ] Google Auth — authentication for cross-device sync
- [ ] Address 34 Dependabot vulnerabilities (1 critical, 16 high)
- [ ] Replace `any` types in logger utility with `unknown`
