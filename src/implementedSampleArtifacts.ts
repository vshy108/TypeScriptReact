import type { MiniSampleId } from "./sampleCatalog";

export interface ImplementedSampleArtifact {
  readonly label: string;
  readonly rootDir: string;
  readonly entryPoint: string;
  readonly verificationCommand: string;
  readonly entryHtml?: string;
  readonly launchPath?: string;
  readonly readmePath?: string;
}

// Implemented samples that do not render through the current SPA route surface publish their
// artifact details here. This is separate from sampleImplementations because these samples
// have their own entry points (hydration HTML, SSR workspace, node-only tsconfig, comment-based
// demo files) rather than a React component that MiniSampleStage can render inline.
export const implementedSampleArtifacts: Partial<
  Record<MiniSampleId, ImplementedSampleArtifact>
> = {
  "sample-react-hydration-hints": {
    label: "Separate hydration entry",
    rootDir: ".",
    entryHtml: "hydration.html",
    entryPoint: "src/hydration/main.tsx",
    launchPath: "/hydration.html",
    verificationCommand: "npm run build",
  },
  "sample-react-streaming-ssr": {
    label: "Dedicated SSR workspace",
    rootDir: "server-samples/react-streaming-ssr",
    entryPoint: "server-samples/react-streaming-ssr/src/runAllModes.tsx",
    readmePath: "server-samples/react-streaming-ssr/README.md",
    verificationCommand:
      "node ./node_modules/typescript/bin/tsc -p server-samples/react-streaming-ssr/tsconfig.runtime.json && node server-samples/react-streaming-ssr/dist/runAllModes.js",
  },
  "sample-ts-declarations": {
    label: "Node-only declaration workspace",
    rootDir: "node-samples/ts-declarations",
    readmePath: "node-samples/ts-declarations/README.md",
    entryPoint: "node-samples/ts-declarations/src/index.ts",
    verificationCommand:
      "node ./node_modules/typescript/bin/tsc -p node-samples/ts-declarations/tsconfig.json",
  },
  "sample-ts-advanced-runtime-types": {
    label: "Node-only advanced runtime types workspace",
    rootDir: "node-samples/ts-advanced-runtime",
    entryPoint: "node-samples/ts-advanced-runtime/src/index.ts",
    verificationCommand:
      "node ./node_modules/typescript/bin/tsc -p node-samples/ts-advanced-runtime/tsconfig.json",
  },
  "sample-ts-jsdoc-interop": {
    label: "Node-only JSDoc interop workspace",
    rootDir: "node-samples/ts-jsdoc-interop",
    entryPoint: "node-samples/ts-jsdoc-interop/src/index.ts",
    verificationCommand:
      "node ./node_modules/typescript/bin/tsc -p node-samples/ts-jsdoc-interop/tsconfig.json",
  },
  "sample-ts-advanced-tsconfig": {
    label: "Node-only advanced tsconfig workspace",
    rootDir: "node-samples/ts-advanced-tsconfig",
    entryPoint: "node-samples/ts-advanced-tsconfig/src/index.ts",
    verificationCommand:
      "node ./node_modules/typescript/bin/tsc -p node-samples/ts-advanced-tsconfig/tsconfig.json",
  },
  "sample-react-compiler": {
    label: "Comment-based compiler demo",
    rootDir: ".",
    entryPoint: "src/samples/ReactCompilerDemo.ts",
    verificationCommand: "npm run typecheck",
  },
  "sample-react-server-components": {
    label: "Comment-based server components demo",
    rootDir: ".",
    entryPoint: "src/samples/ServerComponentsDemo.ts",
    verificationCommand: "npm run typecheck",
  },
  "sample-react-lint-rules-demo": {
    label: "Comment-based lint rules demo",
    rootDir: ".",
    entryPoint: "src/samples/ReactLintRulesDemo.ts",
    verificationCommand: "npm run typecheck",
  },
};
