export type ReleaseRelaunchExceptionRunId = `relaunch-exception-run-${number}`;
export type ReleaseRelaunchRegisterId = `relaunch-register-${number}`;
export type ReleaseRelaunchThresholdId = `relaunch-threshold-${number}`;
export type ReleaseRelaunchExceptionAuditEventId =
  `relaunch-exception-audit-${number}`;

export interface ReleaseRelaunchExceptionRun {
  readonly id: ReleaseRelaunchExceptionRunId;
  readonly title: string;
  readonly summary: string;
  readonly stage:
    | "draft"
    | "register-review"
    | "stale-threshold-review"
    | "approver-signoff"
    | "ready-to-publish"
    | "published";
  readonly activeRegisterId: ReleaseRelaunchRegisterId | null;
  readonly publishBlockedReason: string | null;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseRelaunchRegister {
  readonly id: ReleaseRelaunchRegisterId;
  readonly label: string;
  readonly owner: string;
  readonly audience: string;
  readonly status: "queued" | "awaiting-review" | "approved" | "published";
  readonly note: string;
}

export interface ReleaseRelaunchThreshold {
  readonly id: ReleaseRelaunchThresholdId;
  readonly register: string;
  readonly staleThreshold: string;
  readonly revisedThreshold: string;
  readonly reason: string;
  readonly status: "current" | "stale" | "invalidated" | "approved";
}

export interface ReleaseRelaunchExceptionAuditEvent {
  readonly id: ReleaseRelaunchExceptionAuditEventId;
  readonly actor: string;
  readonly action:
    | "initiated"
    | "approved"
    | "invalidated"
    | "signed-off"
    | "published";
  readonly detail: string;
  readonly timestamp: string;
}

export interface ReleaseRelaunchExceptionWorkspaceResponse {
  readonly refreshedAt: string;
  readonly run: ReleaseRelaunchExceptionRun;
  readonly registers: readonly ReleaseRelaunchRegister[];
  readonly thresholds: readonly ReleaseRelaunchThreshold[];
  readonly auditEvents: readonly ReleaseRelaunchExceptionAuditEvent[];
}

export interface StartReleaseRelaunchExceptionInput {
  readonly runId: ReleaseRelaunchExceptionRunId;
}

export interface ApproveReleaseRelaunchRegisterInput {
  readonly registerId: ReleaseRelaunchRegisterId;
}

export interface InvalidateReleaseRelaunchThresholdsInput {
  readonly runId: ReleaseRelaunchExceptionRunId;
}

export interface SignOffReleaseRelaunchExceptionInput {
  readonly runId: ReleaseRelaunchExceptionRunId;
}

export interface PublishReleaseRelaunchExceptionInput {
  readonly runId: ReleaseRelaunchExceptionRunId;
}
