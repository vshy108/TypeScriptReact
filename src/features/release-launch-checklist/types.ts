export type LaunchChecklistId = `launch-${number}`;
export type LaunchStepId =
  | "freeze-window"
  | "announce-status"
  | "confirm-launch";

export interface LaunchChecklistStep {
  readonly id: LaunchStepId;
  readonly title: string;
  readonly owner: string;
  readonly completed: boolean;
  readonly savedValue: string | null;
  readonly savedAt: string | null;
}

export interface LaunchChecklistRecord {
  readonly id: LaunchChecklistId;
  readonly name: string;
  readonly owner: string;
  readonly rolloutPercent: number;
  readonly steps: readonly LaunchChecklistStep[];
}

export interface LaunchChecklistWorkspaceResponse {
  readonly revision: number;
  readonly loadedAt: string;
  readonly launch: LaunchChecklistRecord;
}

export interface SaveLaunchStepInput {
  readonly launchId: LaunchChecklistId;
  readonly stepId: LaunchStepId;
  readonly value: string;
}

export interface SaveLaunchStepSuccess {
  readonly revision: number;
  readonly savedAt: string;
  readonly launch: LaunchChecklistRecord;
}

export interface SaveLaunchStepErrorShape {
  readonly code: "value-too-short" | "dependency-missing" | "missing-keyword";
  readonly message: string;
}
