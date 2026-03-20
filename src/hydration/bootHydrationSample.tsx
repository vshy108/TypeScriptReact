import { hydrateRoot, type HydrationOptions } from 'react-dom/client'
import {
  preconnect,
  prefetchDNS,
  preinit,
  preinitModule,
  preload,
  preloadModule,
} from 'react-dom'
import HydrationHintsApp from './HydrationHintsApp'
import { hydrationRootId } from './hydrationData'

export interface BootHydrationSampleOptions {
  readonly container?: Element | null
  readonly onRecoverableError?: HydrationOptions['onRecoverableError']
}

function registerHydrationHints() {
  // prefetchDNS asks the browser to resolve a hostname early before any specific asset URL is requested.
  prefetchDNS('https://fonts.googleapis.com')
  // preconnect goes further by opening the socket and TLS handshake ahead of the eventual fetch.
  preconnect('https://fonts.gstatic.com', { crossOrigin: 'anonymous' })
  // preload fetches a concrete asset while hydration is still attaching to the HTML shell.
  preload('/hydration/diagram.svg', { as: 'image', fetchPriority: 'high' })
  // preinit prepares a stylesheet or classic script so it is already ready when the hydrated UI needs it.
  preinit('/hydration/critical.css', { as: 'style', precedence: 'high' })
  // preloadModule begins fetching a module graph before user interaction reaches that code path.
  preloadModule('/hydration/preview-module.js', { as: 'script' })
  // preinitModule prepares a module script so later imports can evaluate without another preparation step.
  preinitModule('/hydration/preview-module.js')
}

export function bootHydrationSample({
  container = document.getElementById(hydrationRootId),
  onRecoverableError,
}: BootHydrationSampleOptions = {}) {
  if (!container) {
    throw new Error(`Missing hydration container #${hydrationRootId}.`)
  }

  registerHydrationHints()

  const hydrationOptions: HydrationOptions = {
    identifierPrefix: 'hydration-lab-',
    ...(onRecoverableError ? { onRecoverableError } : {}),
  }

  // hydrateRoot attaches React to matching server HTML instead of discarding it and repainting from scratch.
  return hydrateRoot(container, <HydrationHintsApp />, hydrationOptions)
}
