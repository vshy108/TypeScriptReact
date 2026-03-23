# Interview Sample Roadmap

This roadmap lists the highest-value additions for making the repository more useful for frontend interview preparation.

It is intentionally ordered by practical interview payoff, not by API completeness.

## 1. Accessibility-Focused Samples

Implemented now:

- accessible dialog with focus trap, keyboard dismissal, and focus return
- accessible listbox with arrow-key navigation, Home and End jumps, and keyboard selection
- accessible form errors with semantic associations, announced summaries, and focus on the first invalid field

Highest-value additions:

- no additional high-priority additions in this section right now

Why this matters:

- accessibility is commonly evaluated in frontend interviews
- many strong React candidates are weak on practical a11y behavior

## 2. Testing, Debouncing, And Request-Race Samples

Implemented now:

- debounced search sample showing stale-response overwrite vs cancellation-based protection
- testing example showing async UI verification and mocked network behavior

Highest-value additions:

- no additional high-priority additions in this section right now

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
- incident timeline reconstruction with conflicting witness notes and a publish-safe executive summary gate
- release rollback decision matrices with conflicting metrics and quorum-based sign-off
- cross-channel incident FAQ curation with stale-answer invalidation and reviewer sign-off
- post-incident follow-up commitments with ETA drift invalidation and approver sign-off
- remediation evidence bundles with stale-proof invalidation and approver sign-off
- customer promise reconciliation with stale-claim invalidation and approver sign-off
- rollback waiver ledgers with expired exception invalidation and approver sign-off
- recovery credit ledgers with stale-credit invalidation and approver sign-off
- relaunch exception registers with stale-threshold invalidation and approver sign-off
- remediation readiness registries with stale-evidence invalidation and approver sign-off
- exit readiness ledgers with stale-criterion invalidation and approver sign-off
- stability attestation ledgers with stale-signal invalidation and approver sign-off
- resumption attestation registers with stale-check invalidation and approver sign-off
- staged incident comms approval packs with legal overrides and customer-visible rollback wording diffs
- post-rollback customer segmentation with region-specific update timing and escalation-safe message forks

Highest-value addition:

- no additional high-priority additions in this section right now

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
- [./interview-walkthroughs.md](./interview-walkthroughs.md)
- [./frontend-system-design.md](./frontend-system-design.md)
- [./debugging-playbook.md](./debugging-playbook.md)

Highest-value additions:

- no additional high-priority additions in this section right now