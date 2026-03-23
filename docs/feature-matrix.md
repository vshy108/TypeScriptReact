# Feature Matrix

This document summarizes the currently implemented sample matrix using `src/sampleCatalog.ts` as the source of truth.

For execution-surface definitions, see `docs/coverage-roadmap.md`. For file-layout guidance, see `docs/repo-map.md`.

## Summary

- implemented samples: 73
- planned samples: 0
- deferred samples: 0

## Implemented Count By Topic

| Topic | Count |
|---|---:|
| Current Lab | 1 |
| React Client | 48 |
| React DOM | 7 |
| React Server | 3 |
| TypeScript Language | 10 |
| TypeScript Interop | 4 |

## Implemented Count By Surface

| Surface | Count |
|---|---:|
| current-app | 1 |
| isolated-route | 59 |
| separate-entry | 3 |
| node-only | 10 |
| comment-demo | 0 |

## Matrix By Topic

### Current Lab

| Title | Sample Id | Surface | Status |
|---|---|---|---|
| Integrated React 19 + TypeScript core lab | `sample-core-lab` | `current-app` | `implemented` |

### React Client

| Title | Sample Id | Surface | Status |
|---|---|---|---|
| Context and provider composition | `sample-react-context-theme` | `isolated-route` | `implemented` |
| Reducer-driven task board | `sample-react-reducer-board` | `isolated-route` | `implemented` |
| Memoization and render-control lab | `sample-react-memo-lab` | `isolated-route` | `implemented` |
| Measured layout and synchronous effects | `sample-react-layout-effects` | `isolated-route` | `implemented` |
| Resource loading with use() | `sample-react-use-resource` | `isolated-route` | `implemented` |
| Activity boundaries and standalone startTransition | `sample-react-activity-transition` | `isolated-route` | `implemented` |
| Debounced search and request races | `sample-react-debounced-search-race` | `isolated-route` | `implemented` |
| Async UI verification and mocked network behavior | `sample-react-async-ui-verification` | `isolated-route` | `implemented` |
| Release readiness feature slice | `sample-react-release-readiness-feature` | `isolated-route` | `implemented` |
| Release approval mutation workflow | `sample-react-release-approval-workflow` | `isolated-route` | `implemented` |
| Release rollout optimistic updates | `sample-react-release-rollout-optimistic` | `isolated-route` | `implemented` |
| Release launch multi-step workflow | `sample-react-release-launch-checklist` | `isolated-route` | `implemented` |
| Release handoff conflict resolution | `sample-react-release-handoff-conflict` | `isolated-route` | `implemented` |
| Release rollout reconciliation | `sample-react-release-rollout-reconciliation` | `isolated-route` | `implemented` |
| Release incident collaborative editing | `sample-react-release-incident-collaboration` | `isolated-route` | `implemented` |
| Release review threads and approvals | `sample-react-release-review-threads` | `isolated-route` | `implemented` |
| Release field-level merge resolution | `sample-react-release-field-merge` | `isolated-route` | `implemented` |
| Release audit history and undo | `sample-react-release-change-history` | `isolated-route` | `implemented` |
| Release branch compare view | `sample-react-release-branch-compare` | `isolated-route` | `implemented` |
| Release scheduled publish state | `sample-react-release-scheduled-publish` | `isolated-route` | `implemented` |
| Release launch orchestration | `sample-react-release-launch-orchestration` | `isolated-route` | `implemented` |
| Release rollout pause and resume | `sample-react-release-rollout-pause-resume` | `isolated-route` | `implemented` |
| Release multi-region rollback | `sample-react-release-multi-region-rollback` | `isolated-route` | `implemented` |
| Release communication handoff | `sample-react-release-communication-handoff` | `isolated-route` | `implemented` |
| Release escalation routing | `sample-react-release-escalation-routing` | `isolated-route` | `implemented` |
| Release ownership transfer audit | `sample-react-release-ownership-transfer-audit` | `isolated-route` | `implemented` |
| Release delegated approval bundles | `sample-react-release-delegated-approval-bundles` | `isolated-route` | `implemented` |
| Release incident timeline reconstruction | `sample-react-release-incident-timeline-reconstruction` | `isolated-route` | `implemented` |
| Release rollback decision matrix | `sample-react-release-rollback-decision-matrix` | `isolated-route` | `implemented` |
| Release incident FAQ curation | `sample-react-release-incident-faq-curation` | `isolated-route` | `implemented` |
| Release incident comms approval packs | `sample-react-release-incident-comms-approval-packs` | `isolated-route` | `implemented` |
| Release post-rollback customer segmentation | `sample-react-release-post-rollback-segmentation` | `isolated-route` | `implemented` |
| Release follow-up commitments | `sample-react-release-follow-up-commitments` | `isolated-route` | `implemented` |
| Release remediation evidence bundles | `sample-react-release-remediation-evidence-bundles` | `isolated-route` | `implemented` |
| Release customer promise reconciliation | `sample-react-release-customer-promise-reconciliation` | `isolated-route` | `implemented` |
| Release rollback waiver ledgers | `sample-react-release-rollback-waiver-ledgers` | `isolated-route` | `implemented` |
| Release recovery credit ledgers | `sample-react-release-recovery-credit-ledgers` | `isolated-route` | `implemented` |
| Release relaunch exception registers | `sample-react-release-relaunch-exception-registers` | `isolated-route` | `implemented` |
| Release remediation readiness registries | `sample-react-release-remediation-readiness-registries` | `isolated-route` | `implemented` |
| Release exit readiness ledgers | `sample-react-release-exit-readiness-ledgers` | `isolated-route` | `implemented` |
| Release stability attestation ledgers | `sample-react-release-stability-attestation-ledgers` | `isolated-route` | `implemented` |
| Release resumption attestation registers | `sample-react-release-resumption-attestation-registers` | `isolated-route` | `implemented` |
| React ESLint rules and purity enforcement | `sample-react-lint-rules-demo` | `node-only` | `implemented` |
| Stale closures and batching traps | `sample-react-stale-closure` | `isolated-route` | `implemented` |
| Context provider identity perf trap | `sample-react-context-identity` | `isolated-route` | `implemented` |
| Error boundaries and Suspense interaction | `sample-react-error-boundary` | `isolated-route` | `implemented` |
| Key identity and state preservation | `sample-react-key-identity` | `isolated-route` | `implemented` |
| Ref timing and callback refs | `sample-react-ref-timing` | `isolated-route` | `implemented` |

### React DOM

| Title | Sample Id | Surface | Status |
|---|---|---|---|
| Portal-based modal and toast system | `sample-react-portal-modal` | `isolated-route` | `implemented` |
| Nested submit button state | `sample-react-form-status` | `isolated-route` | `implemented` |
| Accessible dialog and focus management | `sample-react-accessible-dialog` | `isolated-route` | `implemented` |
| Accessible listbox keyboard navigation | `sample-react-accessible-listbox` | `isolated-route` | `implemented` |
| Accessible form errors and validation messaging | `sample-react-accessible-form-errors` | `isolated-route` | `implemented` |
| Hydration and resource hint APIs | `sample-react-hydration-hints` | `separate-entry` | `implemented` |
| Hydration mismatch detection | `sample-react-hydration-mismatch` | `separate-entry` | `implemented` |

### React Server

| Title | Sample Id | Surface | Status |
|---|---|---|---|
| Streaming SSR and prerender flows | `sample-react-streaming-ssr` | `separate-entry` | `implemented` |
| Server Components and Server Functions | `sample-react-server-components` | `node-only` | `implemented` |
| React Compiler and directives | `sample-react-compiler` | `node-only` | `implemented` |

### TypeScript Language

| Title | Sample Id | Surface | Status |
|---|---|---|---|
| Recursive types and tree-shaped data | `sample-ts-recursive-types` | `isolated-route` | `implemented` |
| Utility, mapped, and conditional types | `sample-ts-utility-mapped` | `isolated-route` | `implemented` |
| Function typing, overloads, and tuples | `sample-ts-functions-tuples` | `isolated-route` | `implemented` |
| Classes and object-oriented modeling | `sample-ts-classes-models` | `isolated-route` | `implemented` |
| Conditional type distributivity | `sample-ts-conditional-distributivity` | `isolated-route` | `implemented` |
| Mapped type filtering and remapping | `sample-ts-mapped-filtering` | `isolated-route` | `implemented` |
| Variance and assignability | `sample-ts-variance` | `node-only` | `implemented` |
| private vs #private fields | `sample-ts-private-fields` | `isolated-route` | `implemented` |
| Template literal type expansion | `sample-ts-template-literals` | `node-only` | `implemented` |
| Generic inference failures | `sample-ts-generic-inference` | `node-only` | `implemented` |

### TypeScript Interop

| Title | Sample Id | Surface | Status |
|---|---|---|---|
| Declaration files and package typing | `sample-ts-declarations` | `node-only` | `implemented` |
| JSDoc and JS project typing | `sample-ts-jsdoc-interop` | `node-only` | `implemented` |
| Enums, symbols, iterators, mixins, and decorators | `sample-ts-advanced-runtime-types` | `node-only` | `implemented` |
| Advanced tsconfig options beyond strict | `sample-ts-advanced-tsconfig` | `node-only` | `implemented` |

## Notes

- This matrix is intentionally a documentation snapshot of the current `src/sampleCatalog.ts` contents.
- If a doc here ever disagrees with `src/sampleCatalog.ts`, treat the catalog as correct and update the docs.
- `comment-demo` remains a valid execution surface in the catalog model, but no current entries use it.