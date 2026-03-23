export type ReleaseRollbackDecisionRunId = `rollback-decision-run-${number}`;
export type ReleaseRollbackMetricId = `rollback-metric-${number}`;
export type ReleaseRollbackSignoffId = `rollback-signoff-${number}`;
export type ReleaseRollbackDecisionAuditEventId =
  `rollback-decision-audit-${number}`;

export interface ReleaseRollbackDecisionRun {
  readonly id: ReleaseRollbackDecisionRunId;
  readonly title: string;
  readonly summary: string;
  readonly stage:
    | "draft"
    | "resolving-matrix"
    | "awaiting-quorum"
    | "ready-to-execute"
    | "executed";
  readonly recommendedAction: "rollback" | "hold";
  readonly publishBlockedReason: string | null;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseRollbackMetric {
  readonly id: ReleaseRollbackMetricId;
  readonly label: string;
  readonly currentValue: string;
  readonly threshold: string;
  readonly source: string;
  readonly recommendation: "rollback" | "hold";
  readonly status: "aligned" | "conflicting" | "resolved";
  readonly note: string;
}

export interface ReleaseRollbackSignoff {
  readonly id: ReleaseRollbackSignoffId;
  readonly owner: string;
  readonly role: string;
  readonly status: "pending" | "approved";
  readonly note: string;
}

export interface ReleaseRollbackDecisionAuditEvent {
  readonly id: ReleaseRollbackDecisionAuditEventId;
  readonly actor: string;
  readonly action: "initiated" | "resolved" | "approved" | "executed";
  readonly detail: string;
  readonly timestamp: string;
}

export interface ReleaseRollbackDecisionWorkspaceResponse {
  readonly refreshedAt: string;
  readonly run: ReleaseRollbackDecisionRun;
  readonly metrics: readonly ReleaseRollbackMetric[];
  readonly signoffs: readonly ReleaseRollbackSignoff[];
  readonly auditEvents: readonly ReleaseRollbackDecisionAuditEvent[];
}

export interface StartReleaseRollbackDecisionInput {
  readonly runId: ReleaseRollbackDecisionRunId;
}

export interface ResolveReleaseRollbackMetricInput {
  readonly metricId: ReleaseRollbackMetricId;
  readonly decision: "rollback" | "hold";
}

export interface ApproveReleaseRollbackDecisionInput {
  readonly signoffId: ReleaseRollbackSignoffId;
}

export interface ExecuteReleaseRollbackDecisionInput {
  readonly runId: ReleaseRollbackDecisionRunId;
}
