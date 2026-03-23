export type ReleaseHandoffId = `handoff-${number}`;

export interface ReleaseHandoffRecord {
  readonly id: ReleaseHandoffId;
  readonly title: string;
  readonly owner: string;
  readonly handoffNote: string;
  readonly rolloutPercent: number;
  readonly revision: number;
  readonly updatedBy: string;
  readonly updatedAt: string;
}

export interface ReleaseHandoffWorkspaceResponse {
  readonly polledAt: string;
  readonly record: ReleaseHandoffRecord;
}

export interface SaveReleaseHandoffInput {
  readonly handoffId: ReleaseHandoffId;
  readonly handoffNote: string;
  readonly expectedRevision: number;
}

export interface SaveReleaseHandoffSuccess {
  readonly savedAt: string;
  readonly record: ReleaseHandoffRecord;
}

export interface ReleaseHandoffConflictErrorShape {
  readonly code: "conflict" | "note-too-short";
  readonly message: string;
  readonly serverRecord?: ReleaseHandoffRecord;
}
