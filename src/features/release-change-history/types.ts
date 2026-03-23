export type ReleaseHistoryId = `history-${number}`;
export type ReleaseAuditEntryId = `audit-${number}`;

export interface ReleaseHistoryRecord {
  readonly id: ReleaseHistoryId;
  readonly title: string;
  readonly headline: string;
  readonly summary: string;
  readonly revision: number;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseAuditEntry {
  readonly id: ReleaseAuditEntryId;
  readonly revision: number;
  readonly actor: string;
  readonly reason: string;
  readonly timestamp: string;
  readonly snapshot: ReleaseHistoryRecord;
}

export interface ReleaseHistoryWorkspaceResponse {
  readonly refreshedAt: string;
  readonly record: ReleaseHistoryRecord;
  readonly auditTrail: readonly ReleaseAuditEntry[];
}

export interface SaveReleaseHistoryDraftInput {
  readonly historyId: ReleaseHistoryId;
  readonly headline: string;
  readonly summary: string;
}
