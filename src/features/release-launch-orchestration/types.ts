export type ReleaseLaunchRunId = `launch-${number}`;
export type ReleaseLaunchCheckpointId = `checkpoint-${number}`;
export type ReleaseLaunchGuardrailId = `guardrail-${number}`;

export interface ReleaseLaunchRun {
  readonly id: ReleaseLaunchRunId;
  readonly title: string;
  readonly summary: string;
  readonly stage: "draft" | "launching" | "completed" | "aborted";
  readonly activeCheckpointId: ReleaseLaunchCheckpointId | null;
  readonly abortReason: string | null;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseLaunchCheckpoint {
  readonly id: ReleaseLaunchCheckpointId;
  readonly name: string;
  readonly trafficPercent: number;
  readonly status: "pending" | "monitoring" | "completed" | "aborted";
  readonly note: string;
}

export interface ReleaseLaunchGuardrail {
  readonly id: ReleaseLaunchGuardrailId;
  readonly name: string;
  readonly threshold: string;
  readonly currentValue: string;
  readonly status: "healthy" | "watching" | "breached";
  readonly effect: string;
}

export interface ReleaseLaunchWorkspaceResponse {
  readonly refreshedAt: string;
  readonly run: ReleaseLaunchRun;
  readonly checkpoints: readonly ReleaseLaunchCheckpoint[];
  readonly guardrails: readonly ReleaseLaunchGuardrail[];
  readonly abortArmed: boolean;
}

export interface StartReleaseLaunchInput {
  readonly runId: ReleaseLaunchRunId;
}

export interface ArmReleaseLaunchAbortInput {
  readonly guardrailId: ReleaseLaunchGuardrailId;
}
