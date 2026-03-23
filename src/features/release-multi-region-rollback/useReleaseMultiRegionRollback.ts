import { useCallback, useEffect, useMemo, useState } from "react";
import {
  acknowledgeReleaseRollbackDependency,
  advanceReleaseRollbackClock,
  fetchReleaseRollbackWorkspace,
  isReleaseRollbackAbortError,
  releaseRollbackTickMs,
  resumeReleaseRollbackRecovery,
  startReleaseRollback,
} from "./client";
import type {
  ReleaseRollbackDependency,
  ReleaseRollbackRegion,
  ReleaseRollbackRun,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleaseMultiRegionRollback() {
  const [run, setRun] = useState<ReleaseRollbackRun | null>(null);
  const [regions, setRegions] = useState<readonly ReleaseRollbackRegion[]>([]);
  const [dependencies, setDependencies] = useState<
    readonly ReleaseRollbackDependency[]
  >([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      advanceReleaseRollbackClock();
      setTick((currentTick) => currentTick + 1);
    }, releaseRollbackTickMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseRollbackWorkspace(controller.signal)
      .then((workspace) => {
        setRun(workspace.run);
        setRegions(workspace.regions);
        setDependencies(workspace.dependencies);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseRollbackAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the multi-region rollback workspace.");
      });

    return () => {
      controller.abort();
    };
  }, [tick]);

  const activeRegion = useMemo(
    () => regions.find((region) => region.id === run?.activeRegionId) ?? null,
    [regions, run?.activeRegionId],
  );

  const dependenciesReady = useMemo(
    () =>
      dependencies.every((dependency) => dependency.status === "acknowledged"),
    [dependencies],
  );

  const start = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void startReleaseRollback({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setRegions(workspace.regions);
        setDependencies(workspace.dependencies);
        setMutationStatus("saved");
        setMessage("Started rollback targeting EU West first.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Rollback is no longer ready to start.");
      });
  }, [run]);

  const acknowledge = useCallback(
    (dependencyId: ReleaseRollbackDependency["id"], owner: string) => {
      setMutationStatus("working");
      setMessage(null);

      void acknowledgeReleaseRollbackDependency({ dependencyId })
        .then((workspace) => {
          setRun(workspace.run);
          setRegions(workspace.regions);
          setDependencies(workspace.dependencies);
          setMutationStatus("saved");
          setMessage(`Captured dependency acknowledgement from ${owner}.`);
        })
        .catch(() => {
          setMutationStatus("error");
          setMessage("Could not capture the dependency acknowledgement.");
        });
    },
    [],
  );

  const resume = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void resumeReleaseRollbackRecovery({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setRegions(workspace.regions);
        setDependencies(workspace.dependencies);
        setMutationStatus("saved");
        setMessage("Resumed rollback recovery for the final targeted region.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage(
          "All dependency acknowledgements must be complete before recovery resumes.",
        );
      });
  }, [run]);

  return {
    activeRegion,
    acknowledge,
    dependencies,
    dependenciesReady,
    message,
    mutationStatus,
    regions,
    resume,
    run,
    start,
    status,
  };
}
