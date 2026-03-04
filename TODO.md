# TODO

## P1 — Important
- [ ] Modal ARIA roles — none of the 6 modals have `role="dialog"`, `aria-modal="true"`, or `aria-labelledby` pointing to the heading; screen readers don't announce them as dialogs
- [ ] useFocusTrap hook tests — new hook at `src/hooks/useFocusTrap.ts` has no unit tests; verify Tab wrap, Shift+Tab wrap, auto-focus, and focus restore

## P2 — Should Do
- [ ] useThemeClasses hook tests — heavily used hook at `src/hooks/useThemeClasses.ts` has no unit tests
- [ ] Backdrop click a11y — modal backdrops use `onClick` on a `<div>` without keyboard equivalent or `role="presentation"`; not accessible for non-mouse users

## P3 — Nice to Have
- [ ] Google Auth — authentication for cross-device sync
- [ ] Address 34 Dependabot vulnerabilities (1 critical, 16 high)
