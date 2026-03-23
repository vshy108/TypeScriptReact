import type {
  AcknowledgeReleasePauseInput,
  PauseReleaseRunInput,
  ReleasePauseAcknowledgement,
  ReleasePauseCheckpoint,
  ReleasePauseRun,
  ReleasePauseWorkspaceResponse,
  ResumeReleasePauseRunInput,
  StartReleasePauseRunInput,
} from "./types";

const initialRun = {
  id: "pause-run-1",
  title: "Release rollout pause and resume with operator acknowledgements",
  stage: "draft",
  activeCheckpointId: null,
  pauseReason: null,
  manualOverrideUsed: false,
  updatedAt: "2026-03-23 23:10 UTC",
  updatedBy: "Jordan - Release manager",
} as const satisfies ReleasePauseRun;

const initialCheckpoints = [
  {
    id: "pause-checkpoint-1",
    name: "Canary 10%",
    trafficPercent: 10,
    status: "pending",
    note: "Ready to start once the release manager opens the rollout.",
  },
  {
    id: "pause-checkpoint-2",
    name: "Regional 50%",
    trafficPercent: 50,
    status: "pending",
    note: "Held until canary health is confirmed.",
  },
  {
    id: "pause-checkpoint-3",
    name: "Global 100%",
    trafficPercent: 100,
    status: "pending",
    note: "Held until regional traffic stays stable.",
  },
] as const satisfies readonly ReleasePauseCheckpoint[];

const initialAcknowledgements = [
  {
    id: "pause-ack-1",
    owner: "Mina",
    role: "SRE on-call",
    status: "pending",
  },
  {
    id: "pause-ack-2",
    owner: "Devin",
    role: "Support lead",
    status: "pending",
  },
] as const satisfies readonly ReleasePauseAcknowledgement[];

export const releasePauseFetchDelayMs = 180;
export const releasePauseMutationDelayMs = 220;
export const releasePauseTickMs = 1000;

let run: ReleasePauseRun = { ...initialRun };
let checkpoints: ReleasePauseCheckpoint[] = initialCheckpoints.map(
  (checkpoint) => ({
    ...checkpoint,
  }),
);
let acknowledgements: ReleasePauseAcknowledgement[] =
  initialAcknowledgements.map((acknowledgement) => ({
    ...acknowledgement,
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

function cloneWorkspace(): ReleasePauseWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    run: { ...run },
    checkpoints: checkpoints.map((checkpoint) => ({ ...checkpoint })),
    acknowledgements: acknowledgements.map((acknowledgement) => ({
      ...acknowledgement,
    })),
  };
}

function acknowledgementsReady() {
  return acknowledgements.every(
    (acknowledgement) => acknowledgement.status === "acknowledged",
  );
}

function findActiveCheckpoint() {
  return (
    checkpoints.find(
      (checkpoint) => checkpoint.id === run.activeCheckpointId,
    ) ?? null
  );
}

export function resetReleaseRolloutPauseResumeMockState() {
  run = { ...initialRun };
  checkpoints = initialCheckpoints.map((checkpoint) => ({ ...checkpoint }));
  acknowledgements = initialAcknowledgements.map((acknowledgement) => ({
    ...acknowledgement,
  }));
}

export function isReleasePauseAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function advanceReleasePauseClock() {
  if (run.stage !== "launching") {
    return;
  }

  const activeCheckpoint = findActiveCheckpoint();

  if (!activeCheckpoint || activeCheckpoint.status !== "monitoring") {
    return;
  }

  const currentIndex = checkpoints.findIndex(
    (checkpoint) => checkpoint.id === activeCheckpoint.id,
  );
  const nextCheckpoint = checkpoints[currentIndex + 1] ?? null;

  checkpoints = checkpoints.map((checkpoint, index) => {
    if (checkpoint.id === activeCheckpoint.id) {
      return {
        ...checkpoint,
        status: "completed",
        note: `Completed ${checkpoint.trafficPercent}% traffic checkpoint with no blocking issues.`,
      };
    }

    if (nextCheckpoint && index === currentIndex + 1) {
      return {
        ...checkpoint,
        status: "monitoring",
        note: `Monitoring ${checkpoint.trafficPercent}% traffic after the previous checkpoint cleared.`,
      };
    }

    return checkpoint;
  });

  if (nextCheckpoint) {
    run = {
      ...run,
      activeCheckpointId: nextCheckpoint.id,
      updatedAt: formatTimestamp(new Date()),
      updatedBy: "Jordan - Release manager",
    };
    return;
  }

  run = {
    ...run,
    stage: "completed",
    activeCheckpointId: null,
    pauseReason: null,
    updatedAt: formatTimestamp(new Date()),
    updatedBy: "Jordan - Release manager",
  };
}

export function fetchReleasePauseWorkspace(
  signal?: AbortSignal,
): Promise<ReleasePauseWorkspaceResponse> {
  return new Promise<ReleasePauseWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve(cloneWorkspace());
    }, releasePauseFetchDelayMs);

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

export function startReleasePauseRun(
  input: StartReleasePauseRunInput,
  signal?: AbortSignal,
): Promise<ReleasePauseWorkspaceResponse> {
  return new Promise<ReleasePauseWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (run.id !== input.runId || run.stage !== "draft") {
        reject(new Error("Rollout is no longer ready to start."));
        return;
      }

      checkpoints = checkpoints.map((checkpoint, index) =>
        index === 0
          ? {
              ...checkpoint,
              status: "monitoring",
              note: `Monitoring ${checkpoint.trafficPercent}% traffic before the next promotion.`,
            }
          : checkpoint,
      );

      run = {
        ...run,
        stage: "launching",
        activeCheckpointId: checkpoints[0]?.id ?? null,
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Jordan - Release manager",
      };
      resolve(cloneWorkspace());
    }, releasePauseMutationDelayMs);

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

export function pauseReleaseRun(
  input: PauseReleaseRunInput,
  signal?: AbortSignal,
): Promise<ReleasePauseWorkspaceResponse> {
  return new Promise<ReleasePauseWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (
        run.stage !== "launching" ||
        run.activeCheckpointId !== input.checkpointId
      ) {
        reject(new Error("Pause is not available."));
        return;
      }

      checkpoints = checkpoints.map((checkpoint) =>
        checkpoint.id === input.checkpointId
          ? {
              ...checkpoint,
              status: "paused",
              note: `Paused at ${checkpoint.trafficPercent}% traffic while operator checks service saturation.`,
            }
          : checkpoint,
      );
      acknowledgements = initialAcknowledgements.map((acknowledgement) => ({
        ...acknowledgement,
      }));
      run = {
        ...run,
        stage: "paused",
        pauseReason:
          "Payment-service saturation needs operator acknowledgement before the rollout can resume.",
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Jordan - Release manager",
      };
      resolve(cloneWorkspace());
    }, releasePauseMutationDelayMs);

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

export function acknowledgeReleasePause(
  input: AcknowledgeReleasePauseInput,
  signal?: AbortSignal,
): Promise<ReleasePauseWorkspaceResponse> {
  return new Promise<ReleasePauseWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      acknowledgements = acknowledgements.map((acknowledgement) =>
        acknowledgement.id === input.acknowledgementId
          ? { ...acknowledgement, status: "acknowledged" }
          : acknowledgement,
      );
      resolve(cloneWorkspace());
    }, releasePauseMutationDelayMs);

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

export function resumeReleasePauseRun(
  input: ResumeReleasePauseRunInput,
  signal?: AbortSignal,
): Promise<ReleasePauseWorkspaceResponse> {
  return new Promise<ReleasePauseWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (run.id !== input.runId || run.stage !== "paused") {
        reject(new Error("Resume is not available."));
        return;
      }

      if (!acknowledgementsReady()) {
        reject(
          new Error("All acknowledgements must be complete before resuming."),
        );
        return;
      }

      checkpoints = checkpoints.map((checkpoint) =>
        checkpoint.id === run.activeCheckpointId
          ? {
              ...checkpoint,
              status: "monitoring",
              note: `Resumed at ${checkpoint.trafficPercent}% traffic after operator acknowledgement and manual override.`,
            }
          : checkpoint,
      );
      run = {
        ...run,
        stage: "launching",
        pauseReason: null,
        manualOverrideUsed: true,
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Jordan - Release manager",
      };
      resolve(cloneWorkspace());
    }, releasePauseMutationDelayMs);

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
