# React 19 + TypeScript 5.9 Lab

This project is a modern React starter that goes beyond the default template. It uses the current scaffolded stack in this workspace:

- React `19.2.4`
- React DOM `19.2.4`
- TypeScript `5.9.3`
- Vite `8.0.0`

## What the app demonstrates

- `useActionState()` for form workflows
- `useOptimistic()` for immediate optimistic feedback
- `useDeferredValue()` and `useTransition()` for responsive filtering
- `useSyncExternalStore()` for external subscriptions
- `useEffectEvent()` for stable effect-driven event handlers
- React 19 `ref` as a prop with `useImperativeHandle()`
- `lazy()` and `Suspense` for code-split UI
- A separate hydration entry that demonstrates `hydrateRoot()` plus the `react-dom` resource hint APIs
- Strict TypeScript compiler flags such as `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess`
- Template literal ids, assertion functions, `as const satisfies`, and generic components

## Scripts

- `npm run dev` starts the Vite dev server
- `npm run build` runs TypeScript project builds and produces a production bundle
- `npm run lint` runs ESLint
- `npm run test` runs the registry-driven sample test suite in Vitest
- `npm run test:watch` runs the Vitest watcher during sample development
- `npm run typecheck` runs TypeScript without building the app bundle
- `npm run preview` serves the built app locally

## Reading guides

- `docs/reading-index.md` is the fastest repo-first reading path through the annotated code
- `docs/react-typescript-terms.md` is the landing page for the React and TypeScript term guides
- `docs/interview-prep.md` is the practical React frontend interview-prep path built on top of the repo

## File map

- `src/App.tsx` contains the interactive React showcase
- `src/catalog.ts` holds typed sample data and domain types
- `src/releaseStore.ts` is the external store example for `useSyncExternalStore`
- `src/sampleCatalog.ts` is the typed registry for isolated mini-samples
- `src/implementedSampleArtifacts.ts` describes implemented samples that live outside the current SPA route surface
- `src/sampleImplementations.ts` is the shared implementation registry used by both the app and the test suite
- `src/sampleRuntime.ts` resolves mini-sample hash routes
- `src/components/CommandPalette.tsx` shows React 19 ref-as-prop usage
- `src/components/FeatureGrid.tsx` is a generic TypeScript component
- `src/components/MiniSampleBoard.tsx` renders the mini-sample backlog in the app
- `src/components/MiniSampleStage.tsx` renders the active mini-sample or placeholder slot
- `src/samples/ContextThemeSample.tsx` demonstrates `createContext()` and `useContext()` in an isolated sample
- `src/samples/ReducerBoardSample.tsx` demonstrates `useReducer()` with domain-oriented actions instead of a trivial counter
- `src/samples/FormStatusSample.tsx` demonstrates `useFormStatus()` through nested submit controls and a form-scoped pending inspector
- `src/samples/MemoLabSample.tsx` demonstrates `memo()`, `useMemo()`, `useCallback()`, `Profiler`, and `useDebugValue()` in one isolated render-control lab
- `src/samples/LayoutEffectsSample.tsx` demonstrates `useLayoutEffect()` and `useInsertionEffect()` with measured chips and injected style rules
- `src/samples/UseResourceSample.tsx` demonstrates `use()` with Suspense, a tiny promise cache, and explicit resource refreshes
- `src/samples/DebouncedSearchRaceSample.tsx` demonstrates debouncing, overlapping request races, and `AbortController`-based cancellation
- `src/samples/PortalModalSample.tsx` demonstrates `createPortal()` and `flushSync()` with body-mounted modal and toast hosts
- `src/samples/AccessibleDialogSample.tsx` demonstrates accessible dialog behavior with labeled semantics, focus trapping, Escape dismissal, and focus return
- `src/features/release-readiness/types.ts` defines the typed domain model for the real-world feature slice
- `src/features/release-readiness/client.ts`, `src/features/release-readiness/useReleaseReadiness.ts`, and `src/features/release-readiness/ReleaseReadinessPanel.tsx` show one complete feature path from typed API client to hook to UI
- `src/features/release-approval-workflow/types.ts` defines the typed mutation workflow model for a second feature slice
- `src/features/release-approval-workflow/client.ts`, `src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts`, and `src/features/release-approval-workflow/ReleaseApprovalWorkflowPanel.tsx` show a draft-edit-submit flow with server-style validation and persisted mutation state
- `src/features/release-rollout-optimistic/types.ts` and `src/features/release-rollout-optimistic/*` show optimistic UI removal, mutation rollback, and speculative client state in a third feature slice
- `src/features/release-launch-checklist/types.ts` and `src/features/release-launch-checklist/*` show dependent multi-step mutations where one saved action unlocks the next operational step
- `src/features/release-handoff-conflict/types.ts` and `src/features/release-handoff-conflict/*` show background polling, expected-revision saves, server-drift detection, and explicit conflict resolution for a local draft
- `src/features/release-rollout-reconciliation/types.ts` and `src/features/release-rollout-reconciliation/*` show optimistic client state that is later reconciled by background refetch and authoritative server updates
- `src/features/release-incident-collaboration/types.ts` and `src/features/release-incident-collaboration/*` show multi-actor presence, a shared incident draft, teammate edits, and conflict-aware collaborative saves
- `src/features/release-review-threads/types.ts` and `src/features/release-review-threads/*` show collaborative review threads, approvals, and a publish action that stays blocked until review is complete
- `src/features/release-field-merge/types.ts` and `src/features/release-field-merge/*` show field-level merge resolution where untouched fields auto-merge and overlapping fields require an explicit choice
- `src/features/release-change-history/types.ts` and `src/features/release-change-history/*` show audit history, change attribution, and undo support for the latest shared release revision
- `src/features/release-branch-compare/types.ts` and `src/features/release-branch-compare/*` show branching drafts, side-by-side compare views, and promotion of an alternate release branch to primary
- `src/features/release-scheduled-publish/types.ts` and `src/features/release-scheduled-publish/*` show approval-gated scheduling, live publish countdowns, and a short rollback window after publish
- `src/features/release-launch-orchestration/types.ts` and `src/features/release-launch-orchestration/*` show progressive rollout checkpoints, timer-driven promotion, live guardrails, and automatic abort when a metric breaches
- `src/features/release-rollout-pause-resume/types.ts` and `src/features/release-rollout-pause-resume/*` show pausing at an active checkpoint, collecting operator acknowledgements, and resuming through a manual override path
- `src/features/release-multi-region-rollback/types.ts` and `src/features/release-multi-region-rollback/*` show targeted regional rollback, partial recovery, dependency acknowledgements, and the resumed final recovery step
- `src/features/release-communication-handoff/types.ts` and `src/features/release-communication-handoff/*` show channel-by-channel acknowledgements, staged publish sequencing, and recovery confirmation when one communication lane fails
- `src/features/release-escalation-routing/types.ts` and `src/features/release-escalation-routing/*` show acknowledgement deadlines, fallback reassignment, and queue progression after a rerouted escalation
- `src/features/release-ownership-transfer-audit/types.ts` and `src/features/release-ownership-transfer-audit/*` show outgoing and incoming ownership acknowledgements, escalation replay context, and the audit trail that proves when release ownership changed hands
- `src/features/release-delegated-approval-bundles/types.ts` and `src/features/release-delegated-approval-bundles/*` show delegated approvers, expiry-window fallback, replayable audit evidence, and the publish gate that stays blocked until those bundles clear
- `src/features/release-incident-timeline-reconstruction/types.ts` and `src/features/release-incident-timeline-reconstruction/*` show conflicting witness notes, canonical timeline resolution, executive summary regeneration, and the publish gate that stays blocked until the summary is safe
- `src/hydration/HydrationHintsApp.tsx` and `src/hydration/main.tsx` demonstrate `hydrateRoot()` plus the resource hint APIs in a separate entry
- `server-samples/react-streaming-ssr/src/runAllModes.tsx` demonstrates the current stable React server/static rendering APIs in one dedicated SSR workspace
- `src/samples/UtilityMappedSample.tsx` demonstrates TypeScript utility types, `keyof`, mapped types, conditional types, and `infer` through one derived release-contract model
- `src/samples/FunctionsTuplesSample.tsx` demonstrates tuples, overloads, call signatures, construct signatures, and `this` typing through a typed command-routing playground
- `src/samples/ClassesModelsSample.tsx` demonstrates classes, access modifiers, abstract classes, `implements`, and intersection types through a plugin registry model
- `src/samples/RecursiveTypesSample.tsx` demonstrates recursive interfaces, recursive type aliases, `DeepReadonly`, and `DeepKeyPaths` through an org-tree hierarchy
- `src/samples/ActivityTransitionSample.tsx` demonstrates `<Activity>` boundaries and standalone `startTransition` through a tier-based operator console
- `src/samples/StaleClosureSample.tsx` demonstrates stale closures in setTimeout/Promise, functional updaters, and React 18+ automatic batching
- `src/samples/ContextIdentitySample.tsx` demonstrates the context provider identity perf trap and the useMemo/useCallback fix
- `src/samples/ErrorBoundarySample.tsx` demonstrates ErrorBoundary vs Suspense, lazy() failures, nested boundaries, and reset
- `src/samples/KeyIdentitySample.tsx` demonstrates key={index} reorder bug, key={id} fix, and the key reset trick
- `src/samples/RefTimingSample.tsx` demonstrates ref.current null during render, callback refs, and useImperativeHandle
- `src/samples/ConditionalDistributivitySample.tsx` demonstrates distributive vs non-distributive conditional types, Extract/Exclude, and infer
- `src/samples/MappedFilteringSample.tsx` demonstrates mapped type key remapping with `as`, value-based filtering, and template literal key transforms
- `src/samples/PrivateFieldsSample.tsx` demonstrates private vs #private fields, override keyword, parameter properties, and init order
- `src/samples/HydrationMismatchDemo.ts` is a comment-based demonstration of hydration mismatch causes, detection, and fixes
- `node-samples/ts-variance/src/index.ts` demonstrates covariance, contravariance, invariance, Array unsoundness, and explicit variance annotations
- `node-samples/ts-template-literals/src/index.ts` demonstrates template literal types, union cartesian products, infer pattern matching, and route params
- `node-samples/ts-generic-inference/src/index.ts` demonstrates generic inference failures (partial inference, NoInfer, overload order, satisfies)
- `src/test/samples.test.tsx` smoke-tests the integrated app and every implemented isolated-route sample from the catalog
- `src/test/node-samples.test.ts` type-checks implemented node-only samples through their own project configs
- `src/test/separate-entry-samples.test.ts` verifies implemented separate-entry samples publish the expected HTML and module entry files
- `src/test/react-streaming-ssr.test.ts` compiles and executes the SSR workspace so the report proves each server/static API path actually ran
- `src/test/hydration-entry.test.tsx` hydrates the pre-rendered sample shell and checks that the resource hint APIs register their DOM hints
- `src/test/setup.ts` provides the jsdom test setup and browser API shims used by Vitest
- `node-samples/ts-declarations/src/index.ts` consumes an untyped JavaScript module through authored declarations, module augmentation, and a triple-slash reference
- `node-samples/ts-declarations/vendor/legacy-release-kit.d.ts` is the authored declaration file for the node-only interop sample
- `node-samples/ts-advanced-runtime/src/index.ts` demonstrates enums, symbols, iterators, generators, TC39 decorators, mixins, and namespaces
- `node-samples/ts-jsdoc-interop/src/release-notes.js` is a JSDoc-typed JavaScript module consumed by TypeScript through `allowJs` + `checkJs`
- `node-samples/ts-jsdoc-interop/src/index.ts` imports and type-checks the JSDoc-typed JS module
- `node-samples/ts-advanced-tsconfig/src/index.ts` demonstrates advanced tsconfig options: path aliases, composite projects, declaration maps, and index-signature strictness
- `src/samples/ReactCompilerDemo.ts` is a comment-based demonstration of React Compiler setup, `"use memo"`, and `"use no memo"` directives
- `src/samples/ServerComponentsDemo.ts` is a comment-based demonstration of Server Components, Server Functions, `'use client'`, and `'use server'` directives
- `src/samples/ReactLintRulesDemo.ts` is a comment-based demonstration of `exhaustive-deps`, `rules-of-hooks`, purity enforcement, and component-only export rules
- `hydration.html` is the separate HTML shell that the hydration sample attaches to
- `server-samples/react-streaming-ssr/README.md` explains the SSR workspace and how to run it directly
- `src/components/TypeNotes.tsx` is lazy-loaded behind `Suspense`
- `docs/coverage-roadmap.md` tracks what is implemented and what still needs examples
- `docs/mini-samples.md` splits the backlog into isolated sample-sized units
## Why some React features are not covered here

All stable React client and DOM APIs are demonstrated in this project. The remaining features that require special infrastructure are covered through comment-based demonstrations (`comment-demo` surface) showing annotated sample code:

| Feature | How covered |
|---------|-------------|
| React Compiler, `"use memo"`, `"use no memo"` | Comment-based demo in `src/samples/ReactCompilerDemo.ts`. Requires the Babel/SWC plugin to run for real. |
| Server Components, Server Functions, `'use client'`, `'use server'` | Comment-based demo in `src/samples/ServerComponentsDemo.ts`. Requires a framework-aware bundler to run for real. |
| Lint rules (`exhaustive-deps`, purity, `rules-of-hooks`) | Comment-based demo in `src/samples/ReactLintRulesDemo.ts`. Requires intentionally broken code that does not fit the sample-and-test pattern. |

The following categories are intentionally excluded:

| Feature | Reason not covered |
|---------|-------------------|
| Canary APIs (`<ViewTransition>`, `addTransitionType`) | Not yet part of a stable React release. Will be added when they ship in a stable version. |
| Experimental APIs (`experimental_taintObjectReference`) | Intentionally unstable and subject to removal. Not appropriate for a learning reference. |
| Legacy APIs (`Children`, `cloneElement`, `createRef`, `forwardRef`, class components, `PureComponent`) | These are superseded by modern equivalents already shown in this project. They exist for backward compatibility and are not recommended for new code. |

## Edge cases and special behaviors

Beyond API coverage, these samples demonstrate the non-obvious gotchas and special behaviors that developers encounter in production:

### React edge cases

| Sample | Key patterns |
|--------|-------------|
| Stale closures and batching traps | `useState` in `setTimeout`/Promise loses batching; closure captures stale value; fix with functional updater or `useRef` |
| Context provider identity perf trap | Recreating value object on every render re-renders ALL consumers; fix with `useMemo` on the value |
| Error boundaries + Suspense | `lazy()` import failure isn't caught by Suspense — needs an `ErrorBoundary` wrapper; nested boundary resolution |
| Key identity and state preservation | `key={index}` reorder bug (state follows DOM position, not data); `key` reset trick to remount a component |
| Ref timing and callback refs | `ref.current` is `null` during first render; callback ref called with `null` on unmount; `useImperativeHandle` to expose methods |
| Hydration mismatch detection | Server renders one value, client renders another; React's console warning and recovery behavior (comment-based demo) |

### TypeScript edge cases

| Sample | Key patterns |
|--------|-------------|
| Conditional type distributivity | `T extends U ? A : B` distributes over unions; `[T] extends [U]` prevents it; practical filtering patterns |
| Mapped type filtering and remapping | `as` clause to filter keys by value type; `[K in keyof T & string]` to exclude symbol keys; `never` key removal |
| Variance and assignability | Covariant return types, contravariant params, invariant mutable properties; why `Array<Cat>` isn't `Array<Animal>` |
| `private` vs `#private` fields | Compile-time `private` vs runtime `#field`; `override` keyword; constructor parameter properties; init order |
| Template literal type expansion | Union cartesian product explosion; `infer` inside template literals; performance limits with large unions |
| Generic inference failures | Partial inference impossible; overload+generic resolution order; bidirectional contextual typing |

## Notes

The request asked to “show all React and TypeScript usage”. A single project cannot literally cover every API and every type-system feature without turning into a reference manual. This app focuses on the most useful modern patterns you are likely to apply in real work while keeping the code readable and runnable.
