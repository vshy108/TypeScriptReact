export type RolloutBlockerId = `blocker-${number}`;
export type BlockerSeverity = "low" | "medium" | "high";

export interface RolloutBlocker {
  readonly id: RolloutBlockerId;
  readonly title: string;
  readonly owner: string;
  readonly severity: BlockerSeverity;
  readonly affectedSurface: string;
  readonly requiresEscalation: boolean;
  readonly updatedAt: string;
  readonly resolutionNote: string | null;
  readonly resolved: boolean;
}

export interface RolloutWorkspaceResponse {
  readonly revision: number;
  readonly loadedAt: string;
  readonly blockers: readonly RolloutBlocker[];
}

export interface ResolveBlockerInput {
  readonly blockerId: RolloutBlockerId;
  readonly resolutionNote: string;
}

export interface ResolveBlockerSuccess {
  readonly revision: number;
  readonly savedAt: string;
  readonly blocker: RolloutBlocker;
}

export interface ResolveBlockerErrorShape {
  readonly code: "note-too-short" | "escalation-required";
  readonly message: string;
}
