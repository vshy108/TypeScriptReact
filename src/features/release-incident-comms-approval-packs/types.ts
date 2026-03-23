export type ReleaseIncidentCommsRunId = `incident-comms-run-${number}`;
export type ReleaseIncidentCommsPackId = `incident-comms-pack-${number}`;
export type ReleaseIncidentCommsDiffId = `incident-comms-diff-${number}`;
export type ReleaseIncidentCommsAuditEventId = `incident-comms-audit-${number}`;

export interface ReleaseIncidentCommsRun {
  readonly id: ReleaseIncidentCommsRunId;
  readonly title: string;
  readonly summary: string;
  readonly stage:
    | "draft"
    | "ops-review"
    | "legal-review"
    | "override-required"
    | "ready-to-publish"
    | "published";
  readonly activePackId: ReleaseIncidentCommsPackId | null;
  readonly publishBlockedReason: string | null;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseIncidentCommsApprovalPack {
  readonly id: ReleaseIncidentCommsPackId;
  readonly label: string;
  readonly owner: string;
  readonly role: string;
  readonly status:
    | "queued"
    | "awaiting-approval"
    | "approved"
    | "override-applied";
  readonly note: string;
}

export interface ReleaseIncidentCommsDiffRow {
  readonly id: ReleaseIncidentCommsDiffId;
  readonly field: string;
  readonly baseline: string;
  readonly override: string;
  readonly status: "unchanged" | "changed" | "approved";
}

export interface ReleaseIncidentCommsAuditEvent {
  readonly id: ReleaseIncidentCommsAuditEventId;
  readonly actor: string;
  readonly action: "initiated" | "approved" | "overridden" | "published";
  readonly detail: string;
  readonly timestamp: string;
}

export interface ReleaseIncidentCommsWorkspaceResponse {
  readonly refreshedAt: string;
  readonly run: ReleaseIncidentCommsRun;
  readonly packs: readonly ReleaseIncidentCommsApprovalPack[];
  readonly diffRows: readonly ReleaseIncidentCommsDiffRow[];
  readonly auditEvents: readonly ReleaseIncidentCommsAuditEvent[];
}

export interface StartReleaseIncidentCommsInput {
  readonly runId: ReleaseIncidentCommsRunId;
}

export interface ApproveReleaseIncidentCommsPackInput {
  readonly packId: ReleaseIncidentCommsPackId;
}

export interface ApplyReleaseIncidentCommsOverrideInput {
  readonly runId: ReleaseIncidentCommsRunId;
}

export interface PublishReleaseIncidentCommsInput {
  readonly runId: ReleaseIncidentCommsRunId;
}
