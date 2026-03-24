import type {
  ReleaseHandoffConflictErrorShape,
  ReleaseHandoffRecord,
  ReleaseHandoffWorkspaceResponse,
  SaveReleaseHandoffInput,
  SaveReleaseHandoffSuccess,
} from "./types";

const initialRecord = {
  id: "handoff-1",
  title: "Stable rollout handoff note",
  owner: "Release operations",
  handoffNote:
    "Customer support is briefed and the launch room stays open until 90% rollout.",
  rolloutPercent: 90,
  revision: 1,
  updatedBy: "Avery - Release operations",
  updatedAt: "2026-03-23 16:10 UTC",
} as const satisfies ReleaseHandoffRecord;

export const releaseHandoffFetchDelayMs = 180;
export const releaseHandoffSaveDelayMs = 260;
export const releaseHandoffPollIntervalMs = 600;

let serverRecord: ReleaseHandoffRecord = { ...initialRecord };

class ReleaseHandoffConflictError extends Error {
  readonly code: ReleaseHandoffConflictErrorShape["code"];
  readonly serverRecord?: ReleaseHandoffRecord;

  constructor(details: ReleaseHandoffConflictErrorShape) {
    super(details.message);
    this.name = "ReleaseHandoffConflictError";
    this.code = details.code;
    if (details.serverRecord !== undefined) {
      this.serverRecord = details.serverRecord;
    }
  }
}

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

function createConflictError(details: ReleaseHandoffConflictErrorShape) {
  return new ReleaseHandoffConflictError(details);
}

export function isReleaseHandoffAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function isReleaseHandoffConflictError(
  error: unknown,
): error is ReleaseHandoffConflictError {
  return error instanceof ReleaseHandoffConflictError;
}

export function resetReleaseHandoffConflictMockState() {
  serverRecord = { ...initialRecord };
}

export function simulateExternalHandoffUpdate() {
  serverRecord = {
    ...serverRecord,
    revision: serverRecord.revision + 1,
    handoffNote:
      "Customer support is briefed, escalation coverage is confirmed, and the launch room stays staffed through final rollout.",
    updatedBy: "Morgan - Incident communications",
    updatedAt: formatTimestamp(new Date()),
  };
}

export function fetchReleaseHandoffWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseHandoffWorkspaceResponse> {
  return new Promise<ReleaseHandoffWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve({
        polledAt: formatTimestamp(new Date()),
        record: { ...serverRecord },
      });
    }, releaseHandoffFetchDelayMs);

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

export function saveReleaseHandoff(
  input: SaveReleaseHandoffInput,
  signal?: AbortSignal,
): Promise<SaveReleaseHandoffSuccess> {
  return new Promise<SaveReleaseHandoffSuccess>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      const normalizedNote = input.handoffNote.trim();
      if (normalizedNote.length < 24) {
        reject(
          createConflictError({
            code: "note-too-short",
            message:
              "Conflict-aware saves still require a note of at least 24 characters.",
          }),
        );
        return;
      }

      if (serverRecord.revision !== input.expectedRevision) {
        reject(
          createConflictError({
            code: "conflict",
            message:
              "The server version changed while you were editing. Reload the latest version before saving again.",
            serverRecord: { ...serverRecord },
          }),
        );
        return;
      }

      serverRecord = {
        ...serverRecord,
        revision: serverRecord.revision + 1,
        handoffNote: normalizedNote,
        updatedBy: "Taylor - Release owner",
        updatedAt: formatTimestamp(new Date()),
      };

      resolve({
        savedAt: serverRecord.updatedAt,
        record: { ...serverRecord },
      });
    }, releaseHandoffSaveDelayMs);

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
