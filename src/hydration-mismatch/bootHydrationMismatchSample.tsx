import { hydrateRoot, type HydrationOptions } from 'react-dom/client'
import HydrationMismatchApp from './HydrationMismatchApp'
import { hydrationMismatchRootId } from './hydrationMismatchData'

export interface BootHydrationMismatchSampleOptions {
  readonly container?: Element | null
  readonly onRecoverableError?: HydrationOptions['onRecoverableError']
}

export function bootHydrationMismatchSample({
  container = document.getElementById(hydrationMismatchRootId),
  onRecoverableError,
}: BootHydrationMismatchSampleOptions = {}) {
  if (!container) {
    throw new Error(`Missing hydration mismatch container #${hydrationMismatchRootId}.`)
  }

  const hydrationOptions: HydrationOptions = {
    identifierPrefix: 'hydration-mismatch-lab-',
    ...(onRecoverableError ? { onRecoverableError } : {}),
  }

  return hydrateRoot(container, <HydrationMismatchApp />, hydrationOptions)
}
