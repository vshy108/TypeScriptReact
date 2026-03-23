export type ReleaseMergeId = `merge-${number}`;
export type MergeFieldName = "headline" | "summary";

export interface ReleaseMergeRecord {
  readonly id: ReleaseMergeId;
  readonly title: string;
  readonly headline: string;
  readonly summary: string;
  readonly revision: number;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseMergeWorkspaceResponse {
  readonly refreshedAt: string;
  readonly record: ReleaseMergeRecord;
}

export interface SaveReleaseMergeDraftInput {
  readonly mergeId: ReleaseMergeId;
  readonly headline: string;
  readonly summary: string;
  readonly expectedRevision: number;
}

export interface FieldConflictState {
  readonly field: MergeFieldName;
  readonly baseValue: string;
  readonly localValue: string;
  readonly serverValue: string;
}
