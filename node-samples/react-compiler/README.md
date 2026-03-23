# React Compiler Workspace

This node-only sample verifies the source-level compiler boundaries that can be checked without installing the Babel or SWC transform:

- function-level `"use memo"` directives for annotation mode
- function-level and module-level `"use no memo"` escape hatches
- infer-mode naming heuristics for PascalCase components versus lowercase helpers

The report script parses fixture modules with the TypeScript compiler API and produces a JSON summary of which directives and inference candidates were found.

Generated cache slots, transformed output, and DevTools compiler badges still remain documented in `src/samples/ReactCompilerDemo.ts` because they require the real compiler plugin.

Validate it with:

```sh
node ./node_modules/typescript/bin/tsc -p node-samples/react-compiler/tsconfig.json
node node-samples/react-compiler/dist/src/reportCompilerDirectives.js
```
