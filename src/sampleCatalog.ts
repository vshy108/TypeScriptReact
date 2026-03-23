export type SampleTopic =
  | "Current Lab"
  | "React Client"
  | "React DOM"
  | "React Server"
  | "TypeScript Language"
  | "TypeScript Interop";

export type SampleStatus = "implemented" | "planned" | "deferred";
export type SampleSurface =
  | "current-app"
  | "isolated-route"
  | "separate-entry"
  | "node-only"
  | "comment-demo";

// surface is the execution contract for a sample, not just a display label:
// current-app renders inside App.tsx, isolated-route renders through MiniSampleStage,
// separate-entry has its own HTML/runtime entry, node-only is verified through tsc in a Node context,
// and comment-demo documents concepts that are real but not runnable in this workspace.

export type MiniSampleId = `sample-${string}`;

export interface MiniSample {
  readonly id: MiniSampleId;
  readonly title: string;
  readonly topic: SampleTopic;
  readonly status: SampleStatus;
  readonly surface: SampleSurface;
  readonly apis: readonly string[];
  readonly summary: string;
  readonly whyIsolated: string;
}

export const sampleTopics = [
  "Current Lab",
  "React Client",
  "React DOM",
  "React Server",
  "TypeScript Language",
  "TypeScript Interop",
] as const satisfies readonly SampleTopic[];

// This registry is the source of truth for the backlog once work is split into mini-samples.
// The UI reads it to populate the sample board and command palette, the test suite reads it
// to verify that every "implemented" entry has a matching component or artifact, and the
// routing module reads it to resolve hash slugs back to catalog ids.
// Keeping all of that metadata in one catalog prevents the common drift where navigation,
// documentation, and tests silently describe different sets of samples.
export const miniSampleCatalog = [
  {
    id: "sample-core-lab",
    title: "Integrated React 19 + TypeScript core lab",
    topic: "Current Lab",
    status: "implemented",
    surface: "current-app",
    apis: [
      "useActionState",
      "useOptimistic",
      "useDeferredValue",
      "useTransition",
      "useEffectEvent",
      "useSyncExternalStore",
      "lazy",
      "Suspense",
    ],
    summary:
      "The current app demonstrates the modern client-side APIs that fit cleanly into one cohesive example.",
    whyIsolated:
      "This stays integrated because the hooks reinforce each other in one shared user flow.",
  },
  {
    id: "sample-react-context-theme",
    title: "Context and provider composition",
    topic: "React Client",
    status: "implemented",
    surface: "isolated-route",
    apis: ["createContext", "useContext", "Fragment"],
    summary:
      "Build a focused theme or feature-flag sample to show provider setup and consumer reads.",
    whyIsolated:
      "Context changes app-wide behavior and becomes noisy if it is mixed into every other demo.",
  },
  {
    id: "sample-react-reducer-board",
    title: "Reducer-driven task board",
    topic: "React Client",
    status: "implemented",
    surface: "isolated-route",
    apis: ["useReducer"],
    summary:
      "Model state transitions explicitly with actions and reducer logic.",
    whyIsolated:
      "Reducers deserve their own domain model instead of being bolted onto the optimistic form sample.",
  },
  {
    id: "sample-react-memo-lab",
    title: "Memoization and render-control lab",
    topic: "React Client",
    status: "implemented",
    surface: "isolated-route",
    apis: ["memo", "useMemo", "useCallback", "Profiler", "useDebugValue"],
    summary:
      "Show which renders are avoided, when memoization helps, and where it adds useless complexity.",
    whyIsolated:
      "Performance demos are easiest to understand when render causes are visible in isolation.",
  },
  {
    id: "sample-react-layout-effects",
    title: "Measured layout and synchronous effects",
    topic: "React Client",
    status: "implemented",
    surface: "isolated-route",
    apis: ["useLayoutEffect", "useInsertionEffect"],
    summary:
      "Measure DOM layout, coordinate style injection, and contrast behavior with regular effects.",
    whyIsolated:
      "Layout timing samples depend on precise DOM sequencing and should not compete with other demos.",
  },
  {
    id: "sample-react-use-resource",
    title: "Resource loading with use()",
    topic: "React Client",
    status: "implemented",
    surface: "isolated-route",
    apis: ["use"],
    summary:
      "Demonstrate resource consumption and Suspense-driven loading around async data.",
    whyIsolated:
      "The mental model is different from ordinary hooks and deserves a dedicated async boundary.",
  },
  {
    id: "sample-react-portal-modal",
    title: "Portal-based modal and toast system",
    topic: "React DOM",
    status: "implemented",
    surface: "isolated-route",
    apis: ["createPortal", "flushSync"],
    summary:
      "Render UI outside the normal tree and compare normal updates versus forced synchronous ones.",
    whyIsolated:
      "Portals are best explained with a dedicated host layer instead of a crowded demo page.",
  },
  {
    id: "sample-react-form-status",
    title: "Nested submit button state",
    topic: "React DOM",
    status: "implemented",
    surface: "isolated-route",
    apis: ["useFormStatus"],
    summary:
      "Show form-scoped pending state without threading props down from the form shell.",
    whyIsolated:
      "It is easier to learn when the button and form status relationship is the whole example.",
  },
  {
    id: "sample-react-accessible-dialog",
    title: "Accessible dialog and focus management",
    topic: "React DOM",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      'role="dialog"',
      "aria-modal",
      "aria-labelledby",
      "focus trap",
      "focus return",
      "Escape key",
    ],
    summary:
      "Practice the accessibility behavior interviewers often expect: labeled dialog semantics, keyboard dismissal, trapped focus, and focus return.",
    whyIsolated:
      "Accessibility behavior is easiest to verify in a focused sample where keyboard flow and focus movement are the main subject.",
  },
  {
    id: "sample-react-hydration-hints",
    title: "Hydration and resource hint APIs",
    topic: "React DOM",
    status: "implemented",
    surface: "separate-entry",
    apis: [
      "hydrateRoot",
      "preconnect",
      "prefetchDNS",
      "preinit",
      "preinitModule",
      "preload",
      "preloadModule",
    ],
    summary:
      "Hydrate server markup and coordinate network and asset hints around that entry point.",
    whyIsolated:
      "Hydration requires a separate HTML and server-rendered shell, so it should not share the SPA entry.",
  },
  {
    id: "sample-react-activity-transition",
    title: "Activity boundaries and standalone startTransition",
    topic: "React Client",
    status: "implemented",
    surface: "isolated-route",
    apis: ["Activity", "startTransition"],
    summary:
      "Control which subtrees are visible or hidden with Activity while deferring low-priority updates through the standalone startTransition API.",
    whyIsolated:
      "Activity boundaries affect rendering visibility and are easiest to understand in a dedicated operator console scenario.",
  },
  {
    id: "sample-react-debounced-search-race",
    title: "Debounced search and request races",
    topic: "React Client",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "debouncing",
      "useEffect cleanup",
      "AbortController",
      "request cancellation",
      "stale response overwrite",
    ],
    summary:
      "Show that debounce reduces request volume but does not solve stale-response races unless older requests are cancelled or ignored.",
    whyIsolated:
      "Async race-condition demos need tightly controlled timing so the bug and the fix remain visible side by side.",
  },
  {
    id: "sample-react-release-readiness-feature",
    title: "Release readiness feature slice",
    topic: "React Client",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "typed API client",
      "custom hook",
      "AbortController",
      "derived view state",
      "integration tests",
    ],
    summary:
      "Model a small product-facing feature with typed data, a client layer, a custom hook, and a rendering component that can be tested end to end.",
    whyIsolated:
      "A feature slice is easiest to discuss when the architecture is visible in one focused route instead of being mixed into unrelated demos.",
  },
  {
    id: "sample-react-release-approval-workflow",
    title: "Release approval mutation workflow",
    topic: "React Client",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "typed mutation client",
      "custom hook draft state",
      "server-style validation",
      "persisted mutation result",
      "integration tests",
    ],
    summary:
      "Show a real mutation flow: edit a typed approval draft, submit it through a client mutation, handle validation errors, and render the updated persisted state.",
    whyIsolated:
      "Mutation-heavy feature slices are easiest to reason about when draft state, save state, and persisted state are visible together in one route.",
  },
  {
    id: "sample-react-release-rollout-optimistic",
    title: "Release rollout optimistic updates",
    topic: "React Client",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "optimistic UI",
      "rollback on failure",
      "typed mutation client",
      "custom hook optimistic state",
      "integration tests",
    ],
    summary:
      "Show optimistic mutation handling where blockers disappear immediately, then either stay resolved on success or roll back when validation rejects the save.",
    whyIsolated:
      "Optimistic updates are easiest to learn when the speculative UI and rollback are visible without unrelated state on the page.",
  },
  {
    id: "sample-react-release-launch-checklist",
    title: "Release launch multi-step workflow",
    topic: "React Client",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "multi-step mutation",
      "dependent follow-up actions",
      "typed mutation client",
      "step sequencing",
      "integration tests",
    ],
    summary:
      "Show a dependent multi-step workflow where saving one launch action unlocks the next, with server-side sequencing and validation rules.",
    whyIsolated:
      "Multi-step mutations are easier to reason about when progress, validation, and unlocked follow-up actions are all visible in one place.",
  },
  {
    id: "sample-react-release-handoff-conflict",
    title: "Release handoff conflict resolution",
    topic: "React Client",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "background refetching",
      "conflict detection",
      "polling",
      "expected revision",
      "reload latest server version",
    ],
    summary:
      "Combine mutation saves with background refetching so the UI can detect when the server version changed underneath a local draft.",
    whyIsolated:
      "Conflict-resolution flows are easiest to discuss when the local draft, polled server copy, and recovery actions are all visible together.",
  },
  {
    id: "sample-react-release-rollout-reconciliation",
    title: "Release rollout reconciliation",
    topic: "React Client",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "optimistic UI",
      "background refetching",
      "server reconciliation",
      "polling",
      "authoritative server state",
    ],
    summary:
      "Show optimistic client state that is later corrected by background refetch when the server settles on a different rollout result.",
    whyIsolated:
      "Reconciliation behavior is easiest to reason about when the optimistic view and the authoritative server correction are visible side by side.",
  },
  {
    id: "sample-react-release-incident-collaboration",
    title: "Release incident collaborative editing",
    topic: "React Client",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "multi-actor presence",
      "shared draft state",
      "conflict-aware save",
      "polling",
      "collaborative editing",
    ],
    summary:
      "Show a shared incident draft with collaborator presence, teammate edits, and conflict-aware saves when another editor changes the server version first.",
    whyIsolated:
      "Collaborative editing is easiest to discuss when presence, local draft state, and conflict recovery all stay visible in one focused route.",
  },
  {
    id: "sample-react-release-review-threads",
    title: "Release review threads and approvals",
    topic: "React Client",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "comment threads",
      "approval workflow",
      "blocked publish",
      "shared draft review",
      "reviewer feedback",
    ],
    summary:
      "Show a shared release message that collects blocking review threads and approvals before publication can proceed.",
    whyIsolated:
      "Review workflows are easiest to explain when the draft, blocking comments, and approval state are visible together in one route.",
  },
  {
    id: "sample-react-release-field-merge",
    title: "Release field-level merge resolution",
    topic: "React Client",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "field-level merge",
      "side-by-side conflict resolution",
      "automatic non-conflicting merge",
      "overlapping edits",
      "rebased save",
    ],
    summary:
      "Show how untouched fields can merge automatically while overlapping fields stay blocked until the user resolves them one by one.",
    whyIsolated:
      "Field-level conflict resolution is easiest to explain when the base, local, and server values are visible side by side in one route.",
  },
  {
    id: "sample-react-release-change-history",
    title: "Release audit history and undo",
    topic: "React Client",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "audit history",
      "change attribution",
      "undo latest change",
      "revision snapshots",
      "shared draft history",
    ],
    summary:
      "Show a shared release update that records attributed snapshots on every change and lets the user undo the most recent revision.",
    whyIsolated:
      "Audit and undo flows are easiest to discuss when the current draft and the recent history entries are visible together in one route.",
  },
  {
    id: "sample-react-release-branch-compare",
    title: "Release branch compare view",
    topic: "React Client",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "branching drafts",
      "compare view",
      "branch promotion",
      "alternate messaging",
      "revision selection",
    ],
    summary:
      "Show a primary release draft alongside alternate branches so you can compare wording and promote the stronger branch.",
    whyIsolated:
      "Branch compare workflows are easiest to explain when the current primary draft and the alternate wording stay visible side by side in one route.",
  },
  {
    id: "sample-react-release-scheduled-publish",
    title: "Release scheduled publish state",
    topic: "React Client",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "approval gate",
      "publish countdown",
      "scheduled state",
      "rollback window",
      "live timer UI",
    ],
    summary:
      "Show a release that waits for approvals, then counts down to publication and exposes a short rollback window immediately afterward.",
    whyIsolated:
      "Scheduled publish flows are easiest to explain when the gate conditions, countdown, and rollback state are all visible in one route.",
  },
  {
    id: "sample-react-release-launch-orchestration",
    title: "Release launch orchestration",
    topic: "React Client",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "progressive checkpoints",
      "traffic promotion",
      "guardrail monitors",
      "automatic abort",
      "timer-driven orchestration",
    ],
    summary:
      "Show a launch that advances through canary, regional, and global checkpoints while live guardrails can automatically abort the rollout.",
    whyIsolated:
      "Launch orchestration is easiest to explain when checkpoint state, live guardrails, and the abort outcome stay visible in one route.",
  },
  {
    id: "sample-react-streaming-ssr",
    title: "Streaming SSR and prerender flows",
    topic: "React Server",
    status: "implemented",
    surface: "separate-entry",
    apis: [
      "renderToPipeableStream",
      "renderToReadableStream",
      "renderToString",
      "renderToStaticMarkup",
      "resumeToPipeableStream",
      "prerender",
      "prerenderToNodeStream",
      "resume",
      "resumeAndPrerender",
      "resumeAndPrerenderToNodeStream",
    ],
    summary:
      "Compare Node and web-stream server rendering strategies and where resume/prerender APIs fit.",
    whyIsolated:
      "These APIs need a server runtime and should be built as a separate SSR workspace, not a client sample.",
  },
  {
    id: "sample-react-server-components",
    title: "Server Components and Server Functions",
    topic: "React Server",
    status: "implemented",
    surface: "comment-demo",
    apis: [
      "Server Components",
      "Server Functions",
      "'use client'",
      "'use server'",
    ],
    summary:
      "Comment-based demonstration of server/client boundaries and file-level directives. Requires a framework-aware bundler to run for real.",
    whyIsolated:
      "These patterns are environment-specific and are demonstrated through annotated code comments instead of runnable samples.",
  },
  {
    id: "sample-react-compiler",
    title: "React Compiler and directives",
    topic: "React Server",
    status: "implemented",
    surface: "comment-demo",
    apis: ["React Compiler", '"use memo"', '"use no memo"'],
    summary:
      "Comment-based demonstration of compiler setup, generated behavior, and directive-controlled optimization. Requires the Babel/SWC plugin to run for real.",
    whyIsolated:
      "Compiler configuration affects the whole build and is demonstrated through annotated code comments instead of runnable samples.",
  },
  {
    id: "sample-ts-recursive-types",
    title: "Recursive types and tree-shaped data",
    topic: "TypeScript Language",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "recursive types",
      "DeepReadonly",
      "DeepKeyPaths",
      "recursive interfaces",
      "recursive type aliases",
    ],
    summary:
      "Model tree-shaped data with self-referencing interfaces and type aliases, then derive compile-time utilities like DeepReadonly and DeepKeyPaths.",
    whyIsolated:
      "Recursive types need a clear tree structure to demonstrate, which gets lost in a flat sample.",
  },
  {
    id: "sample-ts-utility-mapped",
    title: "Utility, mapped, and conditional types",
    topic: "TypeScript Language",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "Partial",
      "Pick",
      "Record",
      "ReturnType",
      "keyof",
      "conditional types",
      "mapped types",
      "infer",
    ],
    summary:
      "Turn the domain model into a type-transformation playground with visible before and after shapes.",
    whyIsolated:
      "Type manipulation examples are clearer when the runtime UI is tiny and the types are the main subject.",
  },
  {
    id: "sample-ts-functions-tuples",
    title: "Function typing, overloads, and tuples",
    topic: "TypeScript Language",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "tuples",
      "function overloads",
      "call signatures",
      "construct signatures",
      "this typing",
    ],
    summary:
      "Show how APIs can expose multiple call forms while preserving type safety.",
    whyIsolated:
      "Function-shape examples are easier to reason about when the demo is a focused API surface.",
  },
  {
    id: "sample-ts-classes-models",
    title: "Classes and object-oriented modeling",
    topic: "TypeScript Language",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "classes",
      "access modifiers",
      "abstract classes",
      "implements",
      "intersection types",
    ],
    summary:
      "Model a small plugin or domain system with classes and interfaces.",
    whyIsolated:
      "Classes bring a different style than the functional React code, so they should not be mixed into app state.",
  },
  {
    id: "sample-ts-declarations",
    title: "Declaration files and package typing",
    topic: "TypeScript Interop",
    status: "implemented",
    surface: "node-only",
    apis: [
      ".d.ts authoring",
      "declaration merging",
      "module augmentation",
      "triple-slash directives",
    ],
    summary:
      "Author types for an untyped module and consume them from a separate sample.",
    whyIsolated:
      "Declaration authoring is library-facing work and is cleaner in a node-only package-style example.",
  },
  {
    id: "sample-ts-jsdoc-interop",
    title: "JSDoc and JS project typing",
    topic: "TypeScript Interop",
    status: "implemented",
    surface: "node-only",
    apis: ["JSDoc-powered typing", "allowJs", "checkJs"],
    summary:
      "Show how TypeScript can type-check JavaScript without a full rewrite.",
    whyIsolated:
      "JS interop has separate compiler settings and should live away from the TS-first app code.",
  },
  {
    id: "sample-ts-advanced-runtime-types",
    title: "Enums, symbols, iterators, mixins, and decorators",
    topic: "TypeScript Interop",
    status: "implemented",
    surface: "node-only",
    apis: [
      "enums",
      "symbols",
      "iterators",
      "mixins",
      "decorators",
      "namespaces",
    ],
    summary:
      "Explore the lesser-used corners of the language and compare which ones still make sense in modern TS.",
    whyIsolated:
      "These topics are niche and should not dilute the main learning path before the core language samples exist.",
  },
  {
    id: "sample-react-lint-rules-demo",
    title: "React ESLint rules and purity enforcement",
    topic: "React Client",
    status: "implemented",
    surface: "comment-demo",
    apis: [
      "exhaustive-deps",
      "rules-of-hooks",
      "react-compiler purity",
      "react-refresh/only-export-components",
    ],
    summary:
      "Comment-based demonstration of the key React lint rules: exhaustive-deps, purity enforcement, rules-of-hooks, and component-only exports.",
    whyIsolated:
      "Lint rule demos require intentionally broken code and are shown through annotated code comments instead of runnable samples.",
  },
  {
    id: "sample-ts-advanced-tsconfig",
    title: "Advanced tsconfig options beyond strict",
    topic: "TypeScript Interop",
    status: "implemented",
    surface: "node-only",
    apis: [
      "resolveJsonModule",
      "paths",
      "baseUrl",
      "composite",
      "declarationMap",
      "importHelpers",
      "noPropertyAccessFromIndexSignature",
    ],
    summary:
      "Explore tsconfig options beyond the strict baseline: path aliases, composite projects, declaration maps, and index-signature strictness.",
    whyIsolated:
      "Advanced tsconfig options require a dedicated project config and do not affect the main app build.",
  },
  {
    id: "sample-react-stale-closure",
    title: "Stale closures and batching traps",
    topic: "React Client",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "useState stale closure",
      "functional updater",
      "useRef latest value",
      "React 18 batching",
      "setTimeout batching",
      "Promise batching",
    ],
    summary:
      "Demonstrate the most common React gotchas: stale closures in setTimeout/setInterval/Promise callbacks, and React 18+ automatic batching across all contexts.",
    whyIsolated:
      "Edge-case demos need isolated state to show the bug and the fix side-by-side without interfering with other samples.",
  },
  {
    id: "sample-react-context-identity",
    title: "Context provider identity perf trap",
    topic: "React Client",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "useContext identity trap",
      "useMemo provider value",
      "useCallback stable reference",
      "memo consumer skip",
    ],
    summary:
      "Show how recreating the context value object on every render forces all consumers to re-render, and how useMemo + useCallback fix the identity problem.",
    whyIsolated:
      "The buggy and fixed providers need side-by-side comparison with visible render counts that would be noisy in a shared context demo.",
  },
  {
    id: "sample-react-error-boundary",
    title: "Error boundaries and Suspense interaction",
    topic: "React Client",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "ErrorBoundary class",
      "getDerivedStateFromError",
      "componentDidCatch",
      "Suspense vs errors",
      "lazy() failure",
      "nested boundaries",
    ],
    summary:
      "Show that Suspense handles loading but NOT errors. Demonstrate render-time throws, failed lazy() imports, nested error boundaries, and the reset/retry pattern.",
    whyIsolated:
      "Error boundary demos intentionally crash components and need isolation so failures don't take down the whole app.",
  },
  {
    id: "sample-react-key-identity",
    title: "Key identity and state preservation",
    topic: "React Client",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "key={index} reorder bug",
      "key={id} stable identity",
      "key reset trick",
      "state follows DOM position",
    ],
    summary:
      "Show how key={index} causes state to stick to the wrong item on reorder, and how changing a component's key forces a full remount to reset local state.",
    whyIsolated:
      "Key identity bugs need a reorderable list with visible per-row state to demonstrate the problem clearly.",
  },
  {
    id: "sample-react-ref-timing",
    title: "Ref timing and callback refs",
    topic: "React Client",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "ref null during render",
      "callback refs",
      "useImperativeHandle",
      "forwardRef",
      "ref mount/unmount lifecycle",
    ],
    summary:
      "Show that ref.current is null during render, callback refs fire on mount (node) and unmount (null), and useImperativeHandle exposes a custom method API through a ref.",
    whyIsolated:
      "Ref timing demos need mount/unmount controls and imperative method calls that would be noisy in other samples.",
  },
  {
    id: "sample-react-hydration-mismatch",
    title: "Hydration mismatch detection",
    topic: "React DOM",
    status: "implemented",
    surface: "comment-demo",
    apis: [
      "hydration mismatch",
      "suppressHydrationWarning",
      "useId deterministic",
      "useSyncExternalStore getServerSnapshot",
      "streaming SSR recovery",
    ],
    summary:
      "Explain what causes hydration mismatches (Date.now, window APIs, locale), how React 19 detects and reports them with diff views, and fixes: useEffect, useSyncExternalStore, suppressHydrationWarning, useId.",
    whyIsolated:
      "Hydration mismatches require a real SSR setup to reproduce. This comment-based demo explains the edge cases and fixes with type-checked code snippets.",
  },
  {
    id: "sample-ts-conditional-distributivity",
    title: "Conditional type distributivity",
    topic: "TypeScript Language",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "distributive conditional types",
      "non-distributive [T] extends [U]",
      "never empty union",
      "Extract",
      "Exclude",
      "infer",
    ],
    summary:
      "Show how T extends U ? A : B distributes over unions, how [T] extends [U] prevents it, the never-as-empty-union gotcha, and practical filtering with Extract/Exclude and infer.",
    whyIsolated:
      "Type-level edge cases need side-by-side examples with explanations that would clutter a shared demo.",
  },
  {
    id: "sample-ts-mapped-filtering",
    title: "Mapped type filtering and remapping",
    topic: "TypeScript Language",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "as clause key remapping",
      "never key removal",
      "PickByType value filtering",
      "template literal key transform",
      "keyof T & string",
      "-readonly modifier",
    ],
    summary:
      "Demonstrate mapped type key remapping with `as`, value-based filtering via never, template literal key transforms, symbol key exclusion, and readonly/mutable modifiers.",
    whyIsolated:
      "Type-level mapped type demos need structured examples with explanations that would clutter other samples.",
  },
  {
    id: "sample-ts-variance",
    title: "Variance and assignability",
    topic: "TypeScript Language",
    status: "implemented",
    surface: "node-only",
    apis: [
      "covariance out",
      "contravariance in",
      "invariance in out",
      "Array unsoundness",
      "strictFunctionTypes",
      "variance annotations TS 4.7",
    ],
    summary:
      "Show covariant return types, contravariant params, invariant mutable properties, the Array<Cat>/Array<Animal> unsoundness, and explicit in/out/in out variance annotations.",
    whyIsolated:
      "Variance demos use class hierarchies and console output that don't render as React components.",
  },
  {
    id: "sample-ts-private-fields",
    title: "private vs #private fields",
    topic: "TypeScript Language",
    status: "implemented",
    surface: "isolated-route",
    apis: [
      "private keyword (compile-time)",
      "#private fields (runtime)",
      "override keyword",
      "constructor parameter properties",
      "field initialization order",
    ],
    summary:
      "Compare TS compile-time private vs JS #private runtime encapsulation, demonstrate override safety, parameter properties shorthand, and field initialization order gotchas.",
    whyIsolated:
      "Class feature demos need runtime execution and output display that's best shown in isolation.",
  },
  {
    id: "sample-ts-template-literals",
    title: "Template literal type expansion",
    topic: "TypeScript Language",
    status: "implemented",
    surface: "node-only",
    apis: [
      "template literal types",
      "union cartesian product",
      "Uppercase Lowercase Capitalize",
      "infer in template literals",
      "route parameter extraction",
      "performance limits",
    ],
    summary:
      "Demonstrate template literal types with union cartesian products, intrinsic string manipulation, pattern matching with infer, type-safe route params, and performance limits.",
    whyIsolated:
      "Template literal type demos are purely type-level with console output, not React-renderable.",
  },
  {
    id: "sample-ts-generic-inference",
    title: "Generic inference failures",
    topic: "TypeScript Language",
    status: "implemented",
    surface: "node-only",
    apis: [
      "partial inference currying",
      "NoInfer<T>",
      "overload resolution order",
      "bidirectional contextual typing",
      "generic defaults",
      "satisfies operator",
    ],
    summary:
      "Show when generic inference fails (partial inference, inference conflicts, overload order) and standard workarounds (currying, NoInfer, explicit params, satisfies).",
    whyIsolated:
      "Inference failure demos are purely type-level with console output, not React-renderable.",
  },
] as const satisfies readonly MiniSample[];

export const sampleStatusMeta = {
  implemented: { label: "Implemented", tone: "implemented" },
  planned: { label: "Planned", tone: "planned" },
  deferred: { label: "Deferred", tone: "deferred" },
} as const;

export const sampleSurfaceLabels = {
  "current-app": "Current app",
  "isolated-route": "Standalone route",
  "separate-entry": "Separate entry point",
  "node-only": "Node-only sample",
  "comment-demo": "Comment-based demo",
} as const;
