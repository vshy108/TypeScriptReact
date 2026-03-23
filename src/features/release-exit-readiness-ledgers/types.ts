export type ReleaseExitReadinessRunId = `exit-readiness-run-${number}`;
export type ReleaseExitReadinessLedgerId = `exit-readiness-ledger-${number}`;
export type ReleaseExitReadinessCriterionId =
  `exit-readiness-criterion-${number}`;
export type ReleaseExitReadinessAuditEventId = `exit-readiness-audit-${number}`;

export interface ReleaseExitReadinessRun {
  readonly id: ReleaseExitReadinessRunId;
  readonly title: string;
  readonly summary: string;
  readonly stage:
    | "draft"
    | "ledger-review"
    | "stale-criterion-review"
    | "approver-signoff"
    | "ready-to-publish"
    | "published";
  readonly activeLedgerId: ReleaseExitReadinessLedgerId | null;
  readonly publishBlockedReason: string | null;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseExitReadinessLedger {
  readonly id: ReleaseExitReadinessLedgerId;
  readonly label: string;
  readonly owner: string;
  readonly audience: string;
  readonly status: "queued" | "awaiting-review" | "approved" | "published";
  readonly note: string;
}

export interface ReleaseExitReadinessCriterion {
  readonly id: ReleaseExitReadinessCriterionId;
  readonly ledger: string;
  readonly staleCriterion: string;
  readonly revisedCriterion: string;
  readonly reason: string;
  readonly status: "current" | "stale" | "invalidated" | "approved";
}

export interface ReleaseExitReadinessAuditEvent {
  readonly id: ReleaseExitReadinessAuditEventId;
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

export interface ReleaseExitReadinessWorkspaceResponse {
  readonly refreshedAt: string;
  readonly run: ReleaseExitReadinessRun;
  readonly ledgers: readonly ReleaseExitReadinessLedger[];
  readonly criteria: readonly ReleaseExitReadinessCriterion[];
  readonly auditEvents: readonly ReleaseExitReadinessAuditEvent[];
}

export interface StartReleaseExitReadinessInput {
  readonly runId: ReleaseExitReadinessRunId;
}

export interface ApproveReleaseExitReadinessLedgerInput {
  readonly ledgerId: ReleaseExitReadinessLedgerId;
}

export interface InvalidateReleaseExitReadinessCriteriaInput {
  readonly runId: ReleaseExitReadinessRunId;
}

export interface SignOffReleaseExitReadinessInput {
  readonly runId: ReleaseExitReadinessRunId;
}

export interface PublishReleaseExitReadinessInput {
  readonly runId: ReleaseExitReadinessRunId;
}
