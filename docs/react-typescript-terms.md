# React and TypeScript Terms

This folder now splits the glossary by subject so the learning path matches the repository structure more closely.

## What This Folder Is For

Use these guides as a companion while reading the app and sample files. The goal is not to define every React or TypeScript term in the ecosystem. The goal is to explain the terms this repository actually demonstrates, then point you straight at the example file where each idea shows up.

## Guides

- [Reading index](./reading-index.md): the shortest recommended path through the repository now that the code has more rationale comments.
- [React terms](./react-terms.md): React client APIs, DOM APIs, server APIs, compiler and lint concepts, and the edge-case terms demonstrated by this repo.
- [TypeScript terms](./typescript-terms.md): TypeScript language features, interop topics, compiler options, and type-system edge cases demonstrated by this repo.

## Recommended Reading Paths

### If You Know Older React But Not React 19

1. Start with [React terms](./react-terms.md).
2. Read the examples linked from `Suspense`, `lazy`, `useActionState`, `useOptimistic`, `useEffectEvent`, and hydration-related terms.
3. Open [../src/App.tsx](../src/App.tsx) and [../src/sampleCatalog.ts](../src/sampleCatalog.ts) after that so the app shell and sample registry make sense.

### If You Are Stronger In React Than In TypeScript

1. Read [React terms](./react-terms.md) first to understand the runtime model.
2. Then read [TypeScript terms](./typescript-terms.md) with focus on `satisfies`, template literal IDs, mapped types, conditional types, and the sample-specific tsconfig flags.
3. Use the linked sample files as your second pass instead of reading the guides like a glossary from top to bottom.

### If You Want A Repo-First Study Order

1. Read [../README.md](../README.md) for the map of the project.
2. Read [Reading index](./reading-index.md) for the fastest path through the annotated files.
3. Read [React terms](./react-terms.md).
4. Read [TypeScript terms](./typescript-terms.md).
5. Browse [../src/sampleCatalog.ts](../src/sampleCatalog.ts) and then open the linked sample files that match the terms you want to practice.

## Scope

These guides are based on the repository's documented sample coverage in [README.md](../README.md), [mini-samples.md](./mini-samples.md), and [src/sampleCatalog.ts](../src/sampleCatalog.ts). They are intentionally focused on the terms this codebase teaches rather than trying to be a complete React or TypeScript reference manual.

## Suggested Order

1. Read [React terms](./react-terms.md) first if you are coming from older React and want to understand the runtime model used in this project.
2. Read [TypeScript terms](./typescript-terms.md) next to understand the type-level patterns that shape the sample code.
3. Keep each guide open while exploring the linked implementation files in the app and sample catalog.