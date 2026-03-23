import '../index.css'
import '../hydration/hydration.css'
import { bootHydrationMismatchSample } from './bootHydrationMismatchSample'

bootHydrationMismatchSample({
  onRecoverableError(error) {
    console.warn('Recoverable hydration mismatch in the mismatch demo.', error)
  },
})
