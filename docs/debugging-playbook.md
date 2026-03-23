# Debugging Playbook

This guide maps common frontend interview debugging prompts to the parts of this repository that already demonstrate the underlying issue.

## Re-rendering Problems

### A child component re-renders more than expected

Check prop identity first, not just state changes.

Repo examples: [../src/samples/MemoLabSample.tsx](../src/samples/MemoLabSample.tsx), [../src/samples/ContextIdentitySample.tsx](../src/samples/ContextIdentitySample.tsx)

### Context updates are causing too many renders

Check whether the provider value object or callback identities are recreated every render.

Repo example: [../src/samples/ContextIdentitySample.tsx](../src/samples/ContextIdentitySample.tsx)

## Async And State Problems

### State looks stale inside a timeout or promise callback

Look for closure capture first. Functional updaters or refs often solve it.

Repo example: [../src/samples/StaleClosureSample.tsx](../src/samples/StaleClosureSample.tsx)

### UI responds too slowly while typing or filtering

Decide whether the issue is expensive derived work, unnecessary re-renders, or poor scheduling.

Repo examples: [../src/App.tsx](../src/App.tsx), [../src/samples/ActivityTransitionSample.tsx](../src/samples/ActivityTransitionSample.tsx)

## Routing And Identity Problems

### The wrong item keeps its state after a reorder

Inspect keys before inspecting component logic.

Repo example: [../src/samples/KeyIdentitySample.tsx](../src/samples/KeyIdentitySample.tsx)

### The selected sample or route does not match the URL

Check the routing helper and the catalog mapping before blaming the UI.

Repo examples: [../src/sampleRuntime.ts](../src/sampleRuntime.ts), [../src/components/MiniSampleStage.tsx](../src/components/MiniSampleStage.tsx)

## Rendering Boundary Problems

### A lazy-loaded component fails and the loading UI never resolves

Differentiate waiting from failure. `Suspense` is not an error boundary.

Repo example: [../src/samples/ErrorBoundarySample.tsx](../src/samples/ErrorBoundarySample.tsx)

### The server-rendered markup does not match the client render

Check time-based values, random values, environment checks, and server/client branching.

Repo examples: [../src/samples/HydrationMismatchDemo.ts](../src/samples/HydrationMismatchDemo.ts), [../src/hydration/HydrationHintsApp.tsx](../src/hydration/HydrationHintsApp.tsx)

## Browser And Layout Problems

### Text or code content overflows a card in Safari

Check `min-width: 0`, wrapping behavior, and grid or flex shrink constraints before blaming the content itself.

Repo example: [../src/App.css](../src/App.css)

### A ref is `null` when code expects a node

Check whether the code is running during render instead of after mount, or whether a callback ref lifecycle is involved.

Repo example: [../src/samples/RefTimingSample.tsx](../src/samples/RefTimingSample.tsx)