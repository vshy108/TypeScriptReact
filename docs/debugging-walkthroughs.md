# Debugging Walkthroughs

This guide is for interview prompts where you need to explain how you would debug a frontend problem step by step.

Use it after [./debugging-playbook.md](./debugging-playbook.md). The playbook maps symptoms to likely causes. This guide helps you turn that knowledge into a clear spoken answer.

## How To Practice

1. Read one prompt.
2. Answer it out loud in under three minutes.
3. Re-open the linked files and tighten the answer until it is concrete.
4. Make sure your answer includes both the first thing you would inspect and the likely root cause.

## Walkthrough 1: A Counter Looks Stale Inside Async Work

Prompt:

"A button increments a counter, but a delayed callback logs an older value. How would you debug it?"

Good answer shape:

- Reproduce the bug and check whether the delayed work captured old state.
- Distinguish a stale closure problem from a batching or render-frequency problem.
- Prefer functional state updates or a ref that tracks the latest value when async code needs current state.
- Verify the fix by repeating the same delayed interaction instead of relying on a code-only explanation.

Repo anchors:

- [../src/samples/StaleClosureSample.tsx](../src/samples/StaleClosureSample.tsx)
- [../src/App.tsx](../src/App.tsx)

What to say explicitly:

- the bug is often not that React failed to update state, but that the callback closed over an older render.
- functional updaters solve state transitions based on previous state.
- refs help when async code must read the latest value without triggering a re-render.

Strong follow-up answer:

"I would first prove whether the delayed callback was created before the latest render. If so, I would treat it as a stale closure issue, not a scheduler issue, and I would fix it with a functional updater or a latest-value ref depending on whether the callback needs to compute a new state or just read the current one."

## Walkthrough 2: The Wrong Item Keeps Its State After Reorder

Prompt:

"A list is reordered and the wrong row keeps the expanded state. How would you reason about that bug?"

Good answer shape:

- Inspect item keys before inspecting child component logic.
- Explain that React preserves state by element identity, and identity comes from the key.
- If the key is derived from array position, state will follow position instead of the intended data item.
- Fix the key to use a stable data id and re-test the reorder flow.

Repo anchors:

- [../src/samples/KeyIdentitySample.tsx](../src/samples/KeyIdentitySample.tsx)

What to say explicitly:

- this is usually an identity bug, not a local state bug.
- `key={index}` is only safe when the collection order is truly static.
- stable keys also make tests and debugging more predictable.

Strong follow-up answer:

"I would not start by rewriting the child component. I would first inspect the list key strategy because React state preservation is tied to identity, and identity is tied to the key. If the key changes with position, the wrong row can inherit the previous row's state."

## Walkthrough 3: A Memoized UI Still Re-renders Too Much

Prompt:

"You added memoization, but the expensive child still re-renders. How would you debug it?"

Good answer shape:

- Check prop identity before assuming memoization is broken.
- Inspect whether callbacks, arrays, or objects are recreated every render.
- Look at context provider values too, because unstable provider values fan out re-renders broadly.
- Only keep memoization that protects a meaningful render boundary.

Repo anchors:

- [../src/samples/MemoLabSample.tsx](../src/samples/MemoLabSample.tsx)
- [../src/samples/ContextIdentitySample.tsx](../src/samples/ContextIdentitySample.tsx)

What to say explicitly:

- `memo` only helps if the props reaching the child are referentially stable.
- `useMemo` and `useCallback` are support tools for that stability, not automatic performance wins.
- context provider identity can invalidate memoization work farther down the tree.

Strong follow-up answer:

"I would inspect the actual props and provider values that cross the memo boundary. If a parent recreates an object or callback every render, the child is doing the correct thing by re-rendering, and the fix belongs at the source of the unstable identity."

## Walkthrough 4: Loading UI Hangs After A Lazy Import Fails

Prompt:

"A lazy-loaded panel never gets past the loading fallback after a failure. How would you debug it?"

Good answer shape:

- Separate waiting behavior from failure behavior.
- Confirm whether the issue is a rejected lazy import rather than a slow one.
- Explain that `Suspense` handles waiting but an Error Boundary handles render failures.
- Verify the fix by forcing the failure path and checking the recovery UI.

Repo anchors:

- [../src/samples/ErrorBoundarySample.tsx](../src/samples/ErrorBoundarySample.tsx)

What to say explicitly:

- a loading fallback that never resolves can hide an unhandled error.
- not every async-looking failure is a data-fetch problem.
- recovery matters too: reset or retry behavior should be part of the answer.

Strong follow-up answer:

"My first question would be whether the module is still pending or whether it rejected. If it rejected, the fix is not more loading-state logic. The fix is an Error Boundary around the lazy subtree so failure has its own rendering path instead of leaving the UI stuck in a wait-oriented mental model."

## Walkthrough 5: The Selected UI Does Not Match The URL

Prompt:

"The page URL points at one sample, but the screen shows another. What would you inspect first?"

Good answer shape:

- Start at the routing helper, not the rendered component.
- Check how the URL value is parsed, normalized, and mapped to sample ids.
- Compare the runtime lookup path with the sample catalog source of truth.
- Verify whether the bug is in URL parsing, fallback selection, or implementation registry drift.

Repo anchors:

- [../src/sampleRuntime.ts](../src/sampleRuntime.ts)
- [../src/sampleCatalog.ts](../src/sampleCatalog.ts)
- [../src/sampleImplementations.ts](../src/sampleImplementations.ts)
- [../src/components/MiniSampleStage.tsx](../src/components/MiniSampleStage.tsx)

What to say explicitly:

- route mismatches are often mapping bugs rather than rendering bugs.
- one central catalog reduces the chance that the UI and the URL disagree about valid sample ids.
- fallback logic should be explicit and easy to trace.

Strong follow-up answer:

"I would trace the selected sample from the URL parser to the catalog lookup before inspecting the component tree. If parsing or fallback logic is wrong, the UI is only reflecting a bad routing decision, so debugging inside the rendered sample would be the wrong layer."

## What Strong Debugging Answers Include

- the first concrete thing you would inspect
- the likely root cause category
- the file or boundary where you would confirm it
- how you would verify the fix after changing it

If an answer only lists possible causes, it is still too vague for an interview.