import type { MiniSampleId } from './sampleCatalog'

export interface ImplementedSampleArtifact {
  readonly label: string
  readonly rootDir: string
  readonly entryPoint: string
  readonly verificationCommand: string
  readonly entryHtml?: string
  readonly launchPath?: string
  readonly readmePath?: string
}

// Implemented samples that do not render through the current SPA route surface publish their artifact details here.
export const implementedSampleArtifacts: Partial<Record<MiniSampleId, ImplementedSampleArtifact>> = {
  'sample-react-hydration-hints': {
    label: 'Separate hydration entry',
    rootDir: '.',
    entryHtml: 'hydration.html',
    entryPoint: 'src/hydration/main.tsx',
    launchPath: '/hydration.html',
    verificationCommand: 'npm run build',
  },
  'sample-react-streaming-ssr': {
    label: 'Dedicated SSR workspace',
    rootDir: 'server-samples/react-streaming-ssr',
    entryPoint: 'server-samples/react-streaming-ssr/src/runAllModes.tsx',
    readmePath: 'server-samples/react-streaming-ssr/README.md',
    verificationCommand:
      'node ./node_modules/typescript/bin/tsc -p server-samples/react-streaming-ssr/tsconfig.runtime.json && node server-samples/react-streaming-ssr/dist/runAllModes.js',
  },
  'sample-ts-declarations': {
    label: 'Node-only declaration workspace',
    rootDir: 'node-samples/ts-declarations',
    readmePath: 'node-samples/ts-declarations/README.md',
    entryPoint: 'node-samples/ts-declarations/src/index.ts',
    verificationCommand: 'node ./node_modules/typescript/bin/tsc -p node-samples/ts-declarations/tsconfig.json',
  },
}
