import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveReleaseRollbackWaiverLedger,
  fetchReleaseRollbackWaiverWorkspace,
  invalidateReleaseRollbackExceptions,
  isReleaseRollbackWaiverAbortError,
  publishReleaseRollbackWaiver,
  signOffReleaseRollbackWaiver,
  startReleaseRollbackWaiver,
} from "./client";
import type {
  ReleaseRollbackException,
  ReleaseRollbackWaiverAuditEvent,
  ReleaseRollbackWaiverLedger,
  ReleaseRollbackWaiverRun,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleaseRollbackWaiverLedgers() {
  const [run, setRun] = useState<ReleaseRollbackWaiverRun | null>(null);
  const [ledgers, setLedgers] = useState<
    readonly ReleaseRollbackWaiverLedger[]
  >([]);
  const [exceptions, setExceptions] = useState<
    readonly ReleaseRollbackException[]
  >([]);
  const [auditEvents, setAuditEvents] = useState<
    readonly ReleaseRollbackWaiverAuditEvent[]
  >([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseRollbackWaiverWorkspace(controller.signal)
      .then((workspace) => {
        setRun(workspace.run);
        setLedgers(workspace.ledgers);
        setExceptions(workspace.exceptions);
        setAuditEvents(workspace.auditEvents);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseRollbackWaiverAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the rollback waiver workspace.");
      });

    return () => {
      controller.abort();
    };
  }, []);

  const activeLedger = useMemo(
    () => ledgers.find((item) => item.id === run?.activeLedgerId) ?? null,
    [ledgers, run?.activeLedgerId],
  );

  const staleExceptions = useMemo(
    () => exceptions.filter((item) => item.status === "stale"),
    [exceptions],
  );

  const start = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void startReleaseRollbackWaiver({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setLedgers(workspace.ledgers);
        setExceptions(workspace.exceptions);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Started rollback waiver review.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Rollback waiver review is no longer ready to start.");
      });
  }, [run]);

  const approveLedger = useCallback(
    (ledgerId: ReleaseRollbackWaiverLedger["id"], label: string) => {
      setMutationStatus("working");
      setMessage(null);

      void approveReleaseRollbackWaiverLedger({ ledgerId })
        .then((workspace) => {
          setRun(workspace.run);
          setLedgers(workspace.ledgers);
          setExceptions(workspace.exceptions);
          setAuditEvents(workspace.auditEvents);
          setMutationStatus("saved");
          setMessage(`Approved ${label} for the rollback waiver ledger.`);
        })
        .catch(() => {
          setMutationStatus("error");
          setMessage("Waiver ledger approval is not available.");
        });
    },
    [],
  );

  const invalidateExceptions = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void invalidateReleaseRollbackExceptions({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setLedgers(workspace.ledgers);
        setExceptions(workspace.exceptions);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Invalidated the expired rollback exceptions.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Expired-exception invalidation is not available.");
      });
  }, [run]);

  const signOff = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void signOffReleaseRollbackWaiver({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setLedgers(workspace.ledgers);
        setExceptions(workspace.exceptions);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage(
          "Recorded approver sign-off for the revised rollback waiver ledger.",
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

    void publishReleaseRollbackWaiver({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setLedgers(workspace.ledgers);
        setExceptions(workspace.exceptions);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Published the rollback waiver ledger.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Rollback waiver publish is not available.");
      });
  }, [run]);

  return {
    activeLedger,
    approveLedger,
    auditEvents,
    exceptions,
    invalidateExceptions,
    ledgers,
    message,
    mutationStatus,
    publish,
    run,
    signOff,
    staleExceptions,
    start,
    status,
  };
}
