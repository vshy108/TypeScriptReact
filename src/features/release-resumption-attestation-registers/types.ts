export type ReleaseResumptionAttestationRunId =
  `resumption-attestation-run-${number}`;
export type ReleaseResumptionAttestationRegisterId =
  `resumption-attestation-register-${number}`;
export type ReleaseResumptionAttestationCheckId =
  `resumption-attestation-check-${number}`;
export type ReleaseResumptionAttestationAuditEventId =
  `resumption-attestation-audit-${number}`;

export interface ReleaseResumptionAttestationRun {
  readonly id: ReleaseResumptionAttestationRunId;
  readonly title: string;
  readonly summary: string;
  readonly stage:
    | "draft"
    | "register-review"
    | "stale-check-review"
    | "approver-signoff"
    | "ready-to-publish"
    | "published";
  readonly activeRegisterId: ReleaseResumptionAttestationRegisterId | null;
  readonly publishBlockedReason: string | null;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseResumptionAttestationRegister {
  readonly id: ReleaseResumptionAttestationRegisterId;
  readonly label: string;
  readonly owner: string;
  readonly audience: string;
  readonly status: "queued" | "awaiting-review" | "approved" | "published";
  readonly note: string;
}

export interface ReleaseResumptionAttestationCheck {
  readonly id: ReleaseResumptionAttestationCheckId;
  readonly register: string;
  readonly staleCheck: string;
  readonly revisedCheck: string;
  readonly reason: string;
  readonly status: "current" | "stale" | "invalidated" | "approved";
}

export interface ReleaseResumptionAttestationAuditEvent {
  readonly id: ReleaseResumptionAttestationAuditEventId;
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

export interface ReleaseResumptionAttestationWorkspaceResponse {
  readonly refreshedAt: string;
  readonly run: ReleaseResumptionAttestationRun;
  readonly registers: readonly ReleaseResumptionAttestationRegister[];
  readonly checks: readonly ReleaseResumptionAttestationCheck[];
  readonly auditEvents: readonly ReleaseResumptionAttestationAuditEvent[];
}

export interface StartReleaseResumptionAttestationInput {
  readonly runId: ReleaseResumptionAttestationRunId;
}

export interface ApproveReleaseResumptionAttestationRegisterInput {
  readonly registerId: ReleaseResumptionAttestationRegisterId;
}

export interface InvalidateReleaseResumptionAttestationChecksInput {
  readonly runId: ReleaseResumptionAttestationRunId;
}

export interface SignOffReleaseResumptionAttestationInput {
  readonly runId: ReleaseResumptionAttestationRunId;
}

export interface PublishReleaseResumptionAttestationInput {
  readonly runId: ReleaseResumptionAttestationRunId;
}
