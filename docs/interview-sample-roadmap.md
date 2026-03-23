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
- release approval mutation workflow with draft state, a save mutation, validation errors, and persisted workflow history
- release rollout optimistic updates with speculative UI removal and rollback on failed validation
- release launch multi-step workflow with dependent saved actions that unlock later steps
- release handoff conflict resolution with background polling, expected-revision saves, and explicit reload-before-save recovery
- release rollout reconciliation with optimistic client state that later syncs back to the authoritative server result
- release incident collaborative editing with teammate presence, a shared draft, and conflict-aware saves
- release review threads and approvals with blocked publish until reviewer comments are resolved and approvals are green
- release field-level merge resolution with automatic non-conflicting merges and explicit side-by-side conflict choices
- release audit history and undo with attributed snapshots for each change and rollback of the latest revision
- release branch compare view with alternate drafts, side-by-side wording comparison, and branch promotion
- release scheduled publish state with approvals, a live countdown, and a rollback window immediately after publish
- release launch orchestration with progressive checkpoints, live guardrails, and automatic abort when a metric breaches during rollout
- release rollout pause and resume with checkpoint acknowledgements and manual override recovery after an operator stop
- release multi-region rollback targeting with dependency acknowledgements and partial recovery before the final region completes
- incident communication handoff with channel-specific acknowledgements and staged publish recovery when one handoff lane fails
- escalation routing with acknowledgement deadlines and fallback owner reassignment when the primary owner misses the window
- ownership transfer auditing with outgoing and incoming acknowledgements plus escalation replay context before the handoff closes
- delegated approval bundles with expiry windows and replayable audit evidence before publish

Highest-value addition:

- a twentieth feature slice that models incident timeline reconstruction with conflicting witness notes and a publish-safe executive summary gate

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