import type { MiniSampleId } from './sampleCatalog'

export interface ExternalSampleArtifact {
  readonly label: string
  readonly rootDir: string
  readonly entryPoint: string
  readonly verificationCommand: string
}

// Implemented non-browser samples publish their location here so the stage, docs, and tests can agree on where they live.
export const externalSampleArtifacts: Partial<Record<MiniSampleId, ExternalSampleArtifact>> = {
  'sample-ts-declarations': {
    label: 'Node-only declaration workspace',
    rootDir: 'node-samples/ts-declarations',
    entryPoint: 'node-samples/ts-declarations/src/index.ts',
    verificationCommand: 'node ./node_modules/typescript/bin/tsc -p node-samples/ts-declarations/tsconfig.json',
  },
}
