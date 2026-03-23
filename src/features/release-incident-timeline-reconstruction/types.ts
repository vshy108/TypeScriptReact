export type ReleaseTimelineRunId = `timeline-run-${number}`;
export type ReleaseTimelineConflictId = `timeline-conflict-${number}`;
export type ReleaseTimelineEntryId = `timeline-entry-${number}`;
export type ReleaseTimelineAuditEventId = `timeline-audit-${number}`;

export interface ReleaseTimelineRun {
  readonly id: ReleaseTimelineRunId;
  readonly title: string;
  readonly summary: string;
  readonly stage:
    | "draft"
    | "resolving-conflicts"
    | "summary-blocked"
    | "ready-to-publish"
    | "published";
  readonly activeConflictId: ReleaseTimelineConflictId | null;
  readonly publishBlockedReason: string | null;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseTimelineEntry {
  readonly id: ReleaseTimelineEntryId;
  readonly timestampLabel: string;
  readonly actor: string;
  readonly note: string;
  readonly source: "ops" | "support" | "executive";
  readonly status: "confirmed" | "conflicting" | "resolved";
}

export interface ReleaseTimelineConflict {
  readonly id: ReleaseTimelineConflictId;
  readonly label: string;
  readonly status: "open" | "resolved";
  readonly leftEntry: ReleaseTimelineEntry;
  readonly rightEntry: ReleaseTimelineEntry;
  readonly resolvedSource: "ops" | "support" | null;
  readonly note: string;
}

export interface ReleaseTimelineExecutiveSummary {
  readonly headline: string;
  readonly body: string;
  readonly status: "blocked" | "ready" | "published";
  readonly safetyNote: string;
}

export interface ReleaseTimelineAuditEvent {
  readonly id: ReleaseTimelineAuditEventId;
  readonly actor: string;
  readonly action: "initiated" | "resolved" | "summarized" | "published";
  readonly detail: string;
  readonly timestamp: string;
}

export interface ReleaseTimelineWorkspaceResponse {
  readonly refreshedAt: string;
  readonly run: ReleaseTimelineRun;
  readonly entries: readonly ReleaseTimelineEntry[];
  readonly conflicts: readonly ReleaseTimelineConflict[];
  readonly executiveSummary: ReleaseTimelineExecutiveSummary;
  readonly auditEvents: readonly ReleaseTimelineAuditEvent[];
}

export interface StartReleaseTimelineInput {
  readonly runId: ReleaseTimelineRunId;
}

export interface ResolveReleaseTimelineConflictInput {
  readonly conflictId: ReleaseTimelineConflictId;
  readonly resolvedSource: "ops" | "support";
}

export interface GenerateReleaseTimelineSummaryInput {
  readonly runId: ReleaseTimelineRunId;
}

export interface PublishReleaseTimelineSummaryInput {
  readonly runId: ReleaseTimelineRunId;
}
