export type ReleaseRollbackWaiverRunId = `rollback-waiver-run-${number}`;
export type ReleaseRollbackWaiverLedgerId = `rollback-waiver-ledger-${number}`;
export type ReleaseRollbackExceptionId = `rollback-exception-${number}`;
export type ReleaseRollbackWaiverAuditEventId =
  `rollback-waiver-audit-${number}`;

export interface ReleaseRollbackWaiverRun {
  readonly id: ReleaseRollbackWaiverRunId;
  readonly title: string;
  readonly summary: string;
  readonly stage:
    | "draft"
    | "ledger-review"
    | "expired-exception-review"
    | "approver-signoff"
    | "ready-to-publish"
    | "published";
  readonly activeLedgerId: ReleaseRollbackWaiverLedgerId | null;
  readonly publishBlockedReason: string | null;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseRollbackWaiverLedger {
  readonly id: ReleaseRollbackWaiverLedgerId;
  readonly label: string;
  readonly owner: string;
  readonly scope: string;
  readonly status: "queued" | "awaiting-review" | "approved" | "published";
  readonly note: string;
}

export interface ReleaseRollbackException {
  readonly id: ReleaseRollbackExceptionId;
  readonly ledger: string;
  readonly staleException: string;
  readonly revisedException: string;
  readonly reason: string;
  readonly status: "current" | "stale" | "invalidated" | "approved";
}

export interface ReleaseRollbackWaiverAuditEvent {
  readonly id: ReleaseRollbackWaiverAuditEventId;
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

export interface ReleaseRollbackWaiverWorkspaceResponse {
  readonly refreshedAt: string;
  readonly run: ReleaseRollbackWaiverRun;
  readonly ledgers: readonly ReleaseRollbackWaiverLedger[];
  readonly exceptions: readonly ReleaseRollbackException[];
  readonly auditEvents: readonly ReleaseRollbackWaiverAuditEvent[];
}

export interface StartReleaseRollbackWaiverInput {
  readonly runId: ReleaseRollbackWaiverRunId;
}

export interface ApproveReleaseRollbackWaiverLedgerInput {
  readonly ledgerId: ReleaseRollbackWaiverLedgerId;
}

export interface InvalidateReleaseRollbackExceptionsInput {
  readonly runId: ReleaseRollbackWaiverRunId;
}

export interface SignOffReleaseRollbackWaiverInput {
  readonly runId: ReleaseRollbackWaiverRunId;
}

export interface PublishReleaseRollbackWaiverInput {
  readonly runId: ReleaseRollbackWaiverRunId;
}
