import type {
  ResolveBlockerErrorShape,
  ResolveBlockerInput,
  ResolveBlockerSuccess,
  RolloutBlocker,
  RolloutWorkspaceResponse,
} from "./types";

const baseBlockers = [
  {
    id: "blocker-1",
    title: "Router cache trace needs one more healthy canary cycle",
    owner: "Frontend platform",
    severity: "medium",
    affectedSurface: "Navigation shell",
    requiresEscalation: false,
    updatedAt: "2026-03-23 15:45 UTC",
    resolutionNote: null,
    resolved: false,
  },
  {
    id: "blocker-2",
    title:
      "VoiceOver regression still needs an escalation sign-off before rollout",
    owner: "Inclusive design",
    severity: "high",
    affectedSurface: "Accessibility pass",
    requiresEscalation: true,
    updatedAt: "2026-03-23 14:10 UTC",
    resolutionNote: null,
    resolved: false,
  },
  {
    id: "blocker-3",
    title:
      "Support notes are drafted but not yet attached to the release handoff",
    owner: "Customer success",
    severity: "low",
    affectedSurface: "Support workflow",
    requiresEscalation: false,
    updatedAt: "2026-03-23 13:25 UTC",
    resolutionNote: null,
    resolved: false,
  },
] as const satisfies readonly RolloutBlocker[];

export const rolloutWorkspaceFetchDelayMs = 240;
export const rolloutResolveDelayMs = 320;

let nextRevision = 1;
let rolloutStore: RolloutBlocker[] = baseBlockers.map((blocker) => ({
  ...blocker,
}));

class ResolveBlockerError extends Error {
  readonly code: ResolveBlockerErrorShape["code"];

  constructor(details: ResolveBlockerErrorShape) {
    super(details.message);
    this.name = "ResolveBlockerError";
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

function createResolveError(details: ResolveBlockerErrorShape) {
  return new ResolveBlockerError(details);
}

export function isRolloutAbortError(error: unknown): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function isResolveBlockerError(
  error: unknown,
): error is ResolveBlockerError {
  return error instanceof ResolveBlockerError;
}

export function resetRolloutOptimisticMockState() {
  nextRevision = 1;
  rolloutStore = baseBlockers.map((blocker) => ({ ...blocker }));
}

function buildWorkspaceResponse(revision: number): RolloutWorkspaceResponse {
  return {
    revision,
    loadedAt: formatTimestamp(new Date()),
    blockers: rolloutStore.map((blocker) => ({ ...blocker })),
  };
}

export function fetchRolloutWorkspace(
  signal?: AbortSignal,
): Promise<RolloutWorkspaceResponse> {
  const revision = nextRevision++;

  return new Promise<RolloutWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve(buildWorkspaceResponse(revision));
    }, rolloutWorkspaceFetchDelayMs);

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

export function resolveRolloutBlocker(
  input: ResolveBlockerInput,
  signal?: AbortSignal,
): Promise<ResolveBlockerSuccess> {
  const revision = nextRevision++;

  return new Promise<ResolveBlockerSuccess>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      const normalizedNote = input.resolutionNote.trim();
      if (normalizedNote.length < 18) {
        reject(
          createResolveError({
            code: "note-too-short",
            message:
              "Optimistic resolutions still require a note of at least 18 characters.",
          }),
        );
        return;
      }

      const storedBlocker = rolloutStore.find(
        (blocker) => blocker.id === input.blockerId,
      );
      if (!storedBlocker) {
        reject(
          createResolveError({
            code: "note-too-short",
            message: "The selected blocker could not be found.",
          }),
        );
        return;
      }

      if (
        storedBlocker.requiresEscalation &&
        !normalizedNote.toLowerCase().includes("escalate")
      ) {
        reject(
          createResolveError({
            code: "escalation-required",
            message:
              "This blocker requires an escalation note before it can stay resolved.",
          }),
        );
        return;
      }

      const savedAt = formatTimestamp(new Date());
      rolloutStore = rolloutStore.map((blocker) =>
        blocker.id === input.blockerId
          ? {
              ...blocker,
              resolved: true,
              resolutionNote: normalizedNote,
              updatedAt: savedAt,
            }
          : blocker,
      );

      const savedBlocker = rolloutStore.find(
        (blocker) => blocker.id === input.blockerId,
      );
      if (!savedBlocker) {
        reject(
          createResolveError({
            code: "note-too-short",
            message: "The resolved blocker could not be reloaded.",
          }),
        );
        return;
      }

      resolve({
        revision,
        savedAt,
        blocker: { ...savedBlocker },
      });
    }, rolloutResolveDelayMs);

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
