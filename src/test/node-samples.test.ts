// @vitest-environment node

import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { externalSampleArtifacts } from '../externalSampleArtifacts'
import { miniSampleCatalog } from '../sampleCatalog'

const implementedNodeOnlySamples = miniSampleCatalog.filter(
  (sample) => sample.status === 'implemented' && sample.surface === 'node-only',
)

describe('node-only mini-samples', () => {
  it('keeps every implemented node-only sample wired to an artifact definition', () => {
    const missingArtifacts = implementedNodeOnlySamples
      .map((sample) => sample.id)
      .filter((id) => !externalSampleArtifacts[id])

    expect(missingArtifacts).toEqual([])
  })

  it.each(implementedNodeOnlySamples)('type-checks %s through its dedicated project config', (sample) => {
    const artifact = externalSampleArtifacts[sample.id]

    if (!artifact) {
      throw new Error(`Missing node-only artifact config for ${sample.id}.`)
    }

    execFileSync(
      process.execPath,
      ['./node_modules/typescript/bin/tsc', '-p', `${artifact.rootDir}/tsconfig.json`],
      {
        cwd: process.cwd(),
        stdio: 'pipe',
      },
    )
  })
})
