# Interview Answer Rubric

This guide helps you judge whether an answer is interview-ready after you practice it.

Use it with [./interview-practice-index.md](./interview-practice-index.md). The practice index tells you what to rehearse. This rubric tells you whether the answer was strong enough.

## Quick Scoring

Score each answer from 0 to 2 in the categories below.

- `0` means the answer missed the category completely.
- `1` means the category was present but vague.
- `2` means the category was clear, concrete, and defensible.

Maximum score: `10`

## Category 1: Correctness

Ask:

- Was the explanation technically correct?
- Did it avoid mixing up similar concepts?
- Did it use the right terms for the actual behavior?

Repo example checks:

- `Suspense` vs error handling in [../src/samples/ErrorBoundarySample.tsx](../src/samples/ErrorBoundarySample.tsx)
- distributive vs non-distributive conditionals in [../src/samples/ConditionalDistributivitySample.tsx](../src/samples/ConditionalDistributivitySample.tsx)

## Category 2: Tradeoff Clarity

Ask:

- Did the answer explain why one choice is better in this case?
- Did it state what would make the decision change?
- Did it avoid sounding like one tool is always right?

Repo example checks:

- `useState` vs `useReducer` in [../src/samples/ReducerBoardSample.tsx](../src/samples/ReducerBoardSample.tsx)
- local state vs external store in [../src/releaseStore.ts](../src/releaseStore.ts)

## Category 3: Boundary Awareness

Ask:

- Did the answer name the right layer to inspect or design first?
- Did it distinguish UI state, server state, routing logic, and runtime boundaries?
- Did it avoid debugging or designing at the wrong layer?

Repo example checks:

- routing boundaries in [../src/sampleRuntime.ts](../src/sampleRuntime.ts)
- runtime boundaries in [../src/implementedSampleArtifacts.ts](../src/implementedSampleArtifacts.ts)
- hydration boundaries in [../src/hydration/bootHydrationSample.tsx](../src/hydration/bootHydrationSample.tsx)

## Category 4: Verification Plan

Ask:

- Did the answer say how to prove the behavior or fix?
- Did it mention a test, reproduction step, or observable outcome?
- Did it avoid stopping at pure theory?

Repo example checks:

- async verification in [../src/test/async-ui-verification-sample.test.tsx](../src/test/async-ui-verification-sample.test.tsx)
- sample registry coverage in [../src/test/samples.test.tsx](../src/test/samples.test.tsx)

## Category 5: Repo Anchoring

Ask:

- Could you cite a real file from this repo while answering?
- Did the answer connect the concept to a concrete implementation?
- Could an interviewer ask "where have you seen that?" and get a direct answer?

Strong anchors:

- [../src/App.tsx](../src/App.tsx)
- [../src/sampleCatalog.ts](../src/sampleCatalog.ts)
- [../src/samples/ContextIdentitySample.tsx](../src/samples/ContextIdentitySample.tsx)
- [../src/samples/ConditionalDistributivitySample.tsx](../src/samples/ConditionalDistributivitySample.tsx)

## What Strong Scores Usually Mean

- `9-10`: interview-ready answer
- `7-8`: solid answer, but still somewhat generic in one area
- `5-6`: partial understanding, needs more concrete examples or a clearer tradeoff
- `0-4`: answer is too vague, incorrect, or detached from the repo

## Fast Repair Loop

If an answer scores low, revise it in this order:

1. fix correctness first
2. add one explicit tradeoff
3. name the boundary or layer involved
4. say how you would verify it
5. cite one repo file that proves the point

## Best Pairings

- Use [./interview-questions.md](./interview-questions.md) with this rubric for short-answer scoring.
- Use [./debugging-walkthroughs.md](./debugging-walkthroughs.md) with this rubric for root-cause explanations.
- Use [./system-design-walkthroughs.md](./system-design-walkthroughs.md) with this rubric for architecture answers.
- Use [./interview-practice-index.md](./interview-practice-index.md) when you want the rubric inside a timed session.

If an answer is correct but still scores poorly, the usual missing piece is specificity.