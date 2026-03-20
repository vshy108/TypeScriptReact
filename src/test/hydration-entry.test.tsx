import { screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { bootHydrationSample } from '../hydration/bootHydrationSample'
import HydrationHintsApp from '../hydration/HydrationHintsApp'
import { hydratedStatus, hydrationRootId, initialHydrationStatus } from '../hydration/hydrationData'

describe('hydration hints entry', () => {
  let activeRoot: ReturnType<typeof bootHydrationSample> | null = null

  beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = `<div id="${hydrationRootId}">${renderToStaticMarkup(<HydrationHintsApp />)}</div>`
  })

  afterEach(() => {
    activeRoot?.unmount()
    activeRoot = null
  })

  it('hydrates the pre-rendered shell and registers the resource hints', async () => {
    const recoverableErrors: unknown[] = []
    activeRoot = bootHydrationSample({
      onRecoverableError(error) {
        recoverableErrors.push(error)
      },
    })

    expect(screen.getByText(initialHydrationStatus)).toBeTruthy()
    expect(document.head.querySelector('link[rel="dns-prefetch"][href="https://fonts.googleapis.com"]')).toBeTruthy()
    expect(document.head.querySelector('link[rel="preconnect"][href="https://fonts.gstatic.com"]')).toBeTruthy()
    expect(document.head.querySelector('link[rel="preload"][href="/hydration/diagram.svg"]')).toBeTruthy()
    expect(document.head.querySelector('link[rel="stylesheet"][href="/hydration/critical.css"]')).toBeTruthy()
    expect(document.head.querySelector('link[rel="modulepreload"][href="/hydration/preview-module.js"]')).toBeTruthy()

    expect(await screen.findByText(hydratedStatus)).toBeTruthy()
    expect(
      await screen.findByText('hydrateRoot() preserved the server shell and attached event handlers.'),
    ).toBeTruthy()
    expect(recoverableErrors).toEqual([])
  })
})

