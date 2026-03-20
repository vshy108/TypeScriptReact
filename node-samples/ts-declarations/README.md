# Type Declaration Sample

This node-only sample demonstrates four TypeScript interop topics in one small workspace:

- `.d.ts` authoring for an untyped JavaScript module in `vendor/legacy-release-kit.d.ts`
- declaration merging through the layered `ReleaseConfig` interface
- module augmentation in `src/augmentations.d.ts`
- triple-slash directives in `src/index.ts`

Validate it with:

```sh
node ./node_modules/typescript/bin/tsc -p node-samples/ts-declarations/tsconfig.json
```
