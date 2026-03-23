import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../App'
import MiniSampleStage from '../components/MiniSampleStage'
import { implementedSampleArtifacts } from '../implementedSampleArtifacts'
import { miniSampleCatalog } from '../sampleCatalog'
import { sampleImplementations } from '../sampleImplementations'
import { toSampleHash } from '../sampleRuntime'

const implementedSamples = miniSampleCatalog.filter((sample) => sample.status === 'implemented')
const implementedRouteSamples = implementedSamples.filter((sample) => sample.surface === 'isolated-route')
const implementedArtifactSamples = implementedSamples.filter(
  (sample) => sample.surface === 'node-only' || sample.surface === 'separate-entry' || sample.surface === 'comment-demo',
)
// The test harness splits implemented samples by surface because each surface has a different proof
// of existence: inline components render through MiniSampleStage, while artifact-backed samples are
// verified through files and commands instead of JSX rendering.
const supportedImplementedSurfaces = new Set(
  ['current-app', 'isolated-route', 'separate-entry', 'node-only', 'comment-demo'] as const,
)

describe('sample coverage contract', () => {
  it('keeps every implemented sample on a surface covered by the current test harness', () => {
    const uncoveredSamples = implementedSamples.filter(
      (sample) => !supportedImplementedSurfaces.has(sample.surface),
    )

    expect(uncoveredSamples).toEqual([])
  })

  it('maps every implemented isolated-route sample to a concrete component', () => {
    // This prevents "catalog says implemented, but nothing renders" regressions.
    const missingImplementations = implementedRouteSamples.map((sample) => sample.id).filter((id) => !sampleImplementations[id])

    expect(missingImplementations).toEqual([])
  })

  it('maps every implemented artifact-backed sample to an artifact entry', () => {
    // Artifact-backed samples still count as implemented, but their proof lives in files/commands
    // rather than a component export. This test keeps that alternate contract honest.
    const missingArtifacts = implementedArtifactSamples
      .map((sample) => sample.id)
      .filter((id) => !implementedSampleArtifacts[id])

    expect(missingArtifacts).toEqual([])
  })
})

describe('current integrated lab', () => {
  it('renders the app shell and lazy TypeScript notes', async () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'React 19 + TypeScript 5.9, wired into one project.' }),
    ).toBeTruthy()
    expect(
      await screen.findByRole('heading', { level: 2, name: 'Patterns worth keeping in real projects' }),
    ).toBeTruthy()
  })
})

describe('isolated mini-samples', () => {
  it.each(implementedRouteSamples)('renders %s through the stage hash route', async (sample) => {
    window.location.hash = toSampleHash(sample.id)

    render(<MiniSampleStage />)

    expect(await screen.findByRole('heading', { level: 2, name: sample.title })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: sample.title })).toBeTruthy()
    expect(screen.queryByText('Implementation slot reserved.')).toBeNull()
  })
})

describe('implemented artifact-backed samples', () => {
  it.each(implementedArtifactSamples)('renders artifact implementation details for %s', async (sample) => {
    const artifact = implementedSampleArtifacts[sample.id]
    window.location.hash = toSampleHash(sample.id)

    render(<MiniSampleStage />)

    expect(await screen.findByRole('heading', { level: 2, name: sample.title })).toBeTruthy()
    expect(screen.getByText('Implemented on a different sample surface.')).toBeTruthy()
    expect(screen.getByText(artifact?.entryPoint ?? '')).toBeTruthy()
    expect(screen.queryByText('Implementation slot reserved.')).toBeNull()
  })
})
