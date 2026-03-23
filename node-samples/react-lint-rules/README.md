# React Lint Rules Workspace

This node-only sample verifies the React lint rules that are actually enabled in this repo's ESLint config:

- `react-hooks/exhaustive-deps`
- `react-hooks/rules-of-hooks`
- `react-refresh/only-export-components`

The workspace keeps intentionally bad fixtures next to corrected versions and produces a JSON report showing which rule ids fired for each file.

`react-compiler` purity notes still live in `src/samples/ReactLintRulesDemo.ts` because the compiler lint plugin is not enabled in this workspace.

Validate it with:

```sh
node ./node_modules/typescript/bin/tsc -p node-samples/react-lint-rules/tsconfig.json
node node-samples/react-lint-rules/dist/src/reportLintRules.js
```
