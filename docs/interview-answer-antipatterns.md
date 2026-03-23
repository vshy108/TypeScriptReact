# Interview Answer Anti-Patterns

This guide shows what weak frontend interview answers usually sound like and how to repair them.

Use it after [./interview-answer-rubric.md](./interview-answer-rubric.md). The rubric tells you how to score an answer. This guide tells you what probably went wrong.

## Anti-Pattern 1: Definition Without Decision

Weak answer shape:

"`useReducer` is for complex state and `useState` is for simple state."

Why this fails:

- it defines the tools but does not explain the tradeoff in context
- it gives no signal that you can make a real implementation choice

Repair:

- say what makes the state model complex here
- explain why action-based transitions help or do not help
- anchor the point to a real file

Repo anchors:

- [../src/samples/ReducerBoardSample.tsx](../src/samples/ReducerBoardSample.tsx)
- [../src/App.tsx](../src/App.tsx)

## Anti-Pattern 2: Generic Performance Advice

Weak answer shape:

"Use memoization to improve performance."

Why this fails:

- it does not say what work is being avoided
- it ignores prop identity and boundary selection
- it sounds like cargo-cult optimization

Repair:

- name the expensive boundary
- explain which identity must be stable
- state how you would confirm that the memoization matters

Repo anchors:

- [../src/samples/MemoLabSample.tsx](../src/samples/MemoLabSample.tsx)
- [../src/samples/ContextIdentitySample.tsx](../src/samples/ContextIdentitySample.tsx)

## Anti-Pattern 3: Debugging At The Wrong Layer

Weak answer shape:

"I would inspect the component logic first."

Why this fails:

- many interview bugs are identity, routing, or boundary problems before they are component logic problems
- it suggests random debugging rather than a reasoned approach

Repair:

- name the boundary you would inspect first
- explain why that layer is more likely to own the bug
- then narrow inward only if needed

Repo anchors:

- [../src/sampleRuntime.ts](../src/sampleRuntime.ts)
- [../src/sampleCatalog.ts](../src/sampleCatalog.ts)
- [../src/components/MiniSampleStage.tsx](../src/components/MiniSampleStage.tsx)

## Anti-Pattern 4: Correct Idea, No Verification

Weak answer shape:

"I would fix it with an Error Boundary."

Why this fails:

- it proposes a fix but does not explain how to prove the fix worked
- interviewers want to know whether you can close the loop, not just propose changes

Repair:

- say what failure path you would reproduce
- state the expected user-visible result after the fix
- mention the test or verification strategy

Repo anchors:

- [../src/samples/ErrorBoundarySample.tsx](../src/samples/ErrorBoundarySample.tsx)
- [../src/test/async-ui-verification-sample.test.tsx](../src/test/async-ui-verification-sample.test.tsx)

## Anti-Pattern 5: No Repo Anchoring

Weak answer shape:

"I have seen this pattern before in projects."

Why this fails:

- it gives no concrete proof from the current repo
- it misses the whole value of practicing against real files instead of abstract notes

Repair:

- cite one file immediately
- connect the file to the behavior or tradeoff you are describing
- keep the anchor short and direct

Strong anchors:

- [../src/samples/ConditionalDistributivitySample.tsx](../src/samples/ConditionalDistributivitySample.tsx)
- [../src/samples/AccessibleFormErrorsSample.tsx](../src/samples/AccessibleFormErrorsSample.tsx)
- [../src/features/release-readiness/ReleaseReadinessPanel.tsx](../src/features/release-readiness/ReleaseReadinessPanel.tsx)

## Anti-Pattern 6: Tool Absolutism

Weak answer shape:

"Always use context for shared state."

Why this fails:

- frontend design choices are conditional, not absolute
- absolute advice usually hides a lack of boundary reasoning

Repair:

- explain when the advice applies
- explain one case where it would not apply
- tie the exception back to ownership or runtime constraints

Repo anchors:

- [../src/releaseStore.ts](../src/releaseStore.ts)
- [../src/samples/ContextThemeSample.tsx](../src/samples/ContextThemeSample.tsx)

## Fast Recovery Questions

If an answer starts sounding weak, stop and ask yourself:

1. what decision am I actually making
2. what boundary owns this behavior
3. how would I prove it in the UI or tests
4. which repo file would I cite right now

## Best Companion Guides

- [./interview-answer-rubric.md](./interview-answer-rubric.md) for scoring
- [./interview-practice-index.md](./interview-practice-index.md) for timed sessions
- [./debugging-walkthroughs.md](./debugging-walkthroughs.md) for structured debugging answers
- [./system-design-walkthroughs.md](./system-design-walkthroughs.md) for architecture scenarios

If an answer is technically correct but still sounds weak, it usually needs a sharper decision, a clearer boundary, or a concrete repo anchor.