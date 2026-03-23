export type ReleaseReadinessId = `release-${number}`;
export type ReleaseChannel = "canary" | "beta" | "stable";
export type ReleaseStage = "qa" | "approval" | "rolling-out" | "paused";
export type ApprovalStatus = "approved" | "pending" | "blocked";
export type RiskSeverity = "low" | "medium" | "high";

export interface ReleaseApprovalStep {
  readonly id: `approval-${number}`;
  readonly label: string;
  readonly owner: string;
  readonly status: ApprovalStatus;
  readonly note: string;
}

export interface ReleaseRisk {
  readonly id: `risk-${number}`;
  readonly summary: string;
  readonly severity: RiskSeverity;
  readonly mitigation: string;
  readonly open: boolean;
}

export interface ReleaseBuildHealth {
  readonly passed: number;
  readonly total: number;
}

export interface ReleaseReadinessSnapshot {
  readonly id: ReleaseReadinessId;
  readonly name: string;
  readonly owner: string;
  readonly channel: ReleaseChannel;
  readonly stage: ReleaseStage;
  readonly rolloutPercent: number;
  readonly scheduledAt: string;
  readonly approvals: readonly ReleaseApprovalStep[];
  readonly risks: readonly ReleaseRisk[];
  readonly buildHealth: ReleaseBuildHealth;
  readonly notes: readonly string[];
}

export interface ReleaseReadinessResponse {
  readonly revision: number;
  readonly loadedAt: string;
  readonly releases: readonly ReleaseReadinessSnapshot[];
}

export type ReleaseOption = Pick<
  ReleaseReadinessSnapshot,
  "id" | "name" | "channel" | "stage"
>;
