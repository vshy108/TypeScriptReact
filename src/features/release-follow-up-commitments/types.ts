export type ReleaseFollowUpCommitmentRunId = `follow-up-run-${number}`;
export type ReleaseFollowUpCommitmentId = `follow-up-commitment-${number}`;
export type ReleaseFollowUpEtaDriftId = `follow-up-eta-${number}`;
export type ReleaseFollowUpAuditEventId = `follow-up-audit-${number}`;

export interface ReleaseFollowUpCommitmentRun {
  readonly id: ReleaseFollowUpCommitmentRunId;
  readonly title: string;
  readonly summary: string;
  readonly stage:
    | "draft"
    | "owner-review"
    | "eta-drift-review"
    | "approver-signoff"
    | "ready-to-publish"
    | "published";
  readonly activeCommitmentId: ReleaseFollowUpCommitmentId | null;
  readonly publishBlockedReason: string | null;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseFollowUpCommitment {
  readonly id: ReleaseFollowUpCommitmentId;
  readonly label: string;
  readonly owner: string;
  readonly audience: string;
  readonly status: "queued" | "awaiting-review" | "approved" | "published";
  readonly note: string;
}

export interface ReleaseFollowUpEtaDrift {
  readonly id: ReleaseFollowUpEtaDriftId;
  readonly commitment: string;
  readonly baselineEta: string;
  readonly revisedEta: string;
  readonly reason: string;
  readonly status: "current" | "drifted" | "invalidated" | "approved";
}

export interface ReleaseFollowUpAuditEvent {
  readonly id: ReleaseFollowUpAuditEventId;
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

export interface ReleaseFollowUpWorkspaceResponse {
  readonly refreshedAt: string;
  readonly run: ReleaseFollowUpCommitmentRun;
  readonly commitments: readonly ReleaseFollowUpCommitment[];
  readonly etaDrifts: readonly ReleaseFollowUpEtaDrift[];
  readonly auditEvents: readonly ReleaseFollowUpAuditEvent[];
}

export interface StartReleaseFollowUpInput {
  readonly runId: ReleaseFollowUpCommitmentRunId;
}

export interface ApproveReleaseFollowUpCommitmentInput {
  readonly commitmentId: ReleaseFollowUpCommitmentId;
}

export interface InvalidateReleaseFollowUpEtaDriftsInput {
  readonly runId: ReleaseFollowUpCommitmentRunId;
}

export interface SignOffReleaseFollowUpInput {
  readonly runId: ReleaseFollowUpCommitmentRunId;
}

export interface PublishReleaseFollowUpInput {
  readonly runId: ReleaseFollowUpCommitmentRunId;
}
