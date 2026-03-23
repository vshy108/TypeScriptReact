export type ReleaseBranchId = `branch-${number}`;
export type ReleaseBranchKind = "primary" | "alternate";

export interface ReleaseBranchRecord {
  readonly id: ReleaseBranchId;
  readonly name: string;
  readonly kind: ReleaseBranchKind;
  readonly headline: string;
  readonly summary: string;
  readonly revision: number;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseBranchWorkspaceResponse {
  readonly refreshedAt: string;
  readonly branches: readonly ReleaseBranchRecord[];
  readonly activeBranchId: ReleaseBranchId;
}

export interface PromoteReleaseBranchInput {
  readonly branchId: ReleaseBranchId;
}
