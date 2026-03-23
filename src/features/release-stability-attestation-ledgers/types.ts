export type ReleaseStabilityAttestationRunId =
  `stability-attestation-run-${number}`;
export type ReleaseStabilityAttestationLedgerId =
  `stability-attestation-ledger-${number}`;
export type ReleaseStabilityAttestationSignalId =
  `stability-attestation-signal-${number}`;
export type ReleaseStabilityAttestationAuditEventId =
  `stability-attestation-audit-${number}`;

export interface ReleaseStabilityAttestationRun {
  readonly id: ReleaseStabilityAttestationRunId;
  readonly title: string;
  readonly summary: string;
  readonly stage:
    | "draft"
    | "ledger-review"
    | "stale-signal-review"
    | "approver-signoff"
    | "ready-to-publish"
    | "published";
  readonly activeLedgerId: ReleaseStabilityAttestationLedgerId | null;
  readonly publishBlockedReason: string | null;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseStabilityAttestationLedger {
  readonly id: ReleaseStabilityAttestationLedgerId;
  readonly label: string;
  readonly owner: string;
  readonly audience: string;
  readonly status: "queued" | "awaiting-review" | "approved" | "published";
  readonly note: string;
}

export interface ReleaseStabilityAttestationSignal {
  readonly id: ReleaseStabilityAttestationSignalId;
  readonly ledger: string;
  readonly staleSignal: string;
  readonly revisedSignal: string;
  readonly reason: string;
  readonly status: "current" | "stale" | "invalidated" | "approved";
}

export interface ReleaseStabilityAttestationAuditEvent {
  readonly id: ReleaseStabilityAttestationAuditEventId;
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

export interface ReleaseStabilityAttestationWorkspaceResponse {
  readonly refreshedAt: string;
  readonly run: ReleaseStabilityAttestationRun;
  readonly ledgers: readonly ReleaseStabilityAttestationLedger[];
  readonly signals: readonly ReleaseStabilityAttestationSignal[];
  readonly auditEvents: readonly ReleaseStabilityAttestationAuditEvent[];
}

export interface StartReleaseStabilityAttestationInput {
  readonly runId: ReleaseStabilityAttestationRunId;
}

export interface ApproveReleaseStabilityAttestationLedgerInput {
  readonly ledgerId: ReleaseStabilityAttestationLedgerId;
}

export interface InvalidateReleaseStabilityAttestationSignalsInput {
  readonly runId: ReleaseStabilityAttestationRunId;
}

export interface SignOffReleaseStabilityAttestationInput {
  readonly runId: ReleaseStabilityAttestationRunId;
}

export interface PublishReleaseStabilityAttestationInput {
  readonly runId: ReleaseStabilityAttestationRunId;
}
