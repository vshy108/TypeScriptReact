export type ReleaseIncidentFaqRunId = `incident-faq-run-${number}`;
export type ReleaseIncidentFaqChannelId = `incident-faq-channel-${number}`;
export type ReleaseIncidentFaqEntryId = `incident-faq-entry-${number}`;
export type ReleaseIncidentFaqAuditEventId = `incident-faq-audit-${number}`;

export interface ReleaseIncidentFaqRun {
  readonly id: ReleaseIncidentFaqRunId;
  readonly title: string;
  readonly summary: string;
  readonly stage:
    | "draft"
    | "channel-review"
    | "stale-answer-review"
    | "reviewer-signoff"
    | "ready-to-publish"
    | "published";
  readonly activeChannelId: ReleaseIncidentFaqChannelId | null;
  readonly publishBlockedReason: string | null;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseIncidentFaqChannel {
  readonly id: ReleaseIncidentFaqChannelId;
  readonly label: string;
  readonly audience: string;
  readonly owner: string;
  readonly status: "queued" | "awaiting-review" | "approved" | "published";
  readonly note: string;
}

export interface ReleaseIncidentFaqEntry {
  readonly id: ReleaseIncidentFaqEntryId;
  readonly question: string;
  readonly staleAnswer: string;
  readonly refreshedAnswer: string;
  readonly owner: string;
  readonly status: "current" | "stale" | "invalidated" | "approved";
}

export interface ReleaseIncidentFaqAuditEvent {
  readonly id: ReleaseIncidentFaqAuditEventId;
  readonly actor: string;
  readonly action:
    | "initiated"
    | "approved"
    | "invalidated"
    | "signed-off"
    | "published";
  readonly detail: string;
  readonly timestamp: string;
}

export interface ReleaseIncidentFaqWorkspaceResponse {
  readonly refreshedAt: string;
  readonly run: ReleaseIncidentFaqRun;
  readonly channels: readonly ReleaseIncidentFaqChannel[];
  readonly faqEntries: readonly ReleaseIncidentFaqEntry[];
  readonly auditEvents: readonly ReleaseIncidentFaqAuditEvent[];
}

export interface StartReleaseIncidentFaqInput {
  readonly runId: ReleaseIncidentFaqRunId;
}

export interface ApproveReleaseIncidentFaqChannelInput {
  readonly channelId: ReleaseIncidentFaqChannelId;
}

export interface InvalidateReleaseIncidentFaqAnswersInput {
  readonly runId: ReleaseIncidentFaqRunId;
}

export interface SignOffReleaseIncidentFaqInput {
  readonly runId: ReleaseIncidentFaqRunId;
}

export interface PublishReleaseIncidentFaqInput {
  readonly runId: ReleaseIncidentFaqRunId;
}
