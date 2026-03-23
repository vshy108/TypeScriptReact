import type {
  ApproveReleasePostRollbackForksInput,
  PublishReleasePostRollbackInput,
  ReleasePostRollbackAuditEvent,
  ReleasePostRollbackAuditEventId,
  ReleasePostRollbackMessageFork,
  ReleasePostRollbackRun,
  ReleasePostRollbackSegment,
  ReleasePostRollbackWorkspaceResponse,
  ScheduleReleasePostRollbackSegmentInput,
  StartReleasePostRollbackInput,
} from "./types";

const initialRun = {
  id: "post-rollback-run-1",
  title: "Post-rollback customer segmentation and message forks",
  summary:
    "Schedule region-specific rollback updates by audience, review escalation-safe message forks, and only publish once the forked messaging is cleared for each segment.",
  stage: "draft",
  activeSegmentId: null,
  publishBlockedReason:
    "Region timing and escalation-safe message forks must be cleared before publishing segmented rollback updates.",
  updatedAt: "2026-03-24 04:45 UTC",
  updatedBy: "Avery - Communications lead",
} as const satisfies ReleasePostRollbackRun;

const initialSegments = [
  {
    id: "post-rollback-segment-1",
    label: "NA enterprise accounts",
    region: "North America",
    audience: "Enterprise",
    sendWindow: "Immediately after rollback confirmation",
    status: "queued",
    note: "Enterprise customers in North America should receive the earliest rollback confirmation with direct account-team follow-up.",
  },
  {
    id: "post-rollback-segment-2",
    label: "EU self-serve customers",
    region: "Europe",
    audience: "Self-serve",
    sendWindow: "After EU regional validation closes",
    status: "queued",
    note: "EU self-serve messaging stays timed behind regional validation to avoid overclaiming recovery progress.",
  },
  {
    id: "post-rollback-segment-3",
    label: "AP support escalation queue",
    region: "AP Southeast",
    audience: "Support queue",
    sendWindow: "After support escalation script is updated",
    status: "queued",
    note: "Support-facing guidance in AP must use escalation-safe phrasing before customers are messaged directly.",
  },
] as const satisfies readonly ReleasePostRollbackSegment[];

const initialMessageForks = [
  {
    id: "post-rollback-fork-1",
    label: "Customer-facing rollback status",
    baseline:
      "Rollback is complete and all customers should now see recovery across regions.",
    escalationSafe:
      "Rollback is complete and service is recovering while regional validation continues.",
    status: "pending-review",
  },
  {
    id: "post-rollback-fork-2",
    label: "Support escalation guidance",
    baseline:
      "Tell customers the rollback fully resolved checkout errors everywhere.",
    escalationSafe:
      "Tell customers the rollback is in place and validation is still underway for some regions.",
    status: "pending-review",
  },
] as const satisfies readonly ReleasePostRollbackMessageFork[];

const initialAuditEvents = [
  {
    id: "post-rollback-audit-1",
    actor: "Avery",
    action: "initiated",
    detail:
      "Prepared segmented rollback messaging with region-specific timing and escalation-safe message forks.",
    timestamp: "2026-03-24 04:40 UTC",
  },
] as const satisfies readonly ReleasePostRollbackAuditEvent[];

export const releasePostRollbackFetchDelayMs = 180;
export const releasePostRollbackMutationDelayMs = 220;

let run: ReleasePostRollbackRun = { ...initialRun };
let segments: ReleasePostRollbackSegment[] = initialSegments.map((segment) => ({
  ...segment,
}));
let messageForks: ReleasePostRollbackMessageFork[] = initialMessageForks.map(
  (fork) => ({ ...fork }),
);
let auditEvents: ReleasePostRollbackAuditEvent[] = initialAuditEvents.map(
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

function cloneWorkspace(): ReleasePostRollbackWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    run: { ...run },
    segments: segments.map((segment) => ({ ...segment })),
    messageForks: messageForks.map((fork) => ({ ...fork })),
    auditEvents: auditEvents.map((event) => ({ ...event })),
  };
}

function nextAuditEventId(): ReleasePostRollbackAuditEventId {
  const eventId =
    `post-rollback-audit-${nextAuditEventNumber}` as ReleasePostRollbackAuditEventId;
  nextAuditEventNumber += 1;
  return eventId;
}

function appendAuditEvent(
  action: ReleasePostRollbackAuditEvent["action"],
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

function allSegmentsReady() {
  return segments.every(
    (segment) => segment.status === "ready" || segment.status === "published",
  );
}

function allForksApproved() {
  return messageForks.every((fork) => fork.status === "approved");
}

function nextQueuedSegment() {
  return segments.find((segment) => segment.status === "queued") ?? null;
}

export function resetReleasePostRollbackSegmentationMockState() {
  run = { ...initialRun };
  segments = initialSegments.map((segment) => ({ ...segment }));
  messageForks = initialMessageForks.map((fork) => ({ ...fork }));
  auditEvents = initialAuditEvents.map((event) => ({ ...event }));
  nextAuditEventNumber = initialAuditEvents.length + 1;
}

export function isReleasePostRollbackAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function fetchReleasePostRollbackWorkspace(
  signal?: AbortSignal,
): Promise<ReleasePostRollbackWorkspaceResponse> {
  return new Promise<ReleasePostRollbackWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);
        resolve(cloneWorkspace());
      }, releasePostRollbackFetchDelayMs);

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

export function startReleasePostRollback(
  input: StartReleasePostRollbackInput,
  signal?: AbortSignal,
): Promise<ReleasePostRollbackWorkspaceResponse> {
  return new Promise<ReleasePostRollbackWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (run.id !== input.runId || run.stage !== "draft") {
          reject(
            new Error(
              "Post-rollback segmentation is no longer ready to start.",
            ),
          );
          return;
        }

        segments = segments.map((segment, index) =>
          index === 0
            ? {
                ...segment,
                status: "scheduled",
                note: `${segment.label} is scheduled as the first segmented communication wave.`,
              }
            : segment,
        );

        run = {
          ...run,
          stage: "scheduling-segments",
          activeSegmentId: "post-rollback-segment-1",
          publishBlockedReason:
            "Schedule each customer segment before escalation-safe message forks can be approved.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Avery - Communications lead",
        };

        appendAuditEvent(
          "initiated",
          "Avery",
          "Started post-rollback segmentation and scheduled the first customer segment.",
        );
        resolve(cloneWorkspace());
      }, releasePostRollbackMutationDelayMs);

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

export function scheduleReleasePostRollbackSegment(
  input: ScheduleReleasePostRollbackSegmentInput,
  signal?: AbortSignal,
): Promise<ReleasePostRollbackWorkspaceResponse> {
  return new Promise<ReleasePostRollbackWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        const segment =
          segments.find((item) => item.id === input.segmentId) ?? null;

        if (
          !segment ||
          (segment.status !== "queued" && segment.status !== "scheduled")
        ) {
          reject(new Error("Segment scheduling is not available."));
          return;
        }

        segments = segments.map((item) =>
          item.id === input.segmentId
            ? {
                ...item,
                status: "ready",
                note: `${item.label} is scheduled and ready with region-specific timing.`,
              }
            : item,
        );

        appendAuditEvent(
          "scheduled",
          "Avery",
          `Scheduled ${segment.label} for ${segment.sendWindow}.`,
        );

        const nextSegment = nextQueuedSegment();
        if (nextSegment) {
          segments = segments.map((item) =>
            item.id === nextSegment.id
              ? {
                  ...item,
                  status: "scheduled",
                  note: `${item.label} is now the active segmentation wave awaiting timing confirmation.`,
                }
              : item,
          );

          run = {
            ...run,
            stage: "scheduling-segments",
            activeSegmentId: nextSegment.id,
            publishBlockedReason:
              "Complete region-specific timing for every segment before fork review can begin.",
            updatedAt: formatTimestamp(new Date()),
            updatedBy: "Avery - Communications lead",
          };
          resolve(cloneWorkspace());
          return;
        }

        run = {
          ...run,
          stage: "fork-review",
          activeSegmentId: null,
          publishBlockedReason:
            "Approve the escalation-safe message forks before publishing segmented rollback updates.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Avery - Communications lead",
        };
        resolve(cloneWorkspace());
      }, releasePostRollbackMutationDelayMs);

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

export function approveReleasePostRollbackForks(
  input: ApproveReleasePostRollbackForksInput,
  signal?: AbortSignal,
): Promise<ReleasePostRollbackWorkspaceResponse> {
  return new Promise<ReleasePostRollbackWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (
          run.id !== input.runId ||
          run.stage !== "fork-review" ||
          !allSegmentsReady()
        ) {
          reject(new Error("Fork approval is not available."));
          return;
        }

        messageForks = messageForks.map((fork) => ({
          ...fork,
          status: "approved",
        }));

        run = {
          ...run,
          stage: "ready-to-publish",
          publishBlockedReason: null,
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Priya - Legal reviewer",
        };

        appendAuditEvent(
          "approved",
          "Priya",
          "Approved the escalation-safe message forks for all segmented rollback updates.",
        );
        resolve(cloneWorkspace());
      }, releasePostRollbackMutationDelayMs);

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

export function publishReleasePostRollback(
  input: PublishReleasePostRollbackInput,
  signal?: AbortSignal,
): Promise<ReleasePostRollbackWorkspaceResponse> {
  return new Promise<ReleasePostRollbackWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (
          run.id !== input.runId ||
          run.stage !== "ready-to-publish" ||
          !allSegmentsReady() ||
          !allForksApproved()
        ) {
          reject(new Error("Segmented rollback publish is not available."));
          return;
        }

        segments = segments.map((segment) => ({
          ...segment,
          status: "published",
          note: `${segment.label} was published with the approved escalation-safe fork.`,
        }));

        run = {
          ...run,
          stage: "published",
          publishBlockedReason: null,
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Avery - Communications lead",
        };

        appendAuditEvent(
          "published",
          "Avery",
          "Published region-specific rollback updates after segmentation timing and fork approvals completed.",
        );
        resolve(cloneWorkspace());
      }, releasePostRollbackMutationDelayMs);

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
