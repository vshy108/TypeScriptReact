import { useCallback, useEffect, useMemo, useState } from "react";
import {
  acknowledgeReleasePause,
  advanceReleasePauseClock,
  fetchReleasePauseWorkspace,
  isReleasePauseAbortError,
  pauseReleaseRun,
  releasePauseTickMs,
  resumeReleasePauseRun,
  startReleasePauseRun,
} from "./client";
import type {
  ReleasePauseAcknowledgement,
  ReleasePauseCheckpoint,
  ReleasePauseRun,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleaseRolloutPauseResume() {
  const [run, setRun] = useState<ReleasePauseRun | null>(null);
  const [checkpoints, setCheckpoints] = useState<
    readonly ReleasePauseCheckpoint[]
  >([]);
  const [acknowledgements, setAcknowledgements] = useState<
    readonly ReleasePauseAcknowledgement[]
  >([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      advanceReleasePauseClock();
      setTick((currentTick) => currentTick + 1);
    }, releasePauseTickMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleasePauseWorkspace(controller.signal)
      .then((workspace) => {
        setRun(workspace.run);
        setCheckpoints(workspace.checkpoints);
        setAcknowledgements(workspace.acknowledgements);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleasePauseAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the rollout pause-and-resume workspace.");
      });

    return () => {
      controller.abort();
    };
  }, [tick]);

  const activeCheckpoint = useMemo(
    () =>
      checkpoints.find(
        (checkpoint) => checkpoint.id === run?.activeCheckpointId,
      ) ?? null,
    [checkpoints, run?.activeCheckpointId],
  );

  const acknowledgementsReady = useMemo(
    () =>
      acknowledgements.every(
        (acknowledgement) => acknowledgement.status === "acknowledged",
      ),
    [acknowledgements],
  );

  const start = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void startReleasePauseRun({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setCheckpoints(workspace.checkpoints);
        setAcknowledgements(workspace.acknowledgements);
        setMutationStatus("saved");
        setMessage("Started the pause-and-resume rollout at Canary 10%.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Rollout is no longer ready to start.");
      });
  }, [run]);

  const pause = useCallback(() => {
    if (!activeCheckpoint) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void pauseReleaseRun({ checkpointId: activeCheckpoint.id })
      .then((workspace) => {
        setRun(workspace.run);
        setCheckpoints(workspace.checkpoints);
        setAcknowledgements(workspace.acknowledgements);
        setMutationStatus("saved");
        setMessage(`Paused the rollout at ${activeCheckpoint.name}.`);
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Pause is not available.");
      });
  }, [activeCheckpoint]);

  const acknowledge = useCallback(
    (acknowledgementId: ReleasePauseAcknowledgement["id"], role: string) => {
      setMutationStatus("working");
      setMessage(null);

      void acknowledgeReleasePause({ acknowledgementId })
        .then((workspace) => {
          setRun(workspace.run);
          setCheckpoints(workspace.checkpoints);
          setAcknowledgements(workspace.acknowledgements);
          setMutationStatus("saved");
          setMessage(`Captured acknowledgement from ${role}.`);
        })
        .catch(() => {
          setMutationStatus("error");
          setMessage("Could not capture the acknowledgement.");
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

    void resumeReleasePauseRun({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setCheckpoints(workspace.checkpoints);
        setAcknowledgements(workspace.acknowledgements);
        setMutationStatus("saved");
        setMessage(
          "Resumed rollout with manual override after all acknowledgements were complete.",
        );
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("All acknowledgements must be complete before resuming.");
      });
  }, [run]);

  return {
    acknowledgements,
    acknowledgementsReady,
    acknowledge,
    activeCheckpoint,
    checkpoints,
    message,
    mutationStatus,
    pause,
    resume,
    run,
    start,
    status,
  };
}
