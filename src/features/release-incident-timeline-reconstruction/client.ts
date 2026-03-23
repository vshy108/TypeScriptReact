import type {
  GenerateReleaseTimelineSummaryInput,
  PublishReleaseTimelineSummaryInput,
  ReleaseTimelineAuditEvent,
  ReleaseTimelineAuditEventId,
  ReleaseTimelineConflict,
  ReleaseTimelineEntry,
  ReleaseTimelineExecutiveSummary,
  ReleaseTimelineRun,
  ReleaseTimelineWorkspaceResponse,
  ResolveReleaseTimelineConflictInput,
  StartReleaseTimelineInput,
} from "./types";

const initialRun = {
  id: "timeline-run-1",
  title: "Incident timeline reconstruction with summary gate",
  summary:
    "Reconstruct the incident timeline from conflicting witness notes, resolve the canonical event sequence, and keep the executive summary blocked until the timeline is safe to publish.",
  stage: "draft",
  activeConflictId: null,
  publishBlockedReason:
    "Timeline conflicts must be resolved before the executive summary can be published.",
  updatedAt: "2026-03-24 02:55 UTC",
  updatedBy: "Jordan - Incident scribe",
} as const satisfies ReleaseTimelineRun;

const initialEntries = [
  {
    id: "timeline-entry-1",
    timestampLabel: "14:02 UTC",
    actor: "Jordan",
    note: "Primary alert fired for elevated database saturation in the primary region.",
    source: "ops",
    status: "confirmed",
  },
  {
    id: "timeline-entry-2",
    timestampLabel: "14:07 UTC",
    actor: "Mina",
    note: "Support channel reported customer-impacting errors before regional failover was confirmed.",
    source: "support",
    status: "conflicting",
  },
  {
    id: "timeline-entry-3",
    timestampLabel: "14:07 UTC",
    actor: "Taylor",
    note: "Operations confirmed the regional failover trigger before customer-facing error volume peaked.",
    source: "ops",
    status: "conflicting",
  },
  {
    id: "timeline-entry-4",
    timestampLabel: "14:12 UTC",
    actor: "Avery",
    note: "Executive stakeholders were notified once the mitigation owner confirmed the containment step.",
    source: "executive",
    status: "confirmed",
  },
] as const satisfies readonly ReleaseTimelineEntry[];

const initialConflicts = [
  {
    id: "timeline-conflict-1",
    label: "14:07 UTC failover ordering",
    status: "open",
    leftEntry: initialEntries[1],
    rightEntry: initialEntries[2],
    resolvedSource: null,
    note: "Support and operations disagree about whether customer-facing impact or failover confirmation happened first.",
  },
] as const satisfies readonly ReleaseTimelineConflict[];

const initialExecutiveSummary = {
  headline: "Executive summary blocked pending timeline reconciliation",
  body: "Resolve the conflicting 14:07 UTC witness notes before publishing a customer-safe executive summary.",
  status: "blocked",
  safetyNote:
    "The summary gate is blocked because the failover ordering is not yet reliable enough for executive distribution.",
} as const satisfies ReleaseTimelineExecutiveSummary;

const initialAuditEvents = [
  {
    id: "timeline-audit-1",
    actor: "Jordan",
    action: "initiated",
    detail:
      "Opened timeline reconstruction with witness notes from operations, support, and executive communications.",
    timestamp: "2026-03-24 02:50 UTC",
  },
] as const satisfies readonly ReleaseTimelineAuditEvent[];

export const releaseTimelineFetchDelayMs = 180;
export const releaseTimelineMutationDelayMs = 220;

let run: ReleaseTimelineRun = { ...initialRun };
let entries: ReleaseTimelineEntry[] = initialEntries.map((entry) => ({
  ...entry,
}));
let conflicts: ReleaseTimelineConflict[] = initialConflicts.map((conflict) => ({
  ...conflict,
  leftEntry: { ...conflict.leftEntry },
  rightEntry: { ...conflict.rightEntry },
}));
let executiveSummary: ReleaseTimelineExecutiveSummary = {
  ...initialExecutiveSummary,
};
let auditEvents: ReleaseTimelineAuditEvent[] = initialAuditEvents.map(
  (event) => ({
    ...event,
  }),
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

function cloneWorkspace(): ReleaseTimelineWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    run: { ...run },
    entries: entries.map((entry) => ({ ...entry })),
    conflicts: conflicts.map((conflict) => ({
      ...conflict,
      leftEntry: { ...conflict.leftEntry },
      rightEntry: { ...conflict.rightEntry },
    })),
    executiveSummary: { ...executiveSummary },
    auditEvents: auditEvents.map((event) => ({ ...event })),
  };
}

function nextAuditEventId(): ReleaseTimelineAuditEventId {
  const eventId =
    `timeline-audit-${nextAuditEventNumber}` as ReleaseTimelineAuditEventId;
  nextAuditEventNumber += 1;
  return eventId;
}

function appendAuditEvent(
  action: ReleaseTimelineAuditEvent["action"],
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

function allConflictsResolved() {
  return conflicts.every((conflict) => conflict.status === "resolved");
}

export function resetReleaseTimelineReconstructionMockState() {
  run = { ...initialRun };
  entries = initialEntries.map((entry) => ({ ...entry }));
  conflicts = initialConflicts.map((conflict) => ({
    ...conflict,
    leftEntry: { ...conflict.leftEntry },
    rightEntry: { ...conflict.rightEntry },
  }));
  executiveSummary = { ...initialExecutiveSummary };
  auditEvents = initialAuditEvents.map((event) => ({ ...event }));
  nextAuditEventNumber = initialAuditEvents.length + 1;
}

export function isReleaseTimelineAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function fetchReleaseTimelineWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseTimelineWorkspaceResponse> {
  return new Promise<ReleaseTimelineWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve(cloneWorkspace());
    }, releaseTimelineFetchDelayMs);

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
  });
}

export function startReleaseTimeline(
  input: StartReleaseTimelineInput,
  signal?: AbortSignal,
): Promise<ReleaseTimelineWorkspaceResponse> {
  return new Promise<ReleaseTimelineWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (run.id !== input.runId || run.stage !== "draft") {
        reject(
          new Error("Timeline reconstruction is no longer ready to start."),
        );
        return;
      }

      run = {
        ...run,
        stage: "resolving-conflicts",
        activeConflictId: "timeline-conflict-1",
        publishBlockedReason:
          "Resolve the conflicting witness notes before generating the executive summary.",
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Jordan - Incident scribe",
      };

      appendAuditEvent(
        "initiated",
        "Jordan",
        "Started timeline reconstruction and flagged the conflicting 14:07 UTC witness notes for review.",
      );
      resolve(cloneWorkspace());
    }, releaseTimelineMutationDelayMs);

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
  });
}

export function resolveReleaseTimelineConflict(
  input: ResolveReleaseTimelineConflictInput,
  signal?: AbortSignal,
): Promise<ReleaseTimelineWorkspaceResponse> {
  return new Promise<ReleaseTimelineWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      const conflict =
        conflicts.find((item) => item.id === input.conflictId) ?? null;

      if (!conflict || conflict.status !== "open") {
        reject(new Error("Conflict resolution is not available."));
        return;
      }

      const resolvedEntry =
        input.resolvedSource === "ops"
          ? conflict.rightEntry
          : conflict.leftEntry;
      const discardedEntry =
        input.resolvedSource === "ops"
          ? conflict.leftEntry
          : conflict.rightEntry;

      conflicts = conflicts.map((item) =>
        item.id === input.conflictId
          ? {
              ...item,
              status: "resolved",
              resolvedSource: input.resolvedSource,
              note: `${resolvedEntry.actor}'s ${resolvedEntry.source} note is now the canonical timeline entry for ${item.label}.`,
            }
          : item,
      );

      entries = entries.map((entry) => {
        if (entry.id === resolvedEntry.id) {
          return {
            ...entry,
            status: "resolved",
            note: `${entry.note} This entry is now the canonical timeline record.`,
          };
        }

        if (entry.id === discardedEntry.id) {
          return {
            ...entry,
            status: "resolved",
            note: `${entry.note} This entry was retained as supporting context but not selected as canonical.`,
          };
        }

        return entry;
      });

      run = {
        ...run,
        stage: "summary-blocked",
        activeConflictId: null,
        publishBlockedReason:
          "Regenerate the executive summary now that the canonical timeline is set.",
        updatedAt: formatTimestamp(new Date()),
        updatedBy: resolvedEntry.actor,
      };

      executiveSummary = {
        ...executiveSummary,
        headline:
          "Executive summary blocked until regenerated from the reconciled timeline",
        body: `Canonical 14:07 UTC event selected from ${resolvedEntry.source}. Regenerate the executive summary before publish.`,
        status: "blocked",
        safetyNote:
          "The timeline conflict is resolved, but the executive summary still needs a fresh safe-to-publish narrative.",
      };

      appendAuditEvent(
        "resolved",
        resolvedEntry.actor,
        `Resolved ${conflict.label} in favor of the ${resolvedEntry.source} witness note and retained the other note as supporting context.`,
      );

      resolve(cloneWorkspace());
    }, releaseTimelineMutationDelayMs);

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
  });
}

export function generateReleaseTimelineSummary(
  input: GenerateReleaseTimelineSummaryInput,
  signal?: AbortSignal,
): Promise<ReleaseTimelineWorkspaceResponse> {
  return new Promise<ReleaseTimelineWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (
        run.id !== input.runId ||
        run.stage !== "summary-blocked" ||
        !allConflictsResolved()
      ) {
        reject(new Error("Executive summary generation is not available."));
        return;
      }

      executiveSummary = {
        headline: "Failover ordering reconciled and executive summary ready",
        body: "Operations confirmed the regional failover before customer-visible errors peaked, and stakeholder communications followed the containment confirmation at 14:12 UTC.",
        status: "ready",
        safetyNote:
          "The summary now references the reconciled timeline and is safe to publish to executive stakeholders.",
      };

      run = {
        ...run,
        stage: "ready-to-publish",
        publishBlockedReason: null,
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Jordan - Incident scribe",
      };

      appendAuditEvent(
        "summarized",
        "Jordan",
        "Generated a publish-safe executive summary from the reconciled incident timeline.",
      );

      resolve(cloneWorkspace());
    }, releaseTimelineMutationDelayMs);

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
  });
}

export function publishReleaseTimelineSummary(
  input: PublishReleaseTimelineSummaryInput,
  signal?: AbortSignal,
): Promise<ReleaseTimelineWorkspaceResponse> {
  return new Promise<ReleaseTimelineWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (run.id !== input.runId || run.stage !== "ready-to-publish") {
        reject(new Error("Executive summary publish is not available."));
        return;
      }

      executiveSummary = {
        ...executiveSummary,
        status: "published",
        safetyNote:
          "Executive summary was published from the reconciled timeline and audit history.",
      };

      run = {
        ...run,
        stage: "published",
        publishBlockedReason: null,
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Avery - Release coordinator",
      };

      appendAuditEvent(
        "published",
        "Avery",
        "Published the executive summary after timeline reconciliation and summary regeneration completed.",
      );

      resolve(cloneWorkspace());
    }, releaseTimelineMutationDelayMs);

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
  });
}
