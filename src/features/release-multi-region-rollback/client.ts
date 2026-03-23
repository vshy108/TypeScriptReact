import type {
  AcknowledgeReleaseRollbackDependencyInput,
  ReleaseRollbackDependency,
  ReleaseRollbackRegion,
  ReleaseRollbackRun,
  ReleaseRollbackWorkspaceResponse,
  ResumeReleaseRollbackRecoveryInput,
  StartReleaseRollbackInput,
} from "./types";

const initialRun = {
  id: "rollback-run-1",
  title: "Release multi-region rollback targeting and partial recovery",
  summary:
    "Target only the unstable regions, track which dependencies must acknowledge recovery work, and then finish the rollback once those follow-up steps are cleared.",
  stage: "draft",
  targetedRegionIds: ["rollback-region-2", "rollback-region-3"],
  activeRegionId: null,
  recoverySummary: null,
  updatedAt: "2026-03-23 23:45 UTC",
  updatedBy: "Taylor - Rollback lead",
} as const satisfies ReleaseRollbackRun;

const initialRegions = [
  {
    id: "rollback-region-1",
    name: "US East",
    trafficPercent: 35,
    status: "stable",
    note: "Healthy baseline region. Kept on the current release while rollback targets the unstable regions.",
  },
  {
    id: "rollback-region-2",
    name: "EU West",
    trafficPercent: 30,
    status: "targeted",
    note: "Checkout errors climbed after the deploy and this region is targeted for rollback.",
  },
  {
    id: "rollback-region-3",
    name: "AP Southeast",
    trafficPercent: 20,
    status: "targeted",
    note: "Rollback is queued after EU West completes because this region shares the same dependency cluster.",
  },
  {
    id: "rollback-region-4",
    name: "US West",
    trafficPercent: 15,
    status: "stable",
    note: "Healthy baseline region. Not targeted for rollback.",
  },
] as const satisfies readonly ReleaseRollbackRegion[];

const initialDependencies = [
  {
    id: "rollback-dependency-1",
    owner: "Payments cache",
    action: "Clear stale checkout pricing cache before the final region recovers.",
    status: "pending",
  },
  {
    id: "rollback-dependency-2",
    owner: "Support updates",
    action: "Acknowledge the customer-facing incident update before the final rollback closes.",
    status: "pending",
  },
] as const satisfies readonly ReleaseRollbackDependency[];

export const releaseRollbackFetchDelayMs = 180;
export const releaseRollbackMutationDelayMs = 220;
export const releaseRollbackTickMs = 1000;

let run: ReleaseRollbackRun = { ...initialRun };
let regions: ReleaseRollbackRegion[] = initialRegions.map((region) => ({
  ...region,
}));
let dependencies: ReleaseRollbackDependency[] = initialDependencies.map(
  (dependency) => ({ ...dependency }),
);

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

function cloneWorkspace(): ReleaseRollbackWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    run: { ...run },
    regions: regions.map((region) => ({ ...region })),
    dependencies: dependencies.map((dependency) => ({ ...dependency })),
  };
}

function dependenciesReady() {
  return dependencies.every((dependency) => dependency.status === "acknowledged");
}

function nextTargetedRegion() {
  return (
    regions.find((region) => region.status === "targeted") ?? null
  );
}

export function resetReleaseMultiRegionRollbackMockState() {
  run = { ...initialRun };
  regions = initialRegions.map((region) => ({ ...region }));
  dependencies = initialDependencies.map((dependency) => ({ ...dependency }));
}

export function isReleaseRollbackAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function advanceReleaseRollbackClock() {
  if (run.stage !== "rolling-back") {
    return;
  }

  const activeRegion = regions.find((region) => region.id === run.activeRegionId) ?? null;

  if (!activeRegion || activeRegion.status !== "rolling-back") {
    return;
  }

  const remainingTargets = regions.filter((region) => region.status === "targeted");

  if (activeRegion.id === "rollback-region-2") {
    regions = regions.map((region) =>
      region.id === activeRegion.id
        ? {
            ...region,
            status: "rolled-back",
            note: "Rollback completed in EU West. Waiting on shared dependencies before the final region recovers.",
          }
        : region,
    );
    run = {
      ...run,
      stage: "partial-recovery",
      activeRegionId: null,
      recoverySummary:
        "EU West is safely rolled back, but AP Southeast stays targeted until cache and support acknowledgements are complete.",
      updatedAt: formatTimestamp(new Date()),
      updatedBy: "Taylor - Rollback lead",
    };
    return;
  }

  regions = regions.map((region) =>
    region.id === activeRegion.id
      ? {
          ...region,
          status: "rolled-back",
          note: `Rollback completed in ${region.name}. Traffic is back on the previous release.`,
        }
      : region,
  );

  if (remainingTargets.length > 0) {
    const nextRegion = nextTargetedRegion();

    if (nextRegion) {
      regions = regions.map((region) =>
        region.id === nextRegion.id
          ? {
              ...region,
              status: "rolling-back",
              note: `Rollback is now running in ${region.name}.`,
            }
          : region,
      );
      run = {
        ...run,
        activeRegionId: nextRegion.id,
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Taylor - Rollback lead",
      };
      return;
    }
  }

  run = {
    ...run,
    stage: "completed",
    activeRegionId: null,
    recoverySummary: "Rollback finished across the targeted regions and follow-up dependencies were acknowledged.",
    updatedAt: formatTimestamp(new Date()),
    updatedBy: "Taylor - Rollback lead",
  };
}

export function fetchReleaseRollbackWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseRollbackWorkspaceResponse> {
  return new Promise<ReleaseRollbackWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve(cloneWorkspace());
    }, releaseRollbackFetchDelayMs);

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

export function startReleaseRollback(
  input: StartReleaseRollbackInput,
  signal?: AbortSignal,
): Promise<ReleaseRollbackWorkspaceResponse> {
  return new Promise<ReleaseRollbackWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (run.id !== input.runId || run.stage !== "draft") {
        reject(new Error("Rollback is no longer ready to start."));
        return;
      }

      regions = regions.map((region) =>
        region.id === "rollback-region-2"
          ? {
              ...region,
              status: "rolling-back",
              note: `Rollback is now running in ${region.name}.`,
            }
          : region,
      );

      run = {
        ...run,
        stage: "rolling-back",
        activeRegionId: "rollback-region-2",
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Taylor - Rollback lead",
      };
      resolve(cloneWorkspace());
    }, releaseRollbackMutationDelayMs);

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

export function acknowledgeReleaseRollbackDependency(
  input: AcknowledgeReleaseRollbackDependencyInput,
  signal?: AbortSignal,
): Promise<ReleaseRollbackWorkspaceResponse> {
  return new Promise<ReleaseRollbackWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      dependencies = dependencies.map((dependency) =>
        dependency.id === input.dependencyId
          ? { ...dependency, status: "acknowledged" }
          : dependency,
      );
      resolve(cloneWorkspace());
    }, releaseRollbackMutationDelayMs);

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

export function resumeReleaseRollbackRecovery(
  input: ResumeReleaseRollbackRecoveryInput,
  signal?: AbortSignal,
): Promise<ReleaseRollbackWorkspaceResponse> {
  return new Promise<ReleaseRollbackWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (run.id !== input.runId || run.stage !== "partial-recovery") {
        reject(new Error("Recovery is not ready to resume."));
        return;
      }

      if (!dependenciesReady()) {
        reject(new Error("All dependency acknowledgements must be complete before recovery resumes."));
        return;
      }

      regions = regions.map((region) =>
        region.id === "rollback-region-3"
          ? {
              ...region,
              status: "rolling-back",
              note: `Dependencies cleared. Rollback is now running in ${region.name}.`,
            }
          : region,
      );

      run = {
        ...run,
        stage: "rolling-back",
        activeRegionId: "rollback-region-3",
        recoverySummary: null,
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Taylor - Rollback lead",
      };
      resolve(cloneWorkspace());
    }, releaseRollbackMutationDelayMs);

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