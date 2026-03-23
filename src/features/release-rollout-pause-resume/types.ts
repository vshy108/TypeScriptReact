export type ReleasePauseRunId = `pause-run-${number}`;
export type ReleasePauseCheckpointId = `pause-checkpoint-${number}`;
export type ReleasePauseAcknowledgementId = `pause-ack-${number}`;

export interface ReleasePauseRun {
  readonly id: ReleasePauseRunId;
  readonly title: string;
  readonly stage: "draft" | "launching" | "paused" | "completed";
  readonly activeCheckpointId: ReleasePauseCheckpointId | null;
  readonly pauseReason: string | null;
  readonly manualOverrideUsed: boolean;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleasePauseCheckpoint {
  readonly id: ReleasePauseCheckpointId;
  readonly name: string;
  readonly trafficPercent: number;
  readonly status: "pending" | "monitoring" | "paused" | "completed";
  readonly note: string;
}

export interface ReleasePauseAcknowledgement {
  readonly id: ReleasePauseAcknowledgementId;
  readonly owner: string;
  readonly role: string;
  readonly status: "pending" | "acknowledged";
}

export interface ReleasePauseWorkspaceResponse {
  readonly refreshedAt: string;
  readonly run: ReleasePauseRun;
  readonly checkpoints: readonly ReleasePauseCheckpoint[];
  readonly acknowledgements: readonly ReleasePauseAcknowledgement[];
}

export interface StartReleasePauseRunInput {
  readonly runId: ReleasePauseRunId;
}

export interface PauseReleaseRunInput {
  readonly checkpointId: ReleasePauseCheckpointId;
}

export interface AcknowledgeReleasePauseInput {
  readonly acknowledgementId: ReleasePauseAcknowledgementId;
}

export interface ResumeReleasePauseRunInput {
  readonly runId: ReleasePauseRunId;
}
