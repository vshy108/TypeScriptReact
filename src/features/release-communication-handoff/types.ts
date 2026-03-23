export type ReleaseCommunicationRunId = `handoff-run-${number}`;
export type ReleaseCommunicationChannelId = `handoff-channel-${number}`;

export interface ReleaseCommunicationRun {
  readonly id: ReleaseCommunicationRunId;
  readonly title: string;
  readonly summary: string;
  readonly stage:
    | "draft"
    | "ready-for-handoff"
    | "publishing"
    | "recovery"
    | "completed";
  readonly activeChannelId: ReleaseCommunicationChannelId | null;
  readonly recoveryReason: string | null;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseCommunicationChannel {
  readonly id: ReleaseCommunicationChannelId;
  readonly name: string;
  readonly owner: string;
  readonly status:
    | "draft"
    | "awaiting-ack"
    | "ready"
    | "publishing"
    | "published"
    | "recovering";
  readonly note: string;
}

export interface ReleaseCommunicationWorkspaceResponse {
  readonly refreshedAt: string;
  readonly run: ReleaseCommunicationRun;
  readonly channels: readonly ReleaseCommunicationChannel[];
}

export interface AcknowledgeCommunicationChannelInput {
  readonly channelId: ReleaseCommunicationChannelId;
}

export interface StartCommunicationPublishInput {
  readonly runId: ReleaseCommunicationRunId;
}

export interface ConfirmCommunicationRecoveryInput {
  readonly runId: ReleaseCommunicationRunId;
}
