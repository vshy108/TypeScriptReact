# React 19 + TypeScript 6.0 Lab

This project is a modern React starter that goes beyond the default template. It uses the current scaffolded stack in this workspace:

- React `19.2.4`
- React DOM `19.2.4`
- TypeScript `6.0.2`
- Vite `8.0.0`

## What this repo is for

This repository now acts as a practical React and TypeScript lab rather than just a starter app.

It combines four execution surfaces:

- the integrated app for the core React 19 client examples
- isolated routes for focused React and product-style workflows
- separate HTML entries for hydration-specific behavior
- node-only workspaces for TypeScript-only, compiler-boundary, lint, and server-boundary examples

## What the repo demonstrates

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

## Start here

- `docs/reading-index.md` is the fastest repo-first reading path through the annotated code
- `docs/coverage-roadmap.md` explains what is covered and which execution surface each topic uses
- `docs/feature-matrix.md` is the catalog-backed feature matrix grouped by topic and execution surface
- `src/sampleCatalog.ts` is the canonical feature and sample inventory
- `docs/interview-prep.md` is the interview-practice entry point

## Deeper docs

- `docs/react-typescript-terms.md` is the landing page for the React and TypeScript term guides
- `docs/interview-walkthroughs.md` is the product-scenario answer guide for practicing structured interview responses from real repo examples
- `docs/debugging-walkthroughs.md` is the debugging-answer drill guide for explaining root-cause investigation from concrete repo failures
- `docs/system-design-walkthroughs.md` is the architecture-scenario drill guide for practicing frontend system design answers from real repo boundaries
- `docs/interview-practice-index.md` is the quick practice-session index for turning the interview guides into repeatable mock rounds
- `docs/interview-answer-rubric.md` is the scoring rubric for checking whether practice answers are concrete, correct, and defensible
- `docs/interview-answer-antipatterns.md` is the weak-answer repair guide for turning generic responses into concrete repo-backed answers

## Coverage surfaces

- `current-app`: integrated into the main React lab UI
- `isolated-route`: focused app-routed samples and feature slices
- `separate-entry`: standalone HTML/runtime entries such as hydration scenarios
- `node-only`: TypeScript or source-boundary workspaces verified outside the SPA
- `comment-demo`: explanatory files for framework-aware or toolchain-dependent behavior that is documented rather than fully executed here

## Repo map

`src/sampleCatalog.ts` is still the canonical inventory. For a fuller guided structure overview, see `docs/repo-map.md`.

Quick landmarks:

- `src/App.tsx` is the integrated React 19 lab entry
- `src/samples/*` contains focused React and TypeScript demonstrations
- `src/features/*` contains the larger product-style feature slices
- `src/test/*` contains the Vitest coverage for integrated samples, separate entries, and workspaces
- `node-samples/*` contains TypeScript-only and source-boundary workspaces
- `server-samples/react-streaming-ssr/*` contains the dedicated SSR workspace
- `docs/coverage-roadmap.md` explains coverage and execution surfaces
- `docs/feature-matrix.md` gives the catalog-backed topic and surface matrix
- `docs/repo-map.md` is the detailed repository navigation guide

## Why some React features are not covered here

All stable React client and DOM APIs are demonstrated in this project.

The React Compiler sample is now partially covered through a runnable node-only workspace in `node-samples/react-compiler/`, which verifies directives and infer-mode naming boundaries while leaving transformed output documented in `src/samples/ReactCompilerDemo.ts`.

The Server Components sample is now partially covered through a runnable node-only workspace in `node-samples/react-server-components/`, which verifies source-level boundaries while leaving framework transport and serialization behavior documented in `src/samples/ServerComponentsDemo.ts`.

The React lint rules sample is now covered through a runnable node-only workspace in `node-samples/react-lint-rules/`, while compiler-purity examples remain documented in `src/samples/ReactLintRulesDemo.ts` until the compiler lint plugin is added here.

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

The request asked to “show all React and TypeScript usage”. A single repo cannot literally cover every API and every type-system corner case without turning into a reference manual. This project instead focuses on the stable React surface area, the highest-value TypeScript language features, and the interview-relevant edge cases that appear in real product code.
