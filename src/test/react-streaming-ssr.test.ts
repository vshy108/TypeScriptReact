// @vitest-environment node

import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { implementedSampleArtifacts } from '../implementedSampleArtifacts'

describe('react streaming SSR workspace', () => {
  it('compiles and executes the runtime report', () => {
    const artifact = implementedSampleArtifacts['sample-react-streaming-ssr']

    if (!artifact) {
      throw new Error('Missing artifact config for sample-react-streaming-ssr.')
    }

    execFileSync(
      process.execPath,
      ['./node_modules/typescript/bin/tsc', '-p', 'server-samples/react-streaming-ssr/tsconfig.runtime.json'],
      {
        cwd: process.cwd(),
        stdio: 'pipe',
      },
    )

    const output = execFileSync(process.execPath, ['server-samples/react-streaming-ssr/dist/runAllModes.js'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: 'pipe',
    })

    const report = JSON.parse(output) as {
      readonly renderToString: {
        readonly containsFallback: boolean
        readonly containsResolvedContent: boolean
        readonly hasBoundaryMarkers: boolean
      }
      readonly renderToStaticMarkup: {
        readonly containsFallback: boolean
        readonly containsResolvedContent: boolean
        readonly hasBoundaryMarkers: boolean
      }
      readonly renderToReadableStream: {
        readonly containsFallback: boolean
        readonly containsResolvedContent: boolean
      }
      readonly renderToPipeableStream: {
        readonly containsFallback: boolean
        readonly containsResolvedContent: boolean
      }
      readonly prerender: {
        readonly capturedPostponedState: boolean
        readonly containsFallback: boolean
        readonly containsResolvedContent: boolean
      }
      readonly resume: {
        readonly capturedPostponedState: boolean
        readonly preludeContainsFallback: boolean
        readonly resumedContainsResolvedContent: boolean
      }
      readonly prerenderToNodeStream: {
        readonly capturedPostponedState: boolean
        readonly preludeContainsFallback: boolean
      }
      readonly resumeToPipeableStream: {
        readonly capturedPostponedState: boolean
        readonly preludeContainsFallback: boolean
        readonly resumedContainsResolvedContent: boolean
      }
      readonly resumeAndPrerender: {
        readonly containsFallback: boolean
        readonly containsResolvedContent: boolean
      }
      readonly resumeAndPrerenderToNodeStream: {
        readonly containsFallback: boolean
        readonly containsResolvedContent: boolean
      }
    }

    expect(report.renderToString.containsFallback).toBe(true)
    expect(report.renderToString.containsResolvedContent).toBe(false)
    expect(report.renderToString.hasBoundaryMarkers).toBe(true)

    expect(report.renderToStaticMarkup.containsFallback).toBe(true)
    expect(report.renderToStaticMarkup.containsResolvedContent).toBe(false)
    expect(report.renderToStaticMarkup.hasBoundaryMarkers).toBe(false)

    expect(report.renderToReadableStream.containsFallback).toBe(true)
    expect(report.renderToReadableStream.containsResolvedContent).toBe(true)

    expect(report.renderToPipeableStream.containsFallback).toBe(true)
    expect(report.renderToPipeableStream.containsResolvedContent).toBe(true)

    expect(report.prerender.capturedPostponedState).toBe(false)
    expect(report.prerender.containsFallback).toBe(false)
    expect(report.prerender.containsResolvedContent).toBe(true)

    expect(report.resume.capturedPostponedState).toBe(true)
    expect(report.resume.preludeContainsFallback).toBe(true)
    expect(report.resume.resumedContainsResolvedContent).toBe(true)

    expect(report.prerenderToNodeStream.capturedPostponedState).toBe(true)
    expect(report.prerenderToNodeStream.preludeContainsFallback).toBe(true)

    expect(report.resumeToPipeableStream.capturedPostponedState).toBe(true)
    expect(report.resumeToPipeableStream.preludeContainsFallback).toBe(true)
    expect(report.resumeToPipeableStream.resumedContainsResolvedContent).toBe(true)

    expect(report.resumeAndPrerender.containsFallback).toBe(false)
    expect(report.resumeAndPrerender.containsResolvedContent).toBe(true)

    expect(report.resumeAndPrerenderToNodeStream.containsFallback).toBe(false)
    expect(report.resumeAndPrerenderToNodeStream.containsResolvedContent).toBe(true)
  })
})

