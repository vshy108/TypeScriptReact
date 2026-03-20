import '../index.css'
import './hydration.css'
import { bootHydrationSample } from './bootHydrationSample'

bootHydrationSample({
  onRecoverableError(error) {
    console.warn('Recoverable hydration issue in the hydration hints sample.', error)
  },
})

