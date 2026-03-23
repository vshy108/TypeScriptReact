# Interview Practice Index

This guide turns the interview-prep docs in this repository into short repeatable practice sessions.

Use it when you do not want to decide what to study next. Pick a session length, follow the sequence, and answer out loud.

## 15-Minute Session

Use this when you want a fast warm-up before an interview.

1. Read one prompt in [./interview-questions.md](./interview-questions.md).
2. Read one scenario in [./interview-walkthroughs.md](./interview-walkthroughs.md).
3. Open one linked repo file and tighten your answer so it names the tradeoff clearly.

Good combinations:

- `useState` vs `useReducer` plus state ownership in [../src/samples/ReducerBoardSample.tsx](../src/samples/ReducerBoardSample.tsx)
- hydration mismatch plus [../src/hydration/HydrationHintsApp.tsx](../src/hydration/HydrationHintsApp.tsx)
- `satisfies` vs `as` plus [../src/catalog.ts](../src/catalog.ts)

## 30-Minute Session

Use this when you want one balanced practice block.

1. Start with [./interview-questions.md](./interview-questions.md) and answer two questions.
2. Use [./debugging-walkthroughs.md](./debugging-walkthroughs.md) for one debugging scenario.
3. Use [./system-design-walkthroughs.md](./system-design-walkthroughs.md) for one architecture scenario.
4. Re-open the linked files and rewrite any answer that sounded generic.

Recommended loop:

- one API or language question
- one debugging prompt
- one design prompt

This keeps practice close to the mix that many frontend interviews actually use.

## 45-Minute Session

Use this when you want a realistic mock round on your own.

1. Spend 10 minutes on [./interview-questions.md](./interview-questions.md).
2. Spend 10 minutes on [./interview-walkthroughs.md](./interview-walkthroughs.md).
3. Spend 10 minutes on [./debugging-walkthroughs.md](./debugging-walkthroughs.md).
4. Spend 10 minutes on [./system-design-walkthroughs.md](./system-design-walkthroughs.md).
5. Spend 5 minutes writing down which answers were still vague.

What to grade yourself on:

- did you name the source of truth
- did you explain the tradeoff instead of just the API
- did you anchor the answer to a real file in the repo
- did you say how you would verify the behavior or fix

Use [./interview-answer-rubric.md](./interview-answer-rubric.md) if you want a more explicit scoring pass after the session.

## One-Week Rotation

Use this when you want a simple repeated schedule instead of choosing topics every day.

1. Day 1: React questions from [./interview-questions.md](./interview-questions.md)
2. Day 2: TypeScript questions from [./interview-questions.md](./interview-questions.md)
3. Day 3: Product scenarios from [./interview-walkthroughs.md](./interview-walkthroughs.md)
4. Day 4: Debugging scenarios from [./debugging-walkthroughs.md](./debugging-walkthroughs.md)
5. Day 5: Architecture scenarios from [./system-design-walkthroughs.md](./system-design-walkthroughs.md)
6. Day 6: Repo-first refresh with [./reading-index.md](./reading-index.md)
7. Day 7: Re-do the weakest three answers without looking at notes first

## How To Review Weak Answers

When an answer feels fuzzy, do not just reread the guide. Re-open the linked implementation file and make the answer more specific.

Use this repair loop:

1. Name the exact file you would cite.
2. State the tradeoff in one sentence.
3. State the failure mode or boundary in one sentence.
4. State how you would test, verify, or defend the choice.

## Best Companion Guides

- [./interview-prep.md](./interview-prep.md) for the overall study path
- [./interview-questions.md](./interview-questions.md) for short-answer drills
- [./interview-walkthroughs.md](./interview-walkthroughs.md) for product scenarios
- [./debugging-walkthroughs.md](./debugging-walkthroughs.md) for root-cause explanation drills
- [./system-design-walkthroughs.md](./system-design-walkthroughs.md) for architecture scenarios
- [./interview-answer-rubric.md](./interview-answer-rubric.md) for scoring whether an answer is interview-ready

If you cannot explain an answer without reopening the repo, that is still useful. It tells you exactly what to practice next.