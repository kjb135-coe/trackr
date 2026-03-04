# TODO

## P2 — Should Do
- [ ] Modal focus trapping — all 6 modals allow Tab to reach background elements; implement a `useFocusTrap` hook
- [ ] Replace `any` types — migration.ts (3), preferencesRepository.ts (1), achievementRepository.ts (1); use `unknown` or typed unions
- [ ] WeeklyGoalModal preset buttons — missing `aria-pressed` to announce selected state
- [ ] parseInt radix — ExerciseLogModal and NutritionMealModal use `parseInt()` without radix parameter; also WeeklyGoalModal slider onChange
- [ ] React.memo dashboard components — Sparkline, HabitBreakdown, AggregateStats, TrendChart re-render unnecessarily

## P3 — Nice to Have
- [ ] Google Auth — authentication for cross-device sync
- [ ] Address 34 Dependabot vulnerabilities (1 critical, 16 high)
- [ ] Remove dead code files — ControlPanel.tsx, ui/WeeklyGoalModal.tsx, storage.ts, features/ dir
- [ ] Remove `@ts-ignore` in logger.ts — optional chaining already handles undefined process
