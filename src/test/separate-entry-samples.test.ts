// @vitest-environment node

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'
import HydrationHintsApp from '../hydration/HydrationHintsApp'
import { hydrationRootId } from '../hydration/hydrationData'
import { implementedSampleArtifacts } from '../implementedSampleArtifacts'
import { miniSampleCatalog } from '../sampleCatalog'

const implementedSeparateEntrySamples = miniSampleCatalog.filter(
  (sample) => sample.status === 'implemented' && sample.surface === 'separate-entry',
)

function normalizeTagWhitespace(markup: string) {
  return markup.replace(/\s+/g, ' ').replace(/> </g, '><').trim()
}

describe('separate-entry mini-samples', () => {
  it('keeps every implemented separate-entry sample wired to an artifact definition', () => {
    const missingArtifacts = implementedSeparateEntrySamples
      .map((sample) => sample.id)
      .filter((id) => !implementedSampleArtifacts[id])

    expect(missingArtifacts).toEqual([])
  })

  it.each(implementedSeparateEntrySamples)('publishes files for %s', (sample) => {
    const artifact = implementedSampleArtifacts[sample.id]

    if (!artifact) {
      throw new Error(`Missing separate-entry artifact config for ${sample.id}.`)
    }

    expect(existsSync(resolve(process.cwd(), artifact.entryPoint))).toBe(true)
    expect(existsSync(resolve(process.cwd(), artifact.entryHtml ?? ''))).toBe(true)
  })

  it.each(implementedSeparateEntrySamples)('keeps the HTML entry pointing at the module entry for %s', (sample) => {
    const artifact = implementedSampleArtifacts[sample.id]

    if (!artifact?.entryHtml) {
      throw new Error(`Missing HTML entry for separate-entry sample ${sample.id}.`)
    }

    const html = readFileSync(resolve(process.cwd(), artifact.entryHtml), 'utf8')
    expect(html).toContain(artifact.entryPoint)
  })

  it('keeps the hydration HTML shell aligned with the React tree', () => {
    const artifact = implementedSampleArtifacts['sample-react-hydration-hints']

    if (!artifact?.entryHtml) {
      throw new Error('Missing HTML entry for sample-react-hydration-hints.')
    }

    const html = readFileSync(resolve(process.cwd(), artifact.entryHtml), 'utf8')
    const document = new JSDOM(html).window.document
    const rootElement = document.getElementById(hydrationRootId)
    const expectedDocument = new JSDOM(
      `<div id="${hydrationRootId}">${renderToStaticMarkup(createElement(HydrationHintsApp))}</div>`,
    ).window.document

    expect(rootElement).toBeTruthy()
    expect(normalizeTagWhitespace(rootElement?.innerHTML ?? '')).toBe(
      normalizeTagWhitespace(expectedDocument.getElementById(hydrationRootId)?.innerHTML ?? ''),
    )
  })
})
