export type ReleaseApprovalId = `release-${number}`;
export type WorkflowStage = "review" | "ready" | "blocked" | "paused";
export type ApprovalDecision = "approve" | "hold" | "rollback";

export interface ReleaseApprovalHistoryEntry {
  readonly id: `history-${number}`;
  readonly actor: string;
  readonly decision: ApprovalDecision;
  readonly note: string;
  readonly rolloutPercent: number;
  readonly recordedAt: string;
}

export interface ReleaseApprovalRecord {
  readonly id: ReleaseApprovalId;
  readonly name: string;
  readonly owner: string;
  readonly stage: WorkflowStage;
  readonly currentDecision: ApprovalDecision;
  readonly rolloutPercent: number;
  readonly requiresRunbook: boolean;
  readonly updatedAt: string;
  readonly history: readonly ReleaseApprovalHistoryEntry[];
}

export interface ReleaseApprovalWorkspaceResponse {
  readonly revision: number;
  readonly loadedAt: string;
  readonly releases: readonly ReleaseApprovalRecord[];
}

export interface ReleaseApprovalMutationInput {
  readonly releaseId: ReleaseApprovalId;
  readonly decision: ApprovalDecision;
  readonly note: string;
  readonly rolloutPercent: number;
}

export interface ReleaseApprovalMutationSuccess {
  readonly revision: number;
  readonly savedAt: string;
  readonly release: ReleaseApprovalRecord;
}

export interface ReleaseApprovalMutationErrorShape {
  readonly code: "note-too-short" | "runbook-required";
  readonly message: string;
}

export type ReleaseApprovalOption = Pick<
  ReleaseApprovalRecord,
  "id" | "name" | "stage" | "owner"
>;

export interface ReleaseApprovalDraft {
  readonly decision: ApprovalDecision;
  readonly note: string;
  readonly rolloutPercent: number;
}
