export type ReleasePostRollbackRunId = `post-rollback-run-${number}`;
export type ReleasePostRollbackSegmentId = `post-rollback-segment-${number}`;
export type ReleasePostRollbackForkId = `post-rollback-fork-${number}`;
export type ReleasePostRollbackAuditEventId = `post-rollback-audit-${number}`;

export interface ReleasePostRollbackRun {
  readonly id: ReleasePostRollbackRunId;
  readonly title: string;
  readonly summary: string;
  readonly stage:
    | "draft"
    | "scheduling-segments"
    | "fork-review"
    | "ready-to-publish"
    | "published";
  readonly activeSegmentId: ReleasePostRollbackSegmentId | null;
  readonly publishBlockedReason: string | null;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleasePostRollbackSegment {
  readonly id: ReleasePostRollbackSegmentId;
  readonly label: string;
  readonly region: string;
  readonly audience: string;
  readonly sendWindow: string;
  readonly status: "queued" | "scheduled" | "ready" | "published";
  readonly note: string;
}

export interface ReleasePostRollbackMessageFork {
  readonly id: ReleasePostRollbackForkId;
  readonly label: string;
  readonly baseline: string;
  readonly escalationSafe: string;
  readonly status: "pending-review" | "approved";
}

export interface ReleasePostRollbackAuditEvent {
  readonly id: ReleasePostRollbackAuditEventId;
  readonly actor: string;
  readonly action: "initiated" | "scheduled" | "approved" | "published";
  readonly detail: string;
  readonly timestamp: string;
}

export interface ReleasePostRollbackWorkspaceResponse {
  readonly refreshedAt: string;
  readonly run: ReleasePostRollbackRun;
  readonly segments: readonly ReleasePostRollbackSegment[];
  readonly messageForks: readonly ReleasePostRollbackMessageFork[];
  readonly auditEvents: readonly ReleasePostRollbackAuditEvent[];
}

export interface StartReleasePostRollbackInput {
  readonly runId: ReleasePostRollbackRunId;
}

export interface ScheduleReleasePostRollbackSegmentInput {
  readonly segmentId: ReleasePostRollbackSegmentId;
}

export interface ApproveReleasePostRollbackForksInput {
  readonly runId: ReleasePostRollbackRunId;
}

export interface PublishReleasePostRollbackInput {
  readonly runId: ReleasePostRollbackRunId;
}
