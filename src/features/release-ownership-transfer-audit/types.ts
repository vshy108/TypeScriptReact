export type ReleaseOwnershipTransferRunId = `ownership-transfer-run-${number}`;
export type ReleaseOwnershipTransferStepId =
  `ownership-transfer-step-${number}`;
export type ReleaseOwnershipAuditEventId = `ownership-event-${number}`;

export interface ReleaseOwnershipTransferRun {
  readonly id: ReleaseOwnershipTransferRunId;
  readonly title: string;
  readonly summary: string;
  readonly stage:
    | "draft"
    | "awaiting-outgoing-ack"
    | "awaiting-incoming-ack"
    | "replaying-context"
    | "completed";
  readonly currentOwner: string;
  readonly pendingOwner: string | null;
  readonly activeStepId: ReleaseOwnershipTransferStepId | null;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseOwnershipTransferStep {
  readonly id: ReleaseOwnershipTransferStepId;
  readonly label: string;
  readonly owner: string;
  readonly status: "queued" | "awaiting-ack" | "completed";
  readonly note: string;
}

export interface ReleaseOwnershipAuditEvent {
  readonly id: ReleaseOwnershipAuditEventId;
  readonly actor: string;
  readonly action: "initiated" | "acknowledged" | "replayed" | "transferred";
  readonly detail: string;
  readonly timestamp: string;
}

export interface ReleaseOwnershipTransferWorkspaceResponse {
  readonly refreshedAt: string;
  readonly run: ReleaseOwnershipTransferRun;
  readonly steps: readonly ReleaseOwnershipTransferStep[];
  readonly auditEvents: readonly ReleaseOwnershipAuditEvent[];
}

export interface StartReleaseOwnershipTransferInput {
  readonly runId: ReleaseOwnershipTransferRunId;
}

export interface AcknowledgeReleaseOwnershipStepInput {
  readonly stepId: ReleaseOwnershipTransferStepId;
}
