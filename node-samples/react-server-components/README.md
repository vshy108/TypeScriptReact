# React Server Components Workspace

This node-only sample does not try to boot a full framework. Instead, it verifies the source-level boundaries that React Server Components rely on:

- `'use client'` on an interactive component
- async server components without client directives
- file-level `'use server'` exports for server functions
- inline `'use server'` actions inside a server component

The report script parses small fixture modules with the TypeScript compiler API and produces a JSON summary of which boundaries were detected.

Validate it with:

```sh
node ./node_modules/typescript/bin/tsc -p node-samples/react-server-components/tsconfig.json
node node-samples/react-server-components/dist/src/reportServerComponentBoundaries.js
```
