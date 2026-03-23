import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveReleaseRelaunchRegister,
  fetchReleaseRelaunchExceptionWorkspace,
  invalidateReleaseRelaunchThresholds,
  isReleaseRelaunchExceptionAbortError,
  publishReleaseRelaunchException,
  signOffReleaseRelaunchException,
  startReleaseRelaunchException,
} from "./client";
import type {
  ReleaseRelaunchExceptionAuditEvent,
  ReleaseRelaunchExceptionRun,
  ReleaseRelaunchRegister,
  ReleaseRelaunchThreshold,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleaseRelaunchExceptionRegisters() {
  const [run, setRun] = useState<ReleaseRelaunchExceptionRun | null>(null);
  const [registers, setRegisters] = useState<
    readonly ReleaseRelaunchRegister[]
  >([]);
  const [thresholds, setThresholds] = useState<
    readonly ReleaseRelaunchThreshold[]
  >([]);
  const [auditEvents, setAuditEvents] = useState<
    readonly ReleaseRelaunchExceptionAuditEvent[]
  >([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseRelaunchExceptionWorkspace(controller.signal)
      .then((workspace) => {
        setRun(workspace.run);
        setRegisters(workspace.registers);
        setThresholds(workspace.thresholds);
        setAuditEvents(workspace.auditEvents);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseRelaunchExceptionAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the relaunch exception workspace.");
      });

    return () => {
      controller.abort();
    };
  }, []);

  const activeRegister = useMemo(
    () =>
      registers.find((register) => register.id === run?.activeRegisterId) ??
      null,
    [registers, run?.activeRegisterId],
  );

  const staleThresholds = useMemo(
    () => thresholds.filter((threshold) => threshold.status === "stale"),
    [thresholds],
  );

  const start = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void startReleaseRelaunchException({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setRegisters(workspace.registers);
        setThresholds(workspace.thresholds);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Started relaunch exception review.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Relaunch exception review is no longer ready to start.");
      });
  }, [run]);

  const approveRegister = useCallback(
    (registerId: ReleaseRelaunchRegister["id"], label: string) => {
      setMutationStatus("working");
      setMessage(null);

      void approveReleaseRelaunchRegister({ registerId })
        .then((workspace) => {
          setRun(workspace.run);
          setRegisters(workspace.registers);
          setThresholds(workspace.thresholds);
          setAuditEvents(workspace.auditEvents);
          setMutationStatus("saved");
          setMessage(`Approved ${label} for the relaunch exception register.`);
        })
        .catch(() => {
          setMutationStatus("error");
          setMessage("Relaunch register approval is not available.");
        });
    },
    [],
  );

  const invalidateThresholds = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void invalidateReleaseRelaunchThresholds({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setRegisters(workspace.registers);
        setThresholds(workspace.thresholds);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Invalidated the stale relaunch thresholds.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Stale-threshold invalidation is not available.");
      });
  }, [run]);

  const signOff = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void signOffReleaseRelaunchException({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setRegisters(workspace.registers);
        setThresholds(workspace.thresholds);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage(
          "Recorded approver sign-off for the revised relaunch exception register.",
        );
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Approver sign-off is not available.");
      });
  }, [run]);

  const publish = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void publishReleaseRelaunchException({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setRegisters(workspace.registers);
        setThresholds(workspace.thresholds);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Published the relaunch exception register.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Relaunch exception publish is not available.");
      });
  }, [run]);

  return {
    activeRegister,
    approveRegister,
    auditEvents,
    invalidateThresholds,
    message,
    mutationStatus,
    publish,
    registers,
    run,
    signOff,
    staleThresholds,
    start,
    status,
    thresholds,
  };
}
