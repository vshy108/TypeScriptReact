export type ReleaseEscalationRunId = `escalation-run-${number}`;
export type ReleaseEscalationRouteId = `escalation-route-${number}`;

export interface ReleaseEscalationRun {
  readonly id: ReleaseEscalationRunId;
  readonly title: string;
  readonly summary: string;
  readonly stage: "draft" | "routing" | "rerouted" | "completed";
  readonly activeRouteId: ReleaseEscalationRouteId | null;
  readonly rerouteReason: string | null;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseEscalationRoute {
  readonly id: ReleaseEscalationRouteId;
  readonly label: string;
  readonly primaryOwner: string;
  readonly fallbackOwner: string;
  readonly currentOwner: string;
  readonly deadlineSeconds: number | null;
  readonly status: "queued" | "awaiting-ack" | "rerouted" | "completed";
  readonly note: string;
}

export interface ReleaseEscalationWorkspaceResponse {
  readonly refreshedAt: string;
  readonly run: ReleaseEscalationRun;
  readonly routes: readonly ReleaseEscalationRoute[];
}

export interface StartReleaseEscalationInput {
  readonly runId: ReleaseEscalationRunId;
}

export interface AcknowledgeReleaseEscalationInput {
  readonly routeId: ReleaseEscalationRouteId;
}
