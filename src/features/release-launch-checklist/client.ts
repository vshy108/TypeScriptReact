import type {
  LaunchChecklistRecord,
  LaunchChecklistWorkspaceResponse,
  SaveLaunchStepErrorShape,
  SaveLaunchStepInput,
  SaveLaunchStepSuccess,
} from "./types";

const initialLaunchRecord = {
  id: "launch-1",
  name: "Stable rollout go-live checklist",
  owner: "Release operations",
  rolloutPercent: 85,
  steps: [
    {
      id: "freeze-window",
      title: "Freeze the release window",
      owner: "Release captain",
      completed: false,
      savedValue: null,
      savedAt: null,
    },
    {
      id: "announce-status",
      title: "Publish the status update",
      owner: "Incident communications",
      completed: false,
      savedValue: null,
      savedAt: null,
    },
    {
      id: "confirm-launch",
      title: "Confirm the launch handoff",
      owner: "Primary on-call",
      completed: false,
      savedValue: null,
      savedAt: null,
    },
  ],
} as const satisfies LaunchChecklistRecord;

export const launchChecklistFetchDelayMs = 220;
export const launchChecklistSaveDelayMs = 320;

let nextRevision = 1;
let launchStore: LaunchChecklistRecord = {
  ...initialLaunchRecord,
  steps: [...initialLaunchRecord.steps],
};

class SaveLaunchStepError extends Error {
  readonly code: SaveLaunchStepErrorShape["code"];

  constructor(details: SaveLaunchStepErrorShape) {
    super(details.message);
    this.name = "SaveLaunchStepError";
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

function createSaveError(details: SaveLaunchStepErrorShape) {
  return new SaveLaunchStepError(details);
}

export function isLaunchChecklistAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function isSaveLaunchStepError(
  error: unknown,
): error is SaveLaunchStepError {
  return error instanceof SaveLaunchStepError;
}

export function resetLaunchChecklistMockState() {
  nextRevision = 1;
  launchStore = {
    ...initialLaunchRecord,
    steps: [...initialLaunchRecord.steps],
  };
}

function buildWorkspaceResponse(
  revision: number,
): LaunchChecklistWorkspaceResponse {
  return {
    revision,
    loadedAt: formatTimestamp(new Date()),
    launch: {
      ...launchStore,
      steps: [...launchStore.steps],
    },
  };
}

export function fetchLaunchChecklistWorkspace(
  signal?: AbortSignal,
): Promise<LaunchChecklistWorkspaceResponse> {
  const revision = nextRevision++;

  return new Promise<LaunchChecklistWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve(buildWorkspaceResponse(revision));
    }, launchChecklistFetchDelayMs);

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

export function saveLaunchChecklistStep(
  input: SaveLaunchStepInput,
  signal?: AbortSignal,
): Promise<SaveLaunchStepSuccess> {
  const revision = nextRevision++;

  return new Promise<SaveLaunchStepSuccess>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      const normalizedValue = input.value.trim();
      if (normalizedValue.length < 18) {
        reject(
          createSaveError({
            code: "value-too-short",
            message: "Each launch step needs a note of at least 18 characters.",
          }),
        );
        return;
      }

      const freezeStep = launchStore.steps.find(
        (step) => step.id === "freeze-window",
      );
      const announceStep = launchStore.steps.find(
        (step) => step.id === "announce-status",
      );
      if (!freezeStep || !announceStep) {
        reject(
          createSaveError({
            code: "dependency-missing",
            message: "The launch checklist is missing a required step.",
          }),
        );
        return;
      }

      if (input.stepId === "announce-status" && !freezeStep.completed) {
        reject(
          createSaveError({
            code: "dependency-missing",
            message:
              "Freeze the launch window before publishing the status update.",
          }),
        );
        return;
      }

      if (
        input.stepId === "confirm-launch" &&
        (!freezeStep.completed || !announceStep.completed)
      ) {
        reject(
          createSaveError({
            code: "dependency-missing",
            message:
              "Complete the freeze and status steps before confirming the launch handoff.",
          }),
        );
        return;
      }

      if (
        input.stepId === "announce-status" &&
        !normalizedValue.toLowerCase().includes("status")
      ) {
        reject(
          createSaveError({
            code: "missing-keyword",
            message:
              "The status step must mention the status update explicitly.",
          }),
        );
        return;
      }

      if (
        input.stepId === "confirm-launch" &&
        !normalizedValue.toLowerCase().includes("handoff")
      ) {
        reject(
          createSaveError({
            code: "missing-keyword",
            message: "The confirmation step must mention the handoff.",
          }),
        );
        return;
      }

      const savedAt = formatTimestamp(new Date());
      launchStore = {
        ...launchStore,
        steps: launchStore.steps.map((step) =>
          step.id === input.stepId
            ? {
                ...step,
                completed: true,
                savedValue: normalizedValue,
                savedAt,
              }
            : step,
        ),
      };

      resolve({
        revision,
        savedAt,
        launch: {
          ...launchStore,
          steps: [...launchStore.steps],
        },
      });
    }, launchChecklistSaveDelayMs);

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
