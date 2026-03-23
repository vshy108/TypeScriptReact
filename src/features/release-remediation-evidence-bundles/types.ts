export type ReleaseRemediationEvidenceRunId =
  `remediation-evidence-run-${number}`;
export type ReleaseRemediationEvidenceBundleId =
  `remediation-evidence-bundle-${number}`;
export type ReleaseRemediationProofId = `remediation-proof-${number}`;
export type ReleaseRemediationAuditEventId = `remediation-audit-${number}`;

export interface ReleaseRemediationEvidenceRun {
  readonly id: ReleaseRemediationEvidenceRunId;
  readonly title: string;
  readonly summary: string;
  readonly stage:
    | "draft"
    | "bundle-review"
    | "stale-proof-review"
    | "approver-signoff"
    | "ready-to-publish"
    | "published";
  readonly activeBundleId: ReleaseRemediationEvidenceBundleId | null;
  readonly publishBlockedReason: string | null;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseRemediationEvidenceBundle {
  readonly id: ReleaseRemediationEvidenceBundleId;
  readonly label: string;
  readonly owner: string;
  readonly area: string;
  readonly status: "queued" | "awaiting-review" | "approved" | "published";
  readonly note: string;
}

export interface ReleaseRemediationProof {
  readonly id: ReleaseRemediationProofId;
  readonly bundle: string;
  readonly baselineProof: string;
  readonly revisedProof: string;
  readonly reason: string;
  readonly status: "current" | "stale" | "invalidated" | "approved";
}

export interface ReleaseRemediationAuditEvent {
  readonly id: ReleaseRemediationAuditEventId;
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

export interface ReleaseRemediationWorkspaceResponse {
  readonly refreshedAt: string;
  readonly run: ReleaseRemediationEvidenceRun;
  readonly bundles: readonly ReleaseRemediationEvidenceBundle[];
  readonly proofs: readonly ReleaseRemediationProof[];
  readonly auditEvents: readonly ReleaseRemediationAuditEvent[];
}

export interface StartReleaseRemediationEvidenceInput {
  readonly runId: ReleaseRemediationEvidenceRunId;
}

export interface ApproveReleaseRemediationEvidenceBundleInput {
  readonly bundleId: ReleaseRemediationEvidenceBundleId;
}

export interface InvalidateReleaseRemediationProofsInput {
  readonly runId: ReleaseRemediationEvidenceRunId;
}

export interface SignOffReleaseRemediationEvidenceInput {
  readonly runId: ReleaseRemediationEvidenceRunId;
}

export interface PublishReleaseRemediationEvidenceInput {
  readonly runId: ReleaseRemediationEvidenceRunId;
}
