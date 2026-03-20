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
  | "node-only";

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
    status: "deferred",
    surface: "separate-entry",
    apis: [
      "Server Components",
      "Server Functions",
      "'use client'",
      "'use server'",
    ],
    summary:
      "Demonstrate server/client boundaries and file-level directives in a framework-aware environment.",
    whyIsolated:
      "These patterns are environment-specific and should not be faked inside a plain Vite client app.",
  },
  {
    id: "sample-react-compiler",
    title: "React Compiler and directives",
    topic: "React Server",
    status: "deferred",
    surface: "separate-entry",
    apis: ["React Compiler", '"use memo"', '"use no memo"'],
    summary:
      "Show compiler setup, generated behavior, and when directives change optimization decisions.",
    whyIsolated:
      "Compiler configuration affects the whole build and should be tested in a contained workspace.",
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
} as const;
