# Repo Map

This file is the guided repository map for the lab.

`src/sampleCatalog.ts` remains the canonical feature inventory. Use this document when you want to understand where different kinds of code live and which files are the best entry points.

## Top-level structure

- `src/`: the integrated app, isolated samples, and product-style feature slices
- `src/test/`: Vitest coverage for integrated routes, separate entries, node-only workspaces, and SSR artifacts
- `node-samples/`: TypeScript-only and source-boundary workspaces that do not need the SPA runtime
- `server-samples/`: dedicated server/static rendering workspaces
- `public/`: static assets used by separate-entry or preview flows
- `docs/`: reading guides, coverage summaries, and interview-prep material

## Main app landmarks

- `src/App.tsx`: integrated React 19 showcase entry
- `src/catalog.ts`: shared sample data and domain types for the integrated app
- `src/releaseStore.ts`: `useSyncExternalStore` example backing store
- `src/sampleCatalog.ts`: canonical sample and feature inventory
- `src/implementedSampleArtifacts.ts`: registry for implemented artifacts that live outside the main SPA route surface
- `src/sampleImplementations.ts`: shared implementation registry used by the app and tests
- `src/sampleRuntime.ts`: resolves sample routes and runtime lookups

## Components and route staging

- `src/components/CommandPalette.tsx`: sample discovery and navigation
- `src/components/FeatureGrid.tsx`: generic grid rendering for the integrated app
- `src/components/MiniSampleBoard.tsx`: sample backlog and status view
- `src/components/MiniSampleStage.tsx`: active sample renderer
- `src/components/TypeNotes.tsx`: lazily loaded explanatory notes behind `Suspense`

## Focused samples

Use `src/samples/*` for isolated React and TypeScript demos.

Representative React-focused entries:

- `src/samples/ContextThemeSample.tsx`
- `src/samples/ReducerBoardSample.tsx`
- `src/samples/FormStatusSample.tsx`
- `src/samples/MemoLabSample.tsx`
- `src/samples/LayoutEffectsSample.tsx`
- `src/samples/UseResourceSample.tsx`
- `src/samples/PortalModalSample.tsx`
- `src/samples/ActivityTransitionSample.tsx`
- `src/samples/StaleClosureSample.tsx`
- `src/samples/ErrorBoundarySample.tsx`
- `src/samples/KeyIdentitySample.tsx`
- `src/samples/RefTimingSample.tsx`

Representative accessibility and async-behavior entries:

- `src/samples/AccessibleDialogSample.tsx`
- `src/samples/AccessibleListboxSample.tsx`
- `src/samples/AccessibleFormErrorsSample.tsx`
- `src/samples/AsyncUiVerificationSample.tsx`
- `src/samples/DebouncedSearchRaceSample.tsx`

Representative TypeScript-focused entries:

- `src/samples/UtilityMappedSample.tsx`
- `src/samples/FunctionsTuplesSample.tsx`
- `src/samples/ClassesModelsSample.tsx`
- `src/samples/RecursiveTypesSample.tsx`
- `src/samples/ConditionalDistributivitySample.tsx`
- `src/samples/MappedFilteringSample.tsx`
- `src/samples/PrivateFieldsSample.tsx`

Comment-demo entries that remain explanatory by design:

- `src/samples/HydrationMismatchDemo.ts`
- `src/samples/ReactCompilerDemo.ts`
- `src/samples/ServerComponentsDemo.ts`
- `src/samples/ReactLintRulesDemo.ts`

## Product-style feature slices

Use `src/features/*` for the larger React workflow examples. Most follow the same shape:

- `types.ts`
- `client.ts`
- `useFeature.ts`
- `FeaturePanel.tsx`
- `FeaturePanel.test.tsx`

Early foundational slices:

- `src/features/release-readiness/*`
- `src/features/release-approval-workflow/*`
- `src/features/release-rollout-optimistic/*`
- `src/features/release-launch-checklist/*`
- `src/features/release-handoff-conflict/*`

Polling, reconciliation, and collaboration slices:

- `src/features/release-rollout-reconciliation/*`
- `src/features/release-incident-collaboration/*`
- `src/features/release-review-threads/*`
- `src/features/release-field-merge/*`
- `src/features/release-change-history/*`
- `src/features/release-branch-compare/*`
- `src/features/release-scheduled-publish/*`

Operational rollout and recovery slices:

- `src/features/release-launch-orchestration/*`
- `src/features/release-rollout-pause-resume/*`
- `src/features/release-multi-region-rollback/*`
- `src/features/release-communication-handoff/*`
- `src/features/release-escalation-routing/*`
- `src/features/release-ownership-transfer-audit/*`

Governance, evidence, and post-incident slices:

- `src/features/release-delegated-approval-bundles/*`
- `src/features/release-incident-timeline-reconstruction/*`
- `src/features/release-rollback-decision-matrix/*`
- `src/features/release-incident-faq-curation/*`
- `src/features/release-incident-comms-approval-packs/*`
- `src/features/release-post-rollback-segmentation/*`
- `src/features/release-follow-up-commitments/*`
- `src/features/release-remediation-evidence-bundles/*`
- `src/features/release-customer-promise-reconciliation/*`
- `src/features/release-rollback-waiver-ledgers/*`
- `src/features/release-recovery-credit-ledgers/*`
- `src/features/release-relaunch-exception-registers/*`
- `src/features/release-remediation-readiness-registries/*`
- `src/features/release-exit-readiness-ledgers/*`
- `src/features/release-stability-attestation-ledgers/*`
- `src/features/release-resumption-attestation-registers/*`

## Separate-entry samples

Use these when a topic needs its own HTML shell or hydration path.

- `hydration.html`
- `hydration-mismatch.html`
- `src/hydration/*`

## Node-only and server workspaces

Use `node-samples/*` when the topic is better validated outside the SPA runtime.

TypeScript language and interop workspaces:

- `node-samples/ts-advanced-runtime/*`
- `node-samples/ts-advanced-tsconfig/*`
- `node-samples/ts-declarations/*`
- `node-samples/ts-generic-inference/*`
- `node-samples/ts-jsdoc-interop/*`
- `node-samples/ts-template-literals/*`
- `node-samples/ts-variance/*`

React-adjacent source-boundary workspaces:

- `node-samples/react-compiler/*`
- `node-samples/react-lint-rules/*`
- `node-samples/react-server-components/*`

Server/static rendering workspace:

- `server-samples/react-streaming-ssr/*`

## Tests and verification entry points

- `src/test/samples.test.tsx`: smoke coverage for integrated and isolated-route samples
- `src/test/node-samples.test.ts`: type-check coverage for node-only workspaces
- `src/test/separate-entry-samples.test.ts`: artifact checks for separate-entry samples
- `src/test/react-streaming-ssr.test.ts`: compile-and-run verification for the SSR workspace
- `src/test/hydration-entry.test.tsx`: hydration entry verification
- `src/test/setup.ts`: shared jsdom setup and browser shims

## Docs worth reading next

- `docs/reading-index.md`: repo-first reading order
- `docs/coverage-roadmap.md`: coverage summary and execution-surface guidance
- `docs/feature-matrix.md`: catalog-backed matrix of implemented samples by topic and surface
- `docs/interview-prep.md`: interview-prep entry point
- `docs/interview-sample-roadmap.md`: interview sample status summary
- `docs/mini-samples.md`: implementation backlog framing