export type ReleaseRemediationReadinessRunId =
  `remediation-readiness-run-${number}`;
export type ReleaseRemediationReadinessRegistryId =
  `remediation-readiness-registry-${number}`;
export type ReleaseRemediationReadinessEvidenceId =
  `remediation-readiness-evidence-${number}`;
export type ReleaseRemediationReadinessAuditEventId =
  `remediation-readiness-audit-${number}`;

export interface ReleaseRemediationReadinessRun {
  readonly id: ReleaseRemediationReadinessRunId;
  readonly title: string;
  readonly summary: string;
  readonly stage:
    | "draft"
    | "registry-review"
    | "stale-evidence-review"
    | "approver-signoff"
    | "ready-to-publish"
    | "published";
  readonly activeRegistryId: ReleaseRemediationReadinessRegistryId | null;
  readonly publishBlockedReason: string | null;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseRemediationReadinessRegistry {
  readonly id: ReleaseRemediationReadinessRegistryId;
  readonly label: string;
  readonly owner: string;
  readonly lane: string;
  readonly status: "queued" | "awaiting-review" | "approved" | "published";
  readonly note: string;
}

export interface ReleaseRemediationReadinessEvidence {
  readonly id: ReleaseRemediationReadinessEvidenceId;
  readonly registry: string;
  readonly staleEvidence: string;
  readonly revisedEvidence: string;
  readonly reason: string;
  readonly status: "current" | "stale" | "invalidated" | "approved";
}

export interface ReleaseRemediationReadinessAuditEvent {
  readonly id: ReleaseRemediationReadinessAuditEventId;
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

export interface ReleaseRemediationReadinessWorkspaceResponse {
  readonly refreshedAt: string;
  readonly run: ReleaseRemediationReadinessRun;
  readonly registries: readonly ReleaseRemediationReadinessRegistry[];
  readonly evidenceRows: readonly ReleaseRemediationReadinessEvidence[];
  readonly auditEvents: readonly ReleaseRemediationReadinessAuditEvent[];
}

export interface StartReleaseRemediationReadinessInput {
  readonly runId: ReleaseRemediationReadinessRunId;
}

export interface ApproveReleaseRemediationReadinessRegistryInput {
  readonly registryId: ReleaseRemediationReadinessRegistryId;
}

export interface InvalidateReleaseRemediationReadinessEvidenceInput {
  readonly runId: ReleaseRemediationReadinessRunId;
}

export interface SignOffReleaseRemediationReadinessInput {
  readonly runId: ReleaseRemediationReadinessRunId;
}

export interface PublishReleaseRemediationReadinessInput {
  readonly runId: ReleaseRemediationReadinessRunId;
}
