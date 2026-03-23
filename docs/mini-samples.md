# Mini-sample Backlog

This project now treats the remaining backlog as isolated mini-samples instead of one ever-growing demo page.

## Why this split exists

- Portals need their own host layer.
- Hydration and resource hints need a separate entry point.
- SSR APIs need a server runtime.
- Declaration files and JSDoc interop are cleaner in node-oriented samples.
- Type-heavy TypeScript topics are easier to learn when the runtime UI stays small.

## Current integrated sample

- `sample-core-lab`
  Covers `useActionState`, `useOptimistic`, `useDeferredValue`, `useTransition`, `useEffectEvent`, `useSyncExternalStore`, `lazy`, and `Suspense`.
  This remains integrated because those APIs reinforce each other in one realistic client flow.

## React client mini-samples

- `sample-react-context-theme`
  Covers `createContext`, `useContext`, and `Fragment`.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-reducer-board`
  Covers `useReducer`.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-memo-lab`
  Covers `memo`, `useMemo`, `useCallback`, `Profiler`, and `useDebugValue`.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-layout-effects`
  Covers `useLayoutEffect` and `useInsertionEffect`.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-use-resource`
  Covers `use`.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-debounced-search-race`
  Covers debouncing, `useEffect` cleanup, `AbortController`, and stale-response handling.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-readiness-feature`
  Covers a typed API client, a custom hook, derived view state, and integration-style feature tests.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-approval-workflow`
  Covers typed mutation clients, draft state management, validation errors, and persisted mutation results.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-rollout-optimistic`
  Covers optimistic UI, rollback on mutation failure, and typed blocker-resolution flows.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-launch-checklist`
  Covers multi-step mutations, sequencing rules, and dependent follow-up actions.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-handoff-conflict`
  Covers background refetching, expected-revision saves, conflict detection, and reloading the latest server version.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-rollout-reconciliation`
  Covers optimistic UI that is later corrected by background refetch and authoritative server reconciliation.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-incident-collaboration`
  Covers multi-actor presence, a shared draft, teammate edits, and conflict-aware collaborative saves.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-review-threads`
  Covers comment threads, reviewer approvals, and blocked publish flows for a shared release message.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-field-merge`
  Covers field-level merge resolution, automatic non-conflicting merges, and side-by-side conflict choices.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-change-history`
  Covers audit history, change attribution, and undoing the most recent release update revision.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-branch-compare`
  Covers branching drafts, side-by-side compare views, and promoting an alternate release branch to primary.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-scheduled-publish`
  Covers approval gates, a publish countdown, and a short rollback window after release.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-launch-orchestration`
  Covers progressive rollout checkpoints, traffic promotion, live guardrails, and automatic abort behavior.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-rollout-pause-resume`
  Covers pausing a rollout at a checkpoint, collecting required acknowledgements, and resuming through a manual override path.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-multi-region-rollback`
  Covers targeted regional rollback, partial recovery, dependency acknowledgements, and resuming the final recovery step.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-communication-handoff`
  Covers per-channel handoff acknowledgements, staged publish sequencing, and recovery confirmation when one channel fails mid-publish.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-escalation-routing`
  Covers acknowledgement deadlines, fallback owner reassignment, and queue progression after a rerouted escalation.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-ownership-transfer-audit`
  Covers outgoing and incoming owner acknowledgements, escalation replay context, and a persistent audit trail before ownership changes hands.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-delegated-approval-bundles`
  Covers delegated approval fallback, expiry windows, replayable audit evidence, and the publish gate that stays closed until all of that is complete.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-incident-timeline-reconstruction`
  Covers conflicting witness notes, canonical timeline resolution, executive summary regeneration, and the publish gate that stays blocked until the summary is safe.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-rollback-decision-matrix`
  Covers conflicting rollback metrics, canonical decision selection, quorum sign-off, and the execution gate that stays blocked until governance is complete.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-incident-comms-approval-packs`
  Covers staged operations and legal approvals, rollback wording diffs, legal override application, and the publish gate that stays blocked until the override is applied.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-incident-faq-curation`
  Covers cross-channel FAQ review, stale-answer invalidation, reviewer sign-off, and the publish gate that stays blocked until the refreshed answers are approved.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-post-rollback-segmentation`
  Covers region-specific rollback update timing, customer segmentation, escalation-safe message forks, and the publish gate that stays blocked until the segmented plan is ready.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-follow-up-commitments`
  Covers post-incident follow-up commitments, ETA drift invalidation, approver sign-off, and the publish gate that stays blocked until the revised commitments are approved.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-remediation-evidence-bundles`
  Covers remediation evidence bundles, stale-proof invalidation, approver sign-off, and the publish gate that stays blocked until the revised evidence is approved.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-customer-promise-reconciliation`
  Covers customer promise reconciliation, stale-claim invalidation, approver sign-off, and the publish gate that stays blocked until the reconciled language is approved.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-rollback-waiver-ledgers`
  Covers rollback waiver ledgers, expired-exception invalidation, approver sign-off, and the publish gate that stays blocked until the revised waivers are approved.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-recovery-credit-ledgers`
  Covers recovery credit ledgers, stale-credit invalidation, approver sign-off, and the publish gate that stays blocked until the revised credits are approved.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-relaunch-exception-registers`
  Covers relaunch exception registers, stale-threshold invalidation, approver sign-off, and the publish gate that stays blocked until the revised thresholds are approved.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-remediation-readiness-registries`
  Covers remediation readiness registries, stale-evidence invalidation, approver sign-off, and the publish gate that stays blocked until the revised packet is approved.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-release-exit-readiness-ledgers`
  Covers exit readiness ledgers, stale-criterion invalidation, approver sign-off, and the publish gate that stays blocked until the revised packet is approved.
  Status: implemented.
  Recommended surface: standalone route.

## React DOM mini-samples

- `sample-react-portal-modal`
  Covers `createPortal` and `flushSync`.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-form-status`
  Covers `useFormStatus`.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-accessible-dialog`
  Covers accessible dialog semantics, focus trap, focus return, and keyboard dismissal.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-hydration-hints`
  Covers `hydrateRoot`, `preconnect`, `prefetchDNS`, `preinit`, `preinitModule`, `preload`, and `preloadModule`.
  Status: implemented.
  Recommended surface: separate client entry point.

- `sample-react-activity-transition`
  Covers `Activity` and standalone `startTransition`.
  Status: implemented.
  Recommended surface: standalone route.

## React server mini-samples

- `sample-react-streaming-ssr`
  Covers `renderToPipeableStream`, `renderToReadableStream`, `renderToString`, `renderToStaticMarkup`, `resumeToPipeableStream`, `prerender`, `prerenderToNodeStream`, `resume`, `resumeAndPrerender`, and `resumeAndPrerenderToNodeStream`.
  Status: implemented.
  Recommended surface: separate SSR workspace.

- `sample-react-server-components`
  Covers Server Components, Server Functions, `'use client'`, and `'use server'`.
  Status: implemented (comment-based demo).
  Surface: comment-demo.

- `sample-react-compiler`
  Covers React Compiler, `"use memo"`, and `"use no memo"`.
  Status: implemented (comment-based demo).
  Surface: comment-demo.

## TypeScript language mini-samples

- `sample-ts-utility-mapped`
  Covers `Partial`, `Pick`, `Record`, `ReturnType`, `keyof`, conditional types, mapped types, and `infer`.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-ts-functions-tuples`
  Covers tuples, overloads, call signatures, construct signatures, and `this` typing.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-ts-classes-models`
  Covers classes, access modifiers, abstract classes, `implements`, and intersection types.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-ts-recursive-types`
  Covers recursive interfaces, recursive type aliases, `DeepReadonly`, and `DeepKeyPaths`.
  Status: implemented.
  Recommended surface: standalone route.

## TypeScript interop mini-samples

- `sample-ts-declarations`
  Covers `.d.ts` authoring, declaration merging, module augmentation, and triple-slash directives.
  Status: implemented.
  Recommended surface: node-only package-style sample.

- `sample-ts-jsdoc-interop`
  Covers JSDoc-powered typing, `allowJs`, and `checkJs`.
  Status: implemented.
  Recommended surface: node-only package-style sample.

- `sample-ts-advanced-runtime-types`
  Covers enums, symbols, iterators, mixins, decorators, and namespaces.
  Status: implemented.
  Recommended surface: node-only package-style sample.

- `sample-ts-advanced-tsconfig`
  Covers `resolveJsonModule`, `paths`, `baseUrl`, `composite`, `declarationMap`, `importHelpers`, and `noPropertyAccessFromIndexSignature`.
  Status: implemented.
  Recommended surface: node-only package-style sample.

## React lint mini-samples

- `sample-react-lint-rules-demo`
  Covers `exhaustive-deps`, `rules-of-hooks`, `react-compiler` purity enforcement, and `react-refresh/only-export-components`.
  Status: implemented (comment-based demo).
  Surface: comment-demo.

## React edge-case mini-samples

- `sample-react-stale-closure`
  Covers stale closures in setTimeout/Promise, functional updaters, and React 18+ automatic batching.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-context-identity`
  Covers context provider identity perf trap and the useMemo/useCallback fix.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-error-boundary`
  Covers ErrorBoundary vs Suspense, lazy() failures, nested boundaries, and reset.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-key-identity`
  Covers key={index} reorder bug, key={id} fix, and the key reset trick.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-ref-timing`
  Covers ref.current null during render, callback refs, and useImperativeHandle.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-hydration-mismatch`
  Covers hydration mismatch causes, detection, suppressHydrationWarning, and fixes.
  Status: implemented (comment-based demo).
  Surface: comment-demo.

## TypeScript edge-case mini-samples

- `sample-ts-conditional-distributivity`
  Covers distributive vs non-distributive conditional types, Extract/Exclude, never-as-empty-union, and infer.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-ts-mapped-filtering`
  Covers mapped type key remapping with `as`, value-based filtering via never, template literal key transforms, and symbol key exclusion.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-ts-private-fields`
  Covers private vs #private fields, override keyword, parameter properties, and field initialization order.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-ts-variance`
  Covers covariance, contravariance, invariance, Array unsoundness, and explicit variance annotations.
  Status: implemented.
  Recommended surface: node-only package-style sample.

- `sample-ts-template-literals`
  Covers template literal types, union cartesian products, intrinsic string manipulation, infer pattern matching, and route params.
  Status: implemented.
  Recommended surface: node-only package-style sample.

- `sample-ts-generic-inference`
  Covers partial inference (currying workaround), NoInfer<T>, overload resolution order, contextual typing, generic defaults, and satisfies.
  Status: implemented.
  Recommended surface: node-only package-style sample.

## Suggested build order

All samples are implemented.
