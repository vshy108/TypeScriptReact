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
- Strict TypeScript compiler flags such as `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess`
- Template literal ids, assertion functions, `as const satisfies`, and generic components

## Scripts

- `npm run dev` starts the Vite dev server
- `npm run build` runs TypeScript project builds and produces a production bundle
- `npm run lint` runs ESLint
- `npm run typecheck` runs TypeScript without building the app bundle
- `npm run preview` serves the built app locally

## File map

- `src/App.tsx` contains the interactive React showcase
- `src/catalog.ts` holds typed sample data and domain types
- `src/releaseStore.ts` is the external store example for `useSyncExternalStore`
- `src/sampleCatalog.ts` is the typed registry for isolated mini-samples
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
- `src/samples/UtilityMappedSample.tsx` demonstrates TypeScript utility types, `keyof`, mapped types, conditional types, and `infer` through one derived release-contract model
- `src/components/TypeNotes.tsx` is lazy-loaded behind `Suspense`
- `docs/coverage-roadmap.md` tracks what is implemented and what still needs examples
- `docs/mini-samples.md` splits the backlog into isolated sample-sized units

## Notes

The request asked to “show all React and TypeScript usage”. A single project cannot literally cover every API and every type-system feature without turning into a reference manual. This app focuses on the most useful modern patterns you are likely to apply in real work while keeping the code readable and runnable.
