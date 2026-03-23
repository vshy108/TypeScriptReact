import type {
  ReleaseMergeRecord,
  ReleaseMergeWorkspaceResponse,
  SaveReleaseMergeDraftInput,
} from "./types";

const initialRecord = {
  id: "merge-1",
  title: "Release field-level merge workflow",
  headline: "Mitigation is in progress for the paused rollout.",
  summary:
    "We paused the rollout, engaged the incident team, and are preparing the next customer update while mitigation continues.",
  revision: 1,
  updatedAt: "2026-03-23 19:10 UTC",
  updatedBy: "Avery - Incident commander",
} as const satisfies ReleaseMergeRecord;

export const releaseMergeFetchDelayMs = 180;
export const releaseMergeSaveDelayMs = 240;

let serverRecord: ReleaseMergeRecord = { ...initialRecord };

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

export function isReleaseMergeAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function resetReleaseFieldMergeMockState() {
  serverRecord = { ...initialRecord };
}

export function simulateTeammateMergeEdit() {
  serverRecord = {
    ...serverRecord,
    revision: serverRecord.revision + 1,
    headline: "Mitigation is confirmed and the rollout remains paused.",
    summary:
      "We paused the rollout, confirmed mitigation progress, and are preparing the next customer update while support readies outbound guidance.",
    updatedAt: formatTimestamp(new Date()),
    updatedBy: "Jordan - Communications lead",
  };
}

export function fetchReleaseMergeWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseMergeWorkspaceResponse> {
  return new Promise<ReleaseMergeWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve({
        refreshedAt: formatTimestamp(new Date()),
        record: { ...serverRecord },
      });
    }, releaseMergeFetchDelayMs);

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

export function saveReleaseMergeDraft(
  input: SaveReleaseMergeDraftInput,
  signal?: AbortSignal,
): Promise<ReleaseMergeWorkspaceResponse> {
  return new Promise<ReleaseMergeWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (serverRecord.revision !== input.expectedRevision) {
        reject(
          new Error(
            "The server version changed before the merged draft was saved.",
          ),
        );
        return;
      }

      serverRecord = {
        ...serverRecord,
        revision: serverRecord.revision + 1,
        headline: input.headline.trim(),
        summary: input.summary.trim(),
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Taylor - On-call engineer",
      };

      resolve({
        refreshedAt: serverRecord.updatedAt,
        record: { ...serverRecord },
      });
    }, releaseMergeSaveDelayMs);

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
