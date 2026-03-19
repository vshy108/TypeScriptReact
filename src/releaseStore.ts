export interface ReleaseSnapshot {
  readonly online: boolean
  readonly preferredScheme: 'light' | 'dark'
  readonly currentTime: string
}

// A tiny browser-backed store used to demonstrate useSyncExternalStore with real external state.
type Listener = () => void

const listeners = new Set<Listener>()

let stopSync: (() => void) | undefined

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

function readPreferredScheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function makeSnapshot(): ReleaseSnapshot {
  if (typeof window === 'undefined') {
    return {
      online: true,
      preferredScheme: 'light',
      currentTime: '--:--:--',
    }
  }

  return {
    online: window.navigator.onLine,
    preferredScheme: readPreferredScheme(),
    currentTime: formatTime(new Date()),
  }
}

let snapshot = makeSnapshot()

function emitChange() {
  snapshot = makeSnapshot()
  listeners.forEach((listener) => listener())
}

// Start syncing browser events only while at least one React subscriber is mounted.
function ensureSync() {
  if (stopSync || typeof window === 'undefined') {
    return
  }

  const intervalId = window.setInterval(emitChange, 1_000)
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  window.addEventListener('online', emitChange)
  window.addEventListener('offline', emitChange)
  mediaQuery.addEventListener('change', emitChange)

  stopSync = () => {
    window.clearInterval(intervalId)
    window.removeEventListener('online', emitChange)
    window.removeEventListener('offline', emitChange)
    mediaQuery.removeEventListener('change', emitChange)
    stopSync = undefined
  }
}

export function subscribe(listener: Listener) {
  listeners.add(listener)
  ensureSync()

  return () => {
    listeners.delete(listener)

    if (!listeners.size) {
      stopSync?.()
    }
  }
}

export function getSnapshot() {
  return snapshot
}

export function getServerSnapshot(): ReleaseSnapshot {
  return {
    online: true,
    preferredScheme: 'light',
    currentTime: '--:--:--',
  }
}
