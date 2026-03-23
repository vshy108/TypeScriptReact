export type ReleaseRollbackRunId = `rollback-run-${number}`;
export type ReleaseRollbackRegionId = `rollback-region-${number}`;
export type ReleaseRollbackDependencyId = `rollback-dependency-${number}`;

export interface ReleaseRollbackRun {
  readonly id: ReleaseRollbackRunId;
  readonly title: string;
  readonly summary: string;
  readonly stage: "draft" | "rolling-back" | "partial-recovery" | "completed";
  readonly targetedRegionIds: readonly ReleaseRollbackRegionId[];
  readonly activeRegionId: ReleaseRollbackRegionId | null;
  readonly recoverySummary: string | null;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseRollbackRegion {
  readonly id: ReleaseRollbackRegionId;
  readonly name: string;
  readonly trafficPercent: number;
  readonly status:
    | "stable"
    | "targeted"
    | "rolling-back"
    | "rolled-back"
    | "recovering";
  readonly note: string;
}

export interface ReleaseRollbackDependency {
  readonly id: ReleaseRollbackDependencyId;
  readonly owner: string;
  readonly action: string;
  readonly status: "pending" | "acknowledged";
}

export interface ReleaseRollbackWorkspaceResponse {
  readonly refreshedAt: string;
  readonly run: ReleaseRollbackRun;
  readonly regions: readonly ReleaseRollbackRegion[];
  readonly dependencies: readonly ReleaseRollbackDependency[];
}

export interface StartReleaseRollbackInput {
  readonly runId: ReleaseRollbackRunId;
}

export interface AcknowledgeReleaseRollbackDependencyInput {
  readonly dependencyId: ReleaseRollbackDependencyId;
}

export interface ResumeReleaseRollbackRecoveryInput {
  readonly runId: ReleaseRollbackRunId;
}
