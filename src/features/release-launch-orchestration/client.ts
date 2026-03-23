import type {
  ArmReleaseLaunchAbortInput,
  ReleaseLaunchCheckpoint,
  ReleaseLaunchGuardrail,
  ReleaseLaunchRun,
  ReleaseLaunchWorkspaceResponse,
  StartReleaseLaunchInput,
} from "./types";

const initialRun = {
  id: "launch-1",
  title: "Release launch orchestration with progressive checkpoints",
  summary:
    "Roll out the checkout fix through canary, regional, and global traffic while guardrails watch for an automatic abort.",
  stage: "draft",
  activeCheckpointId: null,
  abortReason: null,
  updatedAt: "2026-03-23 22:05 UTC",
  updatedBy: "Taylor - Release lead",
} as const satisfies ReleaseLaunchRun;

const initialCheckpoints = [
  {
    id: "checkpoint-1",
    name: "Canary 5%",
    trafficPercent: 5,
    status: "pending",
    note: "Waiting for the release lead to start the progressive rollout.",
  },
  {
    id: "checkpoint-2",
    name: "Regional 25%",
    trafficPercent: 25,
    status: "pending",
    note: "Held until canary telemetry clears the first checkpoint.",
  },
  {
    id: "checkpoint-3",
    name: "Global 100%",
    trafficPercent: 100,
    status: "pending",
    note: "Final promotion after the regional rollout stays healthy.",
  },
] as const satisfies readonly ReleaseLaunchCheckpoint[];

const initialGuardrails = [
  {
    id: "guardrail-1",
    name: "Checkout error rate",
    threshold: "Abort above 2.0%",
    currentValue: "0.4%",
    status: "healthy",
    effect: "Ready to trigger an automatic abort if checkout failures spike.",
  },
  {
    id: "guardrail-2",
    name: "P95 checkout latency",
    threshold: "Abort above 650ms",
    currentValue: "260ms",
    status: "healthy",
    effect: "Watching latency regressions while the rollout expands.",
  },
] as const satisfies readonly ReleaseLaunchGuardrail[];

export const releaseLaunchFetchDelayMs = 180;
export const releaseLaunchMutationDelayMs = 220;
export const releaseLaunchTickMs = 1000;

let run: ReleaseLaunchRun = { ...initialRun };
let checkpoints: ReleaseLaunchCheckpoint[] = initialCheckpoints.map(
  (checkpoint) => ({
    ...checkpoint,
  }),
);
let guardrails: ReleaseLaunchGuardrail[] = initialGuardrails.map(
  (guardrail) => ({
    ...guardrail,
  }),
);
let abortArmed = false;

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

function cloneWorkspace(): ReleaseLaunchWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    run: { ...run },
    checkpoints: checkpoints.map((checkpoint) => ({ ...checkpoint })),
    guardrails: guardrails.map((guardrail) => ({ ...guardrail })),
    abortArmed,
  };
}

function findActiveCheckpoint() {
  return (
    checkpoints.find(
      (checkpoint) => checkpoint.id === run.activeCheckpointId,
    ) ?? null
  );
}

export function resetReleaseLaunchOrchestrationMockState() {
  run = { ...initialRun };
  checkpoints = initialCheckpoints.map((checkpoint) => ({ ...checkpoint }));
  guardrails = initialGuardrails.map((guardrail) => ({ ...guardrail }));
  abortArmed = false;
}

export function isReleaseLaunchAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function advanceReleaseLaunchClock() {
  if (run.stage !== "launching") {
    return;
  }

  const activeCheckpoint = findActiveCheckpoint();

  if (!activeCheckpoint || activeCheckpoint.status !== "monitoring") {
    return;
  }

  if (abortArmed) {
    checkpoints = checkpoints.map((checkpoint) =>
      checkpoint.id === activeCheckpoint.id
        ? {
            ...checkpoint,
            status: "aborted",
            note: `Aborted at ${checkpoint.trafficPercent}% traffic after the checkout error rate crossed the threshold.`,
          }
        : checkpoint,
    );

    guardrails = guardrails.map((guardrail) =>
      guardrail.id === "guardrail-1"
        ? {
            ...guardrail,
            currentValue: "4.8%",
            status: "breached",
            effect: `Automatic abort triggered during ${activeCheckpoint.name}.`,
          }
        : guardrail,
    );

    run = {
      ...run,
      stage: "aborted",
      activeCheckpointId: null,
      abortReason: `Checkout error rate crossed the 2.0% abort threshold during ${activeCheckpoint.name}.`,
      updatedAt: formatTimestamp(new Date()),
      updatedBy: "Sentinel - rollout guardrail",
    };
    abortArmed = false;
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
        note: `Checkpoint cleared at ${checkpoint.trafficPercent}% traffic without triggering guardrails.`,
      };
    }

    if (nextCheckpoint && index === currentIndex + 1) {
      return {
        ...checkpoint,
        status: "monitoring",
        note: `Monitoring ${checkpoint.trafficPercent}% traffic before the next promotion.`,
      };
    }

    return checkpoint;
  });

  if (nextCheckpoint) {
    run = {
      ...run,
      activeCheckpointId: nextCheckpoint.id,
      updatedAt: formatTimestamp(new Date()),
      updatedBy: "Taylor - Release lead",
    };
    return;
  }

  guardrails = guardrails.map((guardrail) => ({
    ...guardrail,
    status: "healthy",
    currentValue: guardrail.id === "guardrail-1" ? "0.7%" : "290ms",
    effect: "Rollout completed cleanly with no automatic abort signal.",
  }));

  run = {
    ...run,
    stage: "completed",
    activeCheckpointId: null,
    abortReason: null,
    updatedAt: formatTimestamp(new Date()),
    updatedBy: "Taylor - Release lead",
  };
}

export function fetchReleaseLaunchWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseLaunchWorkspaceResponse> {
  return new Promise<ReleaseLaunchWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve(cloneWorkspace());
    }, releaseLaunchFetchDelayMs);

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

export function startReleaseLaunch(
  input: StartReleaseLaunchInput,
  signal?: AbortSignal,
): Promise<ReleaseLaunchWorkspaceResponse> {
  return new Promise<ReleaseLaunchWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (run.id !== input.runId || run.stage !== "draft") {
        reject(new Error("Launch is no longer ready to start."));
        return;
      }

      const firstCheckpoint = checkpoints[0];

      checkpoints = checkpoints.map((checkpoint, index) =>
        index === 0
          ? {
              ...checkpoint,
              status: "monitoring",
              note: `Monitoring ${checkpoint.trafficPercent}% traffic before expanding the rollout.`,
            }
          : checkpoint,
      );

      guardrails = guardrails.map((guardrail) => ({
        ...guardrail,
        status: "watching",
        effect:
          "Watching live rollout telemetry for an automatic abort signal.",
      }));

      run = {
        ...run,
        stage: "launching",
        activeCheckpointId: firstCheckpoint?.id ?? null,
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Taylor - Release lead",
      };
      resolve(cloneWorkspace());
    }, releaseLaunchMutationDelayMs);

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

export function armReleaseLaunchAbort(
  input: ArmReleaseLaunchAbortInput,
  signal?: AbortSignal,
): Promise<ReleaseLaunchWorkspaceResponse> {
  return new Promise<ReleaseLaunchWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (run.stage !== "launching" || abortArmed) {
        reject(new Error("Abort condition is not available."));
        return;
      }

      abortArmed = true;
      guardrails = guardrails.map((guardrail) =>
        guardrail.id === input.guardrailId
          ? {
              ...guardrail,
              status: "watching",
              currentValue: "1.9%",
              effect: "Armed to breach on the next checkpoint tick.",
            }
          : guardrail,
      );
      resolve(cloneWorkspace());
    }, releaseLaunchMutationDelayMs);

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
