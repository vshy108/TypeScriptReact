export type ReleaseDelegatedApprovalRunId = `delegated-approval-run-${number}`;
export type ReleaseDelegatedApprovalBundleId = `delegated-bundle-${number}`;
export type ReleaseDelegatedApprovalEvidenceId = `delegated-evidence-${number}`;
export type ReleaseDelegatedApprovalAuditEventId = `delegated-audit-${number}`;

export interface ReleaseDelegatedApprovalRun {
  readonly id: ReleaseDelegatedApprovalRunId;
  readonly title: string;
  readonly summary: string;
  readonly stage:
    | "draft"
    | "collecting-approvals"
    | "replaying-evidence"
    | "ready-to-publish"
    | "published";
  readonly activeBundleId: ReleaseDelegatedApprovalBundleId | null;
  readonly publishBlockedReason: string | null;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseDelegatedApprovalBundle {
  readonly id: ReleaseDelegatedApprovalBundleId;
  readonly label: string;
  readonly primaryApprover: string;
  readonly delegateApprover: string;
  readonly currentApprover: string;
  readonly expiresInSeconds: number | null;
  readonly status: "queued" | "awaiting-approval" | "delegated" | "approved";
  readonly note: string;
}

export interface ReleaseDelegatedApprovalEvidence {
  readonly id: ReleaseDelegatedApprovalEvidenceId;
  readonly title: string;
  readonly status: "pending-replay" | "replayed";
  readonly note: string;
}

export interface ReleaseDelegatedApprovalAuditEvent {
  readonly id: ReleaseDelegatedApprovalAuditEventId;
  readonly actor: string;
  readonly action:
    | "initiated"
    | "delegated"
    | "approved"
    | "replayed"
    | "published";
  readonly detail: string;
  readonly timestamp: string;
}

export interface ReleaseDelegatedApprovalWorkspaceResponse {
  readonly refreshedAt: string;
  readonly run: ReleaseDelegatedApprovalRun;
  readonly bundles: readonly ReleaseDelegatedApprovalBundle[];
  readonly evidence: readonly ReleaseDelegatedApprovalEvidence[];
  readonly auditEvents: readonly ReleaseDelegatedApprovalAuditEvent[];
}

export interface StartReleaseDelegatedApprovalInput {
  readonly runId: ReleaseDelegatedApprovalRunId;
}

export interface ApproveReleaseDelegatedBundleInput {
  readonly bundleId: ReleaseDelegatedApprovalBundleId;
}

export interface ReplayReleaseDelegatedEvidenceInput {
  readonly runId: ReleaseDelegatedApprovalRunId;
}

export interface PublishReleaseDelegatedApprovalInput {
  readonly runId: ReleaseDelegatedApprovalRunId;
}
