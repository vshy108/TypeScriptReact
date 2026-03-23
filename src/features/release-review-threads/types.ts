export type ReleaseReviewId = `review-${number}`;
export type ReleaseReviewThreadId = `thread-${number}`;
export type ReleaseReviewerId = `reviewer-${number}`;

export interface ReleaseReviewRecord {
  readonly id: ReleaseReviewId;
  readonly title: string;
  readonly audience: string;
  readonly summary: string;
  readonly revision: number;
  readonly stage: "draft" | "published";
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseReviewThread {
  readonly id: ReleaseReviewThreadId;
  readonly field: "summary";
  readonly author: string;
  readonly role: string;
  readonly comment: string;
  readonly status: "open" | "resolved";
}

export interface ReleaseReviewerApproval {
  readonly id: ReleaseReviewerId;
  readonly name: string;
  readonly role: string;
  readonly status: "pending" | "approved" | "changes-requested";
}

export interface ReleaseReviewWorkspaceResponse {
  readonly refreshedAt: string;
  readonly record: ReleaseReviewRecord;
  readonly threads: readonly ReleaseReviewThread[];
  readonly approvals: readonly ReleaseReviewerApproval[];
}

export interface SaveReleaseReviewDraftInput {
  readonly reviewId: ReleaseReviewId;
  readonly summary: string;
}

export interface PublishReleaseReviewInput {
  readonly reviewId: ReleaseReviewId;
}
