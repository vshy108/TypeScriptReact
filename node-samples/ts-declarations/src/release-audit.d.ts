declare global {
  type TraceId = `trace-${string}`
  type AuditStamp = `AUDIT-${number}`

  interface ReleaseAuditEnvelope {
    readonly auditStamp: AuditStamp
    readonly reviewer: string
    readonly approvedChannels: readonly ('beta' | 'stable')[]
  }
}

export {}
