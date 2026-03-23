# Interview Sample Roadmap

This roadmap lists the highest-value additions for making the repository more useful for frontend interview preparation.

It is intentionally ordered by practical interview payoff, not by API completeness.

## 1. Accessibility-Focused Samples

Implemented now:

- accessible dialog with focus trap, keyboard dismissal, and focus return

Highest-value additions:

- menu or listbox with keyboard navigation
- form error messaging with semantic associations and keyboard-friendly validation

Why this matters:

- accessibility is commonly evaluated in frontend interviews
- many strong React candidates are weak on practical a11y behavior

## 2. Testing, Debouncing, And Request-Race Samples

Implemented now:

- debounced search sample showing stale-response overwrite vs cancellation-based protection

Highest-value additions:

- testing example showing async UI verification and mocked network behavior

Why this matters:

- interviews often ask about async data correctness, not only hook syntax
- request races and debouncing are common real product issues

## 3. Real-World Feature Slice

Implemented now:

- release readiness feature slice with `types.ts`, `client.ts`, `useReleaseReadiness.ts`, `ReleaseReadinessPanel.tsx`, and an integration test

Highest-value addition:

- a second feature slice that includes a mutation flow, not only a read-heavy dashboard

Suggested structure:

- `src/features/<feature>/types.ts`
- `src/features/<feature>/client.ts`
- `src/features/<feature>/useFeature.ts`
- `src/features/<feature>/FeaturePanel.tsx`
- `src/features/<feature>/FeaturePanel.test.tsx`

Why this matters:

- it prepares you for architecture questions better than isolated API demos alone
- it gives you a concrete example for discussing file organization and state ownership

## 4. Interview-Focused Docs

Already added in this docs folder:

- [./interview-prep.md](./interview-prep.md)
- [./interview-questions.md](./interview-questions.md)
- [./frontend-system-design.md](./frontend-system-design.md)
- [./debugging-playbook.md](./debugging-playbook.md)