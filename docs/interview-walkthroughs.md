# Interview Walkthroughs

This guide turns the repository into practice for the part of interviews where you need to talk through a product scenario, not just define an API.

Use it after reading [./interview-questions.md](./interview-questions.md). The goal here is to shape answers that are concrete, bounded, and tied to code you can defend.

## How To Use This Guide

1. Read one prompt.
2. Spend two to three minutes answering it out loud.
3. Re-open the linked repo files and check whether your answer matches the actual code.
4. Tighten the answer until it explains both the design and the tradeoffs.

## Walkthrough 1: Design A Small Product Feature

Prompt:

"Design the frontend structure for a release review feature that loads data, allows edits, and blocks publish until approvals are complete."

Good answer shape:

- Start with a small feature boundary instead of a generic component library.
- Separate domain types, client calls, state management, and rendering so each layer has one job.
- Keep server-owned workflow state authoritative and derive UI status from it instead of inventing parallel local flags.
- Test the feature through user-visible flows rather than only unit-testing helpers.

Repo anchors:

- [../src/features/release-readiness/types.ts](../src/features/release-readiness/types.ts)
- [../src/features/release-readiness/client.ts](../src/features/release-readiness/client.ts)
- [../src/features/release-readiness/useReleaseReadiness.ts](../src/features/release-readiness/useReleaseReadiness.ts)
- [../src/features/release-readiness/ReleaseReadinessPanel.tsx](../src/features/release-readiness/ReleaseReadinessPanel.tsx)
- [../src/features/release-readiness/ReleaseReadinessPanel.test.tsx](../src/features/release-readiness/ReleaseReadinessPanel.test.tsx)
- [../src/features/release-resumption-attestation-registers/ReleaseResumptionAttestationRegistersPanel.tsx](../src/features/release-resumption-attestation-registers/ReleaseResumptionAttestationRegistersPanel.tsx)

What to say explicitly:

- `types.ts` keeps the workflow vocabulary stable across the client, hook, and UI.
- `client.ts` is the seam where fetch logic or server mocks change without rewriting render code.
- `useFeature.ts` style hooks own loading, mutation, and refresh orchestration.
- the panel component stays focused on rendering state and wiring user actions to mutations.

Strong follow-up answer:

"I would not start by extracting reusable abstractions. I would first keep one vertical slice with typed domain models, a client module, one stateful hook, and one panel. If the next feature repeats the same request and mutation patterns, then I would extract shared primitives from real duplication instead of guessing early."

## Walkthrough 2: Explain An Async UI Testing Strategy

Prompt:

"How would you test a UI that loads data, shows a spinner, handles failure, and supports retry?"

Good answer shape:

- Test the user-visible states in order: idle, loading, success or error, then retry.
- Make async behavior deterministic so the test proves behavior instead of racing timers.
- Assert on what the user can observe, not internal state.
- Keep one focused feature test and one broader registry-level test when the repo uses shared wiring.

Repo anchors:

- [../src/samples/AsyncUiVerificationSample.tsx](../src/samples/AsyncUiVerificationSample.tsx)
- [../src/test/async-ui-verification-sample.test.tsx](../src/test/async-ui-verification-sample.test.tsx)
- [../src/test/samples.test.tsx](../src/test/samples.test.tsx)

What to say explicitly:

- the sample uses mocked scenarios so success and failure are intentional, not flaky.
- the test checks loading text, resolved content, failure UI, and retry behavior.
- the shared sample harness protects the catalog and implementation registry from drifting apart.

Strong follow-up answer:

"If I only tested the helper that returns mocked data, I would miss the actual rendering contract. The higher-value test is the one that proves the user sees the spinner, the error message, and the recovered UI after retry."

## Walkthrough 3: Fix An Accessibility Regression

Prompt:

"A form submission fails validation and keyboard users are getting lost. How would you approach the fix?"

Good answer shape:

- Make the invalid fields discoverable through semantics, not only color.
- Link field-level errors to the input with `aria-describedby` and mark invalid fields with `aria-invalid`.
- Move focus to the first invalid field or a summary region so keyboard users know where to recover.
- Verify the behavior with tests that use roles and labels, because those align with accessibility contracts.

Repo anchors:

- [../src/samples/AccessibleFormErrorsSample.tsx](../src/samples/AccessibleFormErrorsSample.tsx)
- [../src/test/accessible-form-errors-sample.test.tsx](../src/test/accessible-form-errors-sample.test.tsx)
- [../src/samples/AccessibleListboxSample.tsx](../src/samples/AccessibleListboxSample.tsx)
- [../src/test/accessible-listbox-sample.test.tsx](../src/test/accessible-listbox-sample.test.tsx)

What to say explicitly:

- accessible recovery means both announcement and focus management.
- semantic roles and associations make the UI easier to test and easier to use.
- keyboard support is part of the feature contract, not a later enhancement.

Strong follow-up answer:

"I would not rely on a visual error banner alone. If the input is invalid, the control needs a machine-readable connection to the error text, and the interaction needs a predictable focus target so the user can correct the form immediately."

## Walkthrough 4: Debug A Hydration Mismatch

Prompt:

"A server-rendered React page logs a hydration mismatch warning only in production. How would you reason about it?"

Good answer shape:

- Start by restating the invariant: the client must render the same initial tree the server rendered.
- Check for time-based values, random values, environment-only branches, or browser-only data during the initial render.
- Keep server markup generation and client boot logic separate enough that you can inspect each step.
- Fix the mismatch at the source instead of muting the warning.

Repo anchors:

- [../src/samples/HydrationMismatchDemo.ts](../src/samples/HydrationMismatchDemo.ts)
- [../src/hydration/HydrationHintsApp.tsx](../src/hydration/HydrationHintsApp.tsx)
- [../src/hydration/bootHydrationSample.tsx](../src/hydration/bootHydrationSample.tsx)
- [../src/test/hydration-entry.test.tsx](../src/test/hydration-entry.test.tsx)

What to say explicitly:

- hydration bugs usually come from unstable initial values, not from React being random.
- separating static data, rendered HTML, and client boot code makes the mismatch easier to isolate.
- once the initial tree is stable, normal client-only updates can happen after hydration.

Strong follow-up answer:

"I would compare the server snapshot with the first client render path before looking at later state changes. Hydration warnings are usually about initial determinism, so I want to inspect any value that depends on time, randomness, or the browser environment."

## Walkthrough 5: Explain State Ownership And Render Cost

Prompt:

"How would you explain where state should live and when memoization is actually worth it?"

Good answer shape:

- Put state near the narrowest part of the tree that truly owns it.
- Lift state only when multiple consumers need the same source of truth.
- Treat memoization as a performance tool with a measurable target, not a default coding style.
- Watch for context value identity and unstable props before adding memoization everywhere.

Repo anchors:

- [../src/samples/ContextIdentitySample.tsx](../src/samples/ContextIdentitySample.tsx)
- [../src/samples/MemoLabSample.tsx](../src/samples/MemoLabSample.tsx)
- [../src/samples/ReducerBoardSample.tsx](../src/samples/ReducerBoardSample.tsx)
- [../src/App.tsx](../src/App.tsx)

What to say explicitly:

- unnecessary lifting creates broad re-render surfaces.
- reducer-style state helps when transitions are easier to describe as actions than ad hoc setters.
- `memo`, `useMemo`, and `useCallback` only help when they stabilize something that a real boundary depends on.

Strong follow-up answer:

"I would first check whether the data belongs in local component state, shared React state, or an external store. Then I would profile or reason about the render boundary before adding memoization, because extra memo code is only justified when it prevents meaningful work."

## What Good Answers Usually Sound Like

- specific to one bounded problem
- tied to a clear user-facing contract
- explicit about tradeoffs instead of reciting APIs
- backed by concrete files you can reference under pressure

If an answer starts sounding generic, go back to the linked files and make it more concrete.