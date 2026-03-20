export type ReleaseStage = 'prepare' | 'publish' | 'rollback'

// Declaration files describe the public API of an untyped runtime module without rewriting that runtime in TypeScript.
export interface ReleaseConfig {
  readonly channel: 'beta' | 'stable'
  readonly owner: string
}

// Declaration merging lets the same interface grow in layers, which is common when library types are assembled across files.
export interface ReleaseConfig {
  readonly checklist?: readonly string[]
}

export interface ReleaseRunReport {
  readonly stage: ReleaseStage
  readonly summary: string
  readonly checklist: readonly string[]
}

export interface ReleaseSession {
  readonly config: ReleaseConfig
  run(stage: ReleaseStage): ReleaseRunReport
  summarize(): string
}

export function createReleaseSession(config: ReleaseConfig): ReleaseSession
export const declarationSampleVersion: string
