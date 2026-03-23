import { useCallback, useEffect, useMemo, useState } from "react";
import {
  advanceReleaseLaunchClock,
  armReleaseLaunchAbort,
  fetchReleaseLaunchWorkspace,
  isReleaseLaunchAbortError,
  releaseLaunchTickMs,
  startReleaseLaunch,
} from "./client";
import type {
  ReleaseLaunchCheckpoint,
  ReleaseLaunchGuardrail,
  ReleaseLaunchRun,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleaseLaunchOrchestration() {
  const [run, setRun] = useState<ReleaseLaunchRun | null>(null);
  const [checkpoints, setCheckpoints] = useState<
    readonly ReleaseLaunchCheckpoint[]
  >([]);
  const [guardrails, setGuardrails] = useState<
    readonly ReleaseLaunchGuardrail[]
  >([]);
  const [abortArmed, setAbortArmed] = useState(false);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      advanceReleaseLaunchClock();
      setTick((currentTick) => currentTick + 1);
    }, releaseLaunchTickMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseLaunchWorkspace(controller.signal)
      .then((workspace) => {
        setRun(workspace.run);
        setCheckpoints(workspace.checkpoints);
        setGuardrails(workspace.guardrails);
        setAbortArmed(workspace.abortArmed);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseLaunchAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage(
          "Could not load the release launch orchestration workspace.",
        );
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

  const startLaunch = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void startReleaseLaunch({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setCheckpoints(workspace.checkpoints);
        setGuardrails(workspace.guardrails);
        setAbortArmed(workspace.abortArmed);
        setMutationStatus("saved");
        setMessage(
          `Started the rollout at ${workspace.checkpoints[0]?.name ?? "the first checkpoint"}.`,
        );
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Launch is no longer ready to start.");
      });
  }, [run]);

  const armAbort = useCallback(() => {
    setMutationStatus("working");
    setMessage(null);

    void armReleaseLaunchAbort({ guardrailId: "guardrail-1" })
      .then((workspace) => {
        setRun(workspace.run);
        setCheckpoints(workspace.checkpoints);
        setGuardrails(workspace.guardrails);
        setAbortArmed(workspace.abortArmed);
        setMutationStatus("saved");
        setMessage(
          "Armed the checkout error-rate guardrail to abort on the next checkpoint tick.",
        );
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Abort condition is not available right now.");
      });
  }, []);

  return {
    abortArmed,
    activeCheckpoint,
    armAbort,
    checkpoints,
    guardrails,
    message,
    mutationStatus,
    run,
    startLaunch,
    status,
  };
}
