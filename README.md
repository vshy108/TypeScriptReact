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
- `src/samples/PortalModalSample.tsx` demonstrates `createPortal()` and `flushSync()` with body-mounted modal and toast hosts
- `src/hydration/HydrationHintsApp.tsx` and `src/hydration/main.tsx` demonstrate `hydrateRoot()` plus the resource hint APIs in a separate entry
- `server-samples/react-streaming-ssr/src/runAllModes.tsx` demonstrates the current stable React server/static rendering APIs in one dedicated SSR workspace
- `src/samples/UtilityMappedSample.tsx` demonstrates TypeScript utility types, `keyof`, mapped types, conditional types, and `infer` through one derived release-contract model
- `src/samples/FunctionsTuplesSample.tsx` demonstrates tuples, overloads, call signatures, construct signatures, and `this` typing through a typed command-routing playground
- `src/samples/ClassesModelsSample.tsx` demonstrates classes, access modifiers, abstract classes, `implements`, and intersection types through a plugin registry model
- `src/samples/RecursiveTypesSample.tsx` demonstrates recursive interfaces, recursive type aliases, `DeepReadonly`, and `DeepKeyPaths` through an org-tree hierarchy
- `src/samples/ActivityTransitionSample.tsx` demonstrates `<Activity>` boundaries and standalone `startTransition` through a tier-based operator console
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
- `hydration.html` is the separate HTML shell that the hydration sample attaches to
- `server-samples/react-streaming-ssr/README.md` explains the SSR workspace and how to run it directly
- `src/components/TypeNotes.tsx` is lazy-loaded behind `Suspense`
- `docs/coverage-roadmap.md` tracks what is implemented and what still needs examples
- `docs/mini-samples.md` splits the backlog into isolated sample-sized units
## Why some React features are not covered here

All stable React client and DOM APIs are demonstrated in this project. The remaining uncovered features require infrastructure that does not fit inside a single Vite client app:

| Feature | Reason not covered |
|---------|-------------------|
| React Compiler, `"use memo"`, `"use no memo"` | Requires the React Compiler Babel/SWC plugin configured in a dedicated build pipeline. The compiler transforms code at build time, so it cannot be shown as a runtime sample inside a standard Vite project. |
| Server Components, Server Functions, `'use client'`, `'use server'` | These rely on a framework-aware bundler (e.g. Next.js, Remix) that splits server and client modules at build time. Faking them in a plain client app would misrepresent how they work. |
| Deeper lint examples (`exhaustive-deps`, purity, `static-components`) | These are ESLint rule demonstrations rather than API usage. They would need intentionally broken code and lint output, which do not fit the sample-and-test pattern used here. |
| Canary APIs (`<ViewTransition>`, `addTransitionType`) | Not yet part of a stable React release. Will be added when they ship in a stable version. |
| Experimental APIs (`experimental_taintObjectReference`) | Intentionally unstable and subject to removal. Not appropriate for a learning reference. |
| Legacy APIs (`Children`, `cloneElement`, `createRef`, `forwardRef`, class components, `PureComponent`) | These are superseded by modern equivalents already shown in this project. They exist for backward compatibility and are not recommended for new code. |
## Notes

The request asked to “show all React and TypeScript usage”. A single project cannot literally cover every API and every type-system feature without turning into a reference manual. This app focuses on the most useful modern patterns you are likely to apply in real work while keeping the code readable and runnable.
