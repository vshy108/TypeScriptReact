import type {
  ApproveReleaseRollbackDecisionInput,
  ExecuteReleaseRollbackDecisionInput,
  ReleaseRollbackDecisionAuditEvent,
  ReleaseRollbackDecisionAuditEventId,
  ReleaseRollbackDecisionRun,
  ReleaseRollbackDecisionWorkspaceResponse,
  ReleaseRollbackMetric,
  ReleaseRollbackSignoff,
  ResolveReleaseRollbackMetricInput,
  StartReleaseRollbackDecisionInput,
} from "./types";

const initialRun = {
  id: "rollback-decision-run-1",
  title: "Rollback decision matrix with quorum sign-off",
  summary:
    "Compare conflicting rollback signals, choose the canonical decision for each metric, and require quorum approval before the rollback call can execute.",
  stage: "draft",
  recommendedAction: "rollback",
  publishBlockedReason:
    "Resolve conflicting rollback signals before quorum sign-off can start.",
  updatedAt: "2026-03-24 03:30 UTC",
  updatedBy: "Taylor - Rollback lead",
} as const satisfies ReleaseRollbackDecisionRun;

const initialMetrics = [
  {
    id: "rollback-metric-1",
    label: "Checkout error rate",
    currentValue: "6.8%",
    threshold: "> 3.0%",
    source: "Payments telemetry",
    recommendation: "rollback",
    status: "aligned",
    note: "Error rate is clearly above the rollback threshold and supports reverting traffic.",
  },
  {
    id: "rollback-metric-2",
    label: "Latency percentile disagreement",
    currentValue: "p95 420ms vs p95 290ms",
    threshold: "> 350ms",
    source: "Synthetic vs edge traces",
    recommendation: "rollback",
    status: "conflicting",
    note: "Synthetic probes recommend rollback, but edge traces still suggest holding while mitigation settles.",
  },
  {
    id: "rollback-metric-3",
    label: "Support severity intake",
    currentValue: "17 Sev-2 contacts",
    threshold: "> 10 active",
    source: "Support operations",
    recommendation: "rollback",
    status: "aligned",
    note: "Support escalation volume supports a rollback recommendation.",
  },
] as const satisfies readonly ReleaseRollbackMetric[];

const initialSignoffs = [
  {
    id: "rollback-signoff-1",
    owner: "Taylor",
    role: "Rollback lead",
    status: "pending",
    note: "Primary operator confirms the final matrix recommendation.",
  },
  {
    id: "rollback-signoff-2",
    owner: "Mina",
    role: "Customer operations",
    status: "pending",
    note: "Customer operations confirms the blast radius justifies rollback.",
  },
  {
    id: "rollback-signoff-3",
    owner: "Jordan",
    role: "Infrastructure lead",
    status: "pending",
    note: "Infrastructure confirms rollback safety once quorum is reached.",
  },
] as const satisfies readonly ReleaseRollbackSignoff[];

const initialAuditEvents = [
  {
    id: "rollback-decision-audit-1",
    actor: "Taylor",
    action: "initiated",
    detail:
      "Opened the rollback decision matrix with conflicting latency evidence and quorum sign-off requirements.",
    timestamp: "2026-03-24 03:25 UTC",
  },
] as const satisfies readonly ReleaseRollbackDecisionAuditEvent[];

export const releaseRollbackDecisionFetchDelayMs = 180;
export const releaseRollbackDecisionMutationDelayMs = 220;

let run: ReleaseRollbackDecisionRun = { ...initialRun };
let metrics: ReleaseRollbackMetric[] = initialMetrics.map((metric) => ({
  ...metric,
}));
let signoffs: ReleaseRollbackSignoff[] = initialSignoffs.map((signoff) => ({
  ...signoff,
}));
let auditEvents: ReleaseRollbackDecisionAuditEvent[] = initialAuditEvents.map(
  (event) => ({ ...event }),
);
let nextAuditEventNumber = initialAuditEvents.length + 1;

function formatTimestamp(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function createAbortError() {
  return new DOMException("The operation was aborted.", "AbortError");
}

function cloneWorkspace(): ReleaseRollbackDecisionWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    run: { ...run },
    metrics: metrics.map((metric) => ({ ...metric })),
    signoffs: signoffs.map((signoff) => ({ ...signoff })),
    auditEvents: auditEvents.map((event) => ({ ...event })),
  };
}

function nextAuditEventId(): ReleaseRollbackDecisionAuditEventId {
  const eventId =
    `rollback-decision-audit-${nextAuditEventNumber}` as ReleaseRollbackDecisionAuditEventId;
  nextAuditEventNumber += 1;
  return eventId;
}

function appendAuditEvent(
  action: ReleaseRollbackDecisionAuditEvent["action"],
  actor: string,
  detail: string,
) {
  auditEvents = [
    {
      id: nextAuditEventId(),
      actor,
      action,
      detail,
      timestamp: formatTimestamp(new Date()),
    },
    ...auditEvents,
  ];
}

function matrixResolved() {
  return metrics.every((metric) => metric.status !== "conflicting");
}

function quorumReached() {
  return (
    signoffs.filter((signoff) => signoff.status === "approved").length >= 2
  );
}

export function resetReleaseRollbackDecisionMatrixMockState() {
  run = { ...initialRun };
  metrics = initialMetrics.map((metric) => ({ ...metric }));
  signoffs = initialSignoffs.map((signoff) => ({ ...signoff }));
  auditEvents = initialAuditEvents.map((event) => ({ ...event }));
  nextAuditEventNumber = initialAuditEvents.length + 1;
}

export function isReleaseRollbackDecisionAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function fetchReleaseRollbackDecisionWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseRollbackDecisionWorkspaceResponse> {
  return new Promise<ReleaseRollbackDecisionWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);
        resolve(cloneWorkspace());
      }, releaseRollbackDecisionFetchDelayMs);

      function handleAbort() {
        window.clearTimeout(timeoutId);
        signal?.removeEventListener("abort", handleAbort);
        reject(createAbortError());
      }

      if (signal?.aborted) {
        handleAbort();
        return;
      }

      signal?.addEventListener("abort", handleAbort, { once: true });
    },
  );
}

export function startReleaseRollbackDecision(
  input: StartReleaseRollbackDecisionInput,
  signal?: AbortSignal,
): Promise<ReleaseRollbackDecisionWorkspaceResponse> {
  return new Promise<ReleaseRollbackDecisionWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (run.id !== input.runId || run.stage !== "draft") {
          reject(
            new Error("Rollback decision matrix is no longer ready to start."),
          );
          return;
        }

        run = {
          ...run,
          stage: "resolving-matrix",
          publishBlockedReason:
            "Resolve the conflicting latency signal before quorum sign-off can begin.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Taylor - Rollback lead",
        };

        appendAuditEvent(
          "initiated",
          "Taylor",
          "Started rollback decision review and highlighted the conflicting latency recommendation.",
        );

        resolve(cloneWorkspace());
      }, releaseRollbackDecisionMutationDelayMs);

      function handleAbort() {
        window.clearTimeout(timeoutId);
        signal?.removeEventListener("abort", handleAbort);
        reject(createAbortError());
      }

      if (signal?.aborted) {
        handleAbort();
        return;
      }

      signal?.addEventListener("abort", handleAbort, { once: true });
    },
  );
}

export function resolveReleaseRollbackMetric(
  input: ResolveReleaseRollbackMetricInput,
  signal?: AbortSignal,
): Promise<ReleaseRollbackDecisionWorkspaceResponse> {
  return new Promise<ReleaseRollbackDecisionWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        const metric =
          metrics.find((item) => item.id === input.metricId) ?? null;

        if (!metric || metric.status !== "conflicting") {
          reject(new Error("Metric resolution is not available."));
          return;
        }

        metrics = metrics.map((item) =>
          item.id === input.metricId
            ? {
                ...item,
                recommendation: input.decision,
                status: "resolved",
                note:
                  input.decision === "rollback"
                    ? "Canonical decision favors rollback after reviewing the stronger synthetic probe evidence."
                    : "Canonical decision favors holding while the edge-trace evidence stabilizes.",
              }
            : item,
        );

        const recommendedAction = input.decision;
        run = {
          ...run,
          stage: "awaiting-quorum",
          recommendedAction,
          publishBlockedReason:
            "Quorum sign-off is required before executing the rollback decision.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Taylor - Rollback lead",
        };

        appendAuditEvent(
          "resolved",
          "Taylor",
          `Resolved ${metric.label} in favor of ${input.decision}.`,
        );

        resolve(cloneWorkspace());
      }, releaseRollbackDecisionMutationDelayMs);

      function handleAbort() {
        window.clearTimeout(timeoutId);
        signal?.removeEventListener("abort", handleAbort);
        reject(createAbortError());
      }

      if (signal?.aborted) {
        handleAbort();
        return;
      }

      signal?.addEventListener("abort", handleAbort, { once: true });
    },
  );
}

export function approveReleaseRollbackDecision(
  input: ApproveReleaseRollbackDecisionInput,
  signal?: AbortSignal,
): Promise<ReleaseRollbackDecisionWorkspaceResponse> {
  return new Promise<ReleaseRollbackDecisionWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        const signoff =
          signoffs.find((item) => item.id === input.signoffId) ?? null;

        if (!signoff || signoff.status !== "pending" || !matrixResolved()) {
          reject(new Error("Quorum approval is not available."));
          return;
        }

        signoffs = signoffs.map((item) =>
          item.id === input.signoffId
            ? {
                ...item,
                status: "approved",
                note: `${item.owner} approved the ${run.recommendedAction} decision for quorum.`,
              }
            : item,
        );

        appendAuditEvent(
          "approved",
          signoff.owner,
          `${signoff.owner} approved the ${run.recommendedAction} decision matrix.`,
        );

        run = {
          ...run,
          stage: quorumReached() ? "ready-to-execute" : "awaiting-quorum",
          publishBlockedReason: quorumReached()
            ? null
            : "Quorum requires two operator approvals before execution.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: signoff.owner,
        };

        resolve(cloneWorkspace());
      }, releaseRollbackDecisionMutationDelayMs);

      function handleAbort() {
        window.clearTimeout(timeoutId);
        signal?.removeEventListener("abort", handleAbort);
        reject(createAbortError());
      }

      if (signal?.aborted) {
        handleAbort();
        return;
      }

      signal?.addEventListener("abort", handleAbort, { once: true });
    },
  );
}

export function executeReleaseRollbackDecision(
  input: ExecuteReleaseRollbackDecisionInput,
  signal?: AbortSignal,
): Promise<ReleaseRollbackDecisionWorkspaceResponse> {
  return new Promise<ReleaseRollbackDecisionWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (
          run.id !== input.runId ||
          run.stage !== "ready-to-execute" ||
          !quorumReached()
        ) {
          reject(new Error("Rollback execution is not available."));
          return;
        }

        run = {
          ...run,
          stage: "executed",
          publishBlockedReason: null,
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Taylor - Rollback lead",
        };

        appendAuditEvent(
          "executed",
          "Taylor",
          `Executed the ${run.recommendedAction} decision after quorum sign-off completed.`,
        );

        resolve(cloneWorkspace());
      }, releaseRollbackDecisionMutationDelayMs);

      function handleAbort() {
        window.clearTimeout(timeoutId);
        signal?.removeEventListener("abort", handleAbort);
        reject(createAbortError());
      }

      if (signal?.aborted) {
        handleAbort();
        return;
      }

      signal?.addEventListener("abort", handleAbort, { once: true });
    },
  );
}
