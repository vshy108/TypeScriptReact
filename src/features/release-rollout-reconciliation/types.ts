export type ReleaseSegmentId = `segment-${number}`;

export interface ReleaseSegmentRecord {
  readonly id: ReleaseSegmentId;
  readonly audience: string;
  readonly requestedRolloutPercent: number;
  readonly actualRolloutPercent: number;
  readonly status: "steady" | "reconciling";
  readonly revision: number;
  readonly updatedAt: string;
}

export interface ReleaseRolloutWorkspaceResponse {
  readonly refreshedAt: string;
  readonly segments: readonly ReleaseSegmentRecord[];
}

export interface RequestRolloutPromotionInput {
  readonly segmentId: ReleaseSegmentId;
  readonly targetPercent: number;
  readonly expectedRevision: number;
}

export interface RequestRolloutPromotionSuccess {
  readonly acceptedAt: string;
  readonly segment: ReleaseSegmentRecord;
}
