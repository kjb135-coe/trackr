# TODO

## P2 — Should Do
- [ ] Modal focus trapping — all 6 modals allow Tab to reach background elements; implement a `useFocusTrap` hook
- [ ] React.memo dashboard components — Sparkline, HabitBreakdown, AggregateStats, TrendChart re-render unnecessarily
- [ ] Memoize calculateWeeklyProgress in HabitCalendarGrid — currently recalculated every render

## P3 — Nice to Have
- [ ] Google Auth — authentication for cross-device sync
- [ ] Address 34 Dependabot vulnerabilities (1 critical, 16 high)
- [ ] Remove dead code files — ControlPanel.tsx, ui/WeeklyGoalModal.tsx, storage.ts, features/ dir
- [ ] Test file for migration.ts OldHabitRaw interface — ensure typed migration handles edge cases
