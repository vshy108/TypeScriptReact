export type ReleaseRecoveryCreditRunId = `recovery-credit-run-${number}`;
export type ReleaseRecoveryCreditLedgerId = `recovery-credit-ledger-${number}`;
export type ReleaseRecoveryCreditId = `recovery-credit-${number}`;
export type ReleaseRecoveryCreditAuditEventId =
  `recovery-credit-audit-${number}`;

export interface ReleaseRecoveryCreditRun {
  readonly id: ReleaseRecoveryCreditRunId;
  readonly title: string;
  readonly summary: string;
  readonly stage:
    | "draft"
    | "ledger-review"
    | "stale-credit-review"
    | "approver-signoff"
    | "ready-to-publish"
    | "published";
  readonly activeLedgerId: ReleaseRecoveryCreditLedgerId | null;
  readonly publishBlockedReason: string | null;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseRecoveryCreditLedger {
  readonly id: ReleaseRecoveryCreditLedgerId;
  readonly label: string;
  readonly owner: string;
  readonly audience: string;
  readonly status: "queued" | "awaiting-review" | "approved" | "published";
  readonly note: string;
}

export interface ReleaseRecoveryCredit {
  readonly id: ReleaseRecoveryCreditId;
  readonly ledger: string;
  readonly staleCredit: string;
  readonly revisedCredit: string;
  readonly reason: string;
  readonly status: "current" | "stale" | "invalidated" | "approved";
}

export interface ReleaseRecoveryCreditAuditEvent {
  readonly id: ReleaseRecoveryCreditAuditEventId;
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

export interface ReleaseRecoveryCreditWorkspaceResponse {
  readonly refreshedAt: string;
  readonly run: ReleaseRecoveryCreditRun;
  readonly ledgers: readonly ReleaseRecoveryCreditLedger[];
  readonly credits: readonly ReleaseRecoveryCredit[];
  readonly auditEvents: readonly ReleaseRecoveryCreditAuditEvent[];
}

export interface StartReleaseRecoveryCreditInput {
  readonly runId: ReleaseRecoveryCreditRunId;
}

export interface ApproveReleaseRecoveryCreditLedgerInput {
  readonly ledgerId: ReleaseRecoveryCreditLedgerId;
}

export interface InvalidateReleaseRecoveryCreditsInput {
  readonly runId: ReleaseRecoveryCreditRunId;
}

export interface SignOffReleaseRecoveryCreditInput {
  readonly runId: ReleaseRecoveryCreditRunId;
}

export interface PublishReleaseRecoveryCreditInput {
  readonly runId: ReleaseRecoveryCreditRunId;
}
