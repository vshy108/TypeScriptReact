export type ReleaseScheduleId = `schedule-${number}`;
export type ReleaseApprovalId = `approval-${number}`;

export interface ReleaseScheduleApproval {
  readonly id: ReleaseApprovalId;
  readonly name: string;
  readonly role: string;
  readonly status: "pending" | "approved";
}

export interface ReleaseScheduleRecord {
  readonly id: ReleaseScheduleId;
  readonly title: string;
  readonly headline: string;
  readonly stage: "draft" | "scheduled" | "published" | "rolled-back";
  readonly countdownSeconds: number | null;
  readonly rollbackWindowSeconds: number | null;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseScheduleWorkspaceResponse {
  readonly refreshedAt: string;
  readonly record: ReleaseScheduleRecord;
  readonly approvals: readonly ReleaseScheduleApproval[];
}

export interface ApproveReleaseScheduleInput {
  readonly approvalId: ReleaseApprovalId;
}

export interface ScheduleReleasePublishInput {
  readonly scheduleId: ReleaseScheduleId;
}
