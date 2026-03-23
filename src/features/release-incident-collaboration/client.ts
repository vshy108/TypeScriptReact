import type {
  ReleaseCollaboratorPresence,
  ReleaseIncidentConflictErrorShape,
  ReleaseIncidentRecord,
  ReleaseIncidentWorkspaceResponse,
  SaveReleaseIncidentInput,
  SaveReleaseIncidentSuccess,
} from "./types";

const initialRecord = {
  id: "incident-1",
  title: "Release incident customer update",
  audience: "Affected enterprise tenants",
  summary:
    "We identified elevated error rates in the rollout region, paused the rollout, and are preparing the next customer-facing incident update.",
  revision: 1,
  updatedAt: "2026-03-23 18:05 UTC",
  updatedBy: "Avery - Incident commander",
} as const satisfies ReleaseIncidentRecord;

const initialCollaborators = [
  {
    id: "collaborator-1",
    name: "Avery",
    role: "Incident commander",
    status: "editing",
    lastSeen: "18:05 UTC",
  },
  {
    id: "collaborator-2",
    name: "Mina",
    role: "Support liaison",
    status: "reviewing",
    lastSeen: "18:04 UTC",
  },
] as const satisfies readonly ReleaseCollaboratorPresence[];

export const releaseIncidentFetchDelayMs = 180;
export const releaseIncidentSaveDelayMs = 260;
export const releaseIncidentPollIntervalMs = 650;

let serverRecord: ReleaseIncidentRecord = { ...initialRecord };
let serverCollaborators: ReleaseCollaboratorPresence[] =
  initialCollaborators.map((collaborator) => ({ ...collaborator }));

class ReleaseIncidentConflictError extends Error {
  readonly code: ReleaseIncidentConflictErrorShape["code"];
  readonly latestRecord?: ReleaseIncidentRecord;
  readonly latestCollaborators?: readonly ReleaseCollaboratorPresence[];

  constructor(details: ReleaseIncidentConflictErrorShape) {
    super(details.message);
    this.name = "ReleaseIncidentConflictError";
    this.code = details.code;
    this.latestRecord = details.latestRecord;
    this.latestCollaborators = details.latestCollaborators;
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

function createConflictError(details: ReleaseIncidentConflictErrorShape) {
  return new ReleaseIncidentConflictError(details);
}

export function isReleaseIncidentAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function isReleaseIncidentConflictError(
  error: unknown,
): error is ReleaseIncidentConflictError {
  return error instanceof ReleaseIncidentConflictError;
}

export function resetReleaseIncidentCollaborationMockState() {
  serverRecord = { ...initialRecord };
  serverCollaborators = initialCollaborators.map((collaborator) => ({
    ...collaborator,
  }));
}

export function simulateTeammateIncidentEdit() {
  serverRecord = {
    ...serverRecord,
    revision: serverRecord.revision + 1,
    summary:
      "We identified elevated error rates in the rollout region, paused the rollout, confirmed mitigation, and Support is reviewing the next customer-facing incident update.",
    updatedAt: formatTimestamp(new Date()),
    updatedBy: "Jordan - Communications lead",
  };

  serverCollaborators = [
    {
      id: "collaborator-3",
      name: "Jordan",
      role: "Communications lead",
      status: "editing",
      lastSeen: formatTimestamp(new Date()),
    },
    ...serverCollaborators.map((collaborator) =>
      collaborator.id === "collaborator-1"
        ? {
            ...collaborator,
            status: "reviewing",
            lastSeen: formatTimestamp(new Date()),
          }
        : collaborator,
    ),
  ];
}

export function fetchReleaseIncidentWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseIncidentWorkspaceResponse> {
  return new Promise<ReleaseIncidentWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve({
        polledAt: formatTimestamp(new Date()),
        record: { ...serverRecord },
        collaborators: serverCollaborators.map((collaborator) => ({
          ...collaborator,
        })),
      });
    }, releaseIncidentFetchDelayMs);

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

export function saveReleaseIncidentDraft(
  input: SaveReleaseIncidentInput,
  signal?: AbortSignal,
): Promise<SaveReleaseIncidentSuccess> {
  return new Promise<SaveReleaseIncidentSuccess>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      const normalizedSummary = input.summary.trim();
      if (normalizedSummary.length < 48) {
        reject(
          createConflictError({
            code: "summary-too-short",
            message:
              "Collaborative incident updates need enough context for other editors, so keep the summary at 48 characters or longer.",
          }),
        );
        return;
      }

      if (serverRecord.revision !== input.expectedRevision) {
        reject(
          createConflictError({
            code: "conflict",
            message:
              "A teammate changed the shared incident draft while you were editing. Reload the latest version before saving again.",
            latestRecord: { ...serverRecord },
            latestCollaborators: serverCollaborators.map((collaborator) => ({
              ...collaborator,
            })),
          }),
        );
        return;
      }

      serverRecord = {
        ...serverRecord,
        revision: serverRecord.revision + 1,
        summary: normalizedSummary,
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Taylor - On-call engineer",
      };

      serverCollaborators = serverCollaborators.map((collaborator) =>
        collaborator.id === "collaborator-1"
          ? {
              ...collaborator,
              status: "editing",
              lastSeen: formatTimestamp(new Date()),
            }
          : collaborator,
      );

      resolve({
        savedAt: serverRecord.updatedAt,
        record: { ...serverRecord },
        collaborators: serverCollaborators.map((collaborator) => ({
          ...collaborator,
        })),
      });
    }, releaseIncidentSaveDelayMs);

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
