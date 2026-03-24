import type {
  ReleaseApprovalMutationErrorShape,
  ReleaseApprovalMutationInput,
  ReleaseApprovalMutationSuccess,
  ReleaseApprovalRecord,
  ReleaseApprovalWorkspaceResponse,
} from "./types";

const baseRecords = [
  {
    id: "release-1",
    name: "Navigation recovery rollout",
    owner: "Frontend platform",
    stage: "review",
    currentDecision: "approve",
    rolloutPercent: 55,
    requiresRunbook: false,
    updatedAt: "2026-03-23 15:20 UTC",
    history: [
      {
        id: "history-1",
        actor: "Priya - Release captain",
        decision: "approve",
        note: "Canary telemetry stayed within the expected error budget for the last 12 hours.",
        rolloutPercent: 55,
        recordedAt: "2026-03-23 15:20 UTC",
      },
    ],
  },
  {
    id: "release-2",
    name: "Accessibility checklist pass",
    owner: "Design systems",
    stage: "ready",
    currentDecision: "hold",
    rolloutPercent: 20,
    requiresRunbook: false,
    updatedAt: "2026-03-23 13:05 UTC",
    history: [
      {
        id: "history-2",
        actor: "Mina - Accessibility QA",
        decision: "hold",
        note: "Keep the rollout at 20% until Safari VoiceOver verification finishes.",
        rolloutPercent: 20,
        recordedAt: "2026-03-23 13:05 UTC",
      },
    ],
  },
  {
    id: "release-3",
    name: "Offline sync stabilization",
    owner: "Client infrastructure",
    stage: "blocked",
    currentDecision: "rollback",
    rolloutPercent: 5,
    requiresRunbook: true,
    updatedAt: "2026-03-23 10:40 UTC",
    history: [
      {
        id: "history-3",
        actor: "Jordan - Incident commander",
        decision: "rollback",
        note: "Rollback started after timeout spikes crossed the incident threshold.",
        rolloutPercent: 5,
        recordedAt: "2026-03-23 10:40 UTC",
      },
    ],
  },
] as const satisfies readonly ReleaseApprovalRecord[];

export const releaseApprovalFetchDelayMs = 260;
export const releaseApprovalSaveDelayMs = 340;

let nextRevision = 1;
let nextHistoryNumber = 4;
let releaseStore: ReleaseApprovalRecord[] = baseRecords.map((release) => ({
  ...release,
  history: [...release.history],
}));

class ReleaseApprovalMutationError extends Error {
  readonly code: ReleaseApprovalMutationErrorShape["code"];

  constructor(details: ReleaseApprovalMutationErrorShape) {
    super(details.message);
    this.name = "ReleaseApprovalMutationError";
    this.code = details.code;
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

function createMutationError(details: ReleaseApprovalMutationErrorShape) {
  return new ReleaseApprovalMutationError(details);
}

export function isReleaseApprovalAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function isReleaseApprovalMutationError(
  error: unknown,
): error is ReleaseApprovalMutationError {
  return error instanceof ReleaseApprovalMutationError;
}

export function resetReleaseApprovalMockState() {
  nextRevision = 1;
  nextHistoryNumber = 4;
  releaseStore = baseRecords.map((release) => ({
    ...release,
    history: [...release.history],
  }));
}

function buildWorkspaceResponse(
  revision: number,
): ReleaseApprovalWorkspaceResponse {
  return {
    revision,
    loadedAt: formatTimestamp(new Date()),
    releases: releaseStore.map((release) => ({
      ...release,
      history: [...release.history],
    })),
  };
}

export function fetchReleaseApprovalWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseApprovalWorkspaceResponse> {
  const revision = nextRevision++;

  return new Promise<ReleaseApprovalWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve(buildWorkspaceResponse(revision));
    }, releaseApprovalFetchDelayMs);

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

export function submitReleaseApprovalDecision(
  input: ReleaseApprovalMutationInput,
  signal?: AbortSignal,
): Promise<ReleaseApprovalMutationSuccess> {
  const revision = nextRevision++;

  return new Promise<ReleaseApprovalMutationSuccess>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      const normalizedNote = input.note.trim();
      if (input.decision === "rollback" && normalizedNote.length < 20) {
        reject(
          createMutationError({
            code: "note-too-short",
            message:
              "Rollback decisions need a note of at least 20 characters.",
          }),
        );
        return;
      }

      if (
        input.decision === "approve" &&
        input.rolloutPercent > 80 &&
        !normalizedNote.toLowerCase().includes("runbook")
      ) {
        reject(
          createMutationError({
            code: "runbook-required",
            message:
              "High-rollout approvals must mention the runbook or mitigation plan.",
          }),
        );
        return;
      }

      const storedRelease = releaseStore.find(
        (release) => release.id === input.releaseId,
      );
      if (!storedRelease) {
        reject(
          createMutationError({
            code: "note-too-short",
            message: "The selected release no longer exists in the workspace.",
          }),
        );
        return;
      }

      const savedAt = formatTimestamp(new Date());
      const nextStage =
        input.decision === "approve"
          ? "ready"
          : input.decision === "hold"
            ? "paused"
            : "blocked";
      const nextHistoryEntry = {
        id: `history-${nextHistoryNumber++}`,
        actor: "Taylor - Release owner",
        decision: input.decision,
        note: normalizedNote,
        rolloutPercent: input.rolloutPercent,
        recordedAt: savedAt,
      } as const;

      releaseStore = releaseStore.map((release) =>
        release.id === input.releaseId
          ? {
              ...release,
              currentDecision: input.decision,
              rolloutPercent: input.rolloutPercent,
              updatedAt: savedAt,
              stage: nextStage,
              history: [nextHistoryEntry, ...release.history],
            }
          : release,
      );

      const savedRelease = releaseStore.find(
        (release) => release.id === input.releaseId,
      );
      if (!savedRelease) {
        reject(
          createMutationError({
            code: "note-too-short",
            message: "The saved release could not be reloaded.",
          }),
        );
        return;
      }

      resolve({
        revision,
        savedAt,
        release: {
          ...savedRelease,
          history: [...savedRelease.history],
        },
      });
    }, releaseApprovalSaveDelayMs);

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
