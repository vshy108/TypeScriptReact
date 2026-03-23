import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { bootHydrationMismatchSample } from '../hydration-mismatch/bootHydrationMismatchSample'
import {
  clientRenderedChecksum,
  hydrationMismatchRootId,
  recoveredMismatchStatus,
  serverRenderedChecksum,
} from '../hydration-mismatch/hydrationMismatchData'
import { implementedSampleArtifacts } from '../implementedSampleArtifacts'

function loadHtmlEntry(entryHtml: string) {
  const html = readFileSync(resolve(process.cwd(), entryHtml), 'utf8')
  const parsedDocument = new DOMParser().parseFromString(html, 'text/html')

  document.head.innerHTML = parsedDocument.head.innerHTML
  document.body.innerHTML = parsedDocument.body.innerHTML
}

describe('hydration mismatch entry', () => {
  let activeRoot: ReturnType<typeof bootHydrationMismatchSample> | null = null

  beforeEach(() => {
    const artifact = implementedSampleArtifacts['sample-react-hydration-mismatch']

    if (!artifact?.entryHtml) {
      throw new Error('Missing HTML entry for sample-react-hydration-mismatch.')
    }

    loadHtmlEntry(artifact.entryHtml)
  })

  afterEach(() => {
    activeRoot?.unmount()
    activeRoot = null
  })

  it('reports a recoverable hydration mismatch and patches the client text', async () => {
    const recoverableErrors: unknown[] = []

    expect(document.getElementById(hydrationMismatchRootId)).toBeTruthy()
    expect(screen.getByText(serverRenderedChecksum)).toBeTruthy()

    activeRoot = bootHydrationMismatchSample({
      onRecoverableError(error) {
        recoverableErrors.push(error)
      },
    })

    expect(await screen.findByText(clientRenderedChecksum)).toBeTruthy()
    expect(await screen.findByText(recoveredMismatchStatus)).toBeTruthy()
    expect(screen.queryByText(serverRenderedChecksum)).toBeNull()
    expect(recoverableErrors.length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: 'Acknowledge recovery' }))

    expect(await screen.findByText('Reviewed the mismatch recovery path from hydrated controls.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Recovery acknowledged' })).toBeTruthy()
  })
})
