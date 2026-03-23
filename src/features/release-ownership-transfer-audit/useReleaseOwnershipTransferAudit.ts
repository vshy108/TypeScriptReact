import { useCallback, useEffect, useMemo, useState } from "react";
import {
  acknowledgeReleaseOwnershipStep,
  fetchReleaseOwnershipTransferWorkspace,
  isReleaseOwnershipTransferAbortError,
  startReleaseOwnershipTransfer,
} from "./client";
import type {
  ReleaseOwnershipAuditEvent,
  ReleaseOwnershipTransferRun,
  ReleaseOwnershipTransferStep,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleaseOwnershipTransferAudit() {
  const [run, setRun] = useState<ReleaseOwnershipTransferRun | null>(null);
  const [steps, setSteps] = useState<readonly ReleaseOwnershipTransferStep[]>(
    [],
  );
  const [auditEvents, setAuditEvents] = useState<
    readonly ReleaseOwnershipAuditEvent[]
  >([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseOwnershipTransferWorkspace(controller.signal)
      .then((workspace) => {
        setRun(workspace.run);
        setSteps(workspace.steps);
        setAuditEvents(workspace.auditEvents);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseOwnershipTransferAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the ownership transfer audit workspace.");
      });

    return () => {
      controller.abort();
    };
  }, []);

  const activeStep = useMemo(
    () => steps.find((step) => step.id === run?.activeStepId) ?? null,
    [run?.activeStepId, steps],
  );

  const startTransfer = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void startReleaseOwnershipTransfer({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setSteps(workspace.steps);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Started the ownership transfer audit workflow.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Ownership transfer is no longer ready to start.");
      });
  }, [run]);

  const acknowledgeStep = useCallback(
    (stepId: ReleaseOwnershipTransferStep["id"], label: string) => {
      setMutationStatus("working");
      setMessage(null);

      void acknowledgeReleaseOwnershipStep({ stepId })
        .then((workspace) => {
          setRun(workspace.run);
          setSteps(workspace.steps);
          setAuditEvents(workspace.auditEvents);
          setMutationStatus("saved");
          setMessage(`Acknowledged ${label.toLowerCase()} in the audit trail.`);
        })
        .catch(() => {
          setMutationStatus("error");
          setMessage("Acknowledgement is not available.");
        });
    },
    [],
  );

  return {
    acknowledgeStep,
    activeStep,
    auditEvents,
    message,
    mutationStatus,
    run,
    startTransfer,
    status,
    steps,
  };
}
