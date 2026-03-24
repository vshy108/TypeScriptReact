import type {
  ReleaseAuditEntry,
  ReleaseHistoryRecord,
  ReleaseHistoryWorkspaceResponse,
  SaveReleaseHistoryDraftInput,
} from "./types";

const initialRecord = {
  id: "history-1",
  title: "Release audit history and undo",
  headline: "Mitigation is confirmed and the rollout remains paused.",
  summary:
    "We confirmed mitigation, kept the rollout paused, and are preparing the next customer update while support coordinates outbound guidance.",
  revision: 1,
  updatedAt: "2026-03-23 19:40 UTC",
  updatedBy: "Avery - Incident commander",
} as const satisfies ReleaseHistoryRecord;

const initialAuditTrail = [
  {
    id: "audit-1",
    revision: 1,
    actor: "Avery - Incident commander",
    reason: "Initial incident update draft",
    timestamp: "2026-03-23 19:40 UTC",
    snapshot: { ...initialRecord },
  },
] as const satisfies readonly ReleaseAuditEntry[];

export const releaseHistoryFetchDelayMs = 180;
export const releaseHistoryMutationDelayMs = 240;

let serverRecord: ReleaseHistoryRecord = { ...initialRecord };
let auditTrail: ReleaseAuditEntry[] = initialAuditTrail.map((entry) => ({
  ...entry,
  snapshot: { ...entry.snapshot },
}));

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

function cloneWorkspace(): ReleaseHistoryWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    record: { ...serverRecord },
    auditTrail: auditTrail.map((entry) => ({
      ...entry,
      snapshot: { ...entry.snapshot },
    })),
  };
}

function appendAuditEntry(actor: string, reason: string) {
  const nextEntry: ReleaseAuditEntry = {
    id: `audit-${auditTrail.length + 1}`,
    revision: serverRecord.revision,
    actor,
    reason,
    timestamp: serverRecord.updatedAt,
    snapshot: { ...serverRecord },
  };

  auditTrail = [nextEntry, ...auditTrail];
}

export function resetReleaseChangeHistoryMockState() {
  serverRecord = { ...initialRecord };
  auditTrail = initialAuditTrail.map((entry) => ({
    ...entry,
    snapshot: { ...entry.snapshot },
  }));
}

export function isReleaseHistoryAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function fetchReleaseHistoryWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseHistoryWorkspaceResponse> {
  return new Promise<ReleaseHistoryWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve(cloneWorkspace());
    }, releaseHistoryFetchDelayMs);

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

export function saveReleaseHistoryDraft(
  input: SaveReleaseHistoryDraftInput,
  signal?: AbortSignal,
): Promise<ReleaseHistoryWorkspaceResponse> {
  return new Promise<ReleaseHistoryWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      serverRecord = {
        ...serverRecord,
        revision: serverRecord.revision + 1,
        headline: input.headline.trim(),
        summary: input.summary.trim(),
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Taylor - On-call engineer",
      };
      appendAuditEntry(serverRecord.updatedBy, "Saved merged release update");
      resolve(cloneWorkspace());
    }, releaseHistoryMutationDelayMs);

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

export function simulateTeammateHistoryChange(
  signal?: AbortSignal,
): Promise<ReleaseHistoryWorkspaceResponse> {
  return new Promise<ReleaseHistoryWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      serverRecord = {
        ...serverRecord,
        revision: serverRecord.revision + 1,
        headline: "Mitigation is confirmed and support guidance is published.",
        summary:
          "We confirmed mitigation, kept the rollout paused, and published the support guidance that accompanies the next customer update.",
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Jordan - Communications lead",
      };
      appendAuditEntry(
        serverRecord.updatedBy,
        "Updated customer-facing wording with support guidance",
      );
      resolve(cloneWorkspace());
    }, releaseHistoryMutationDelayMs);

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

export function undoLatestReleaseHistoryChange(
  signal?: AbortSignal,
): Promise<ReleaseHistoryWorkspaceResponse> {
  return new Promise<ReleaseHistoryWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (auditTrail.length < 2) {
        reject(new Error("No previous revision is available to undo to."));
        return;
      }

      const [, previousEntry, ...remainingEntries] = auditTrail;
      if (!previousEntry) {
        reject(new Error("No previous revision is available to undo to."));
        return;
      }
      serverRecord = {
        ...previousEntry.snapshot,
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Taylor - On-call engineer",
      };
      auditTrail = [
        {
          id: `audit-${remainingEntries.length + 2}`,
          revision: serverRecord.revision,
          actor: "Taylor - On-call engineer",
          reason: `Undid revision ${auditTrail[0]?.revision}`,
          timestamp: serverRecord.updatedAt,
          snapshot: { ...serverRecord },
        },
        previousEntry,
        ...remainingEntries,
      ];

      resolve(cloneWorkspace());
    }, releaseHistoryMutationDelayMs);

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
