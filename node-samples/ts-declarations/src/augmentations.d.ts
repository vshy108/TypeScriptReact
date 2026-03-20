import '../vendor/legacy-release-kit.js'

// Module augmentation layers extra declarations onto the authored module when another file extends its capabilities.
declare module '../vendor/legacy-release-kit.js' {
  interface ReleaseConfig {
    readonly observabilityOwner?: string
  }

  interface ReleaseSession {
    attachTrace(traceId: TraceId): void
    readonly traceId: TraceId | undefined
  }
}
