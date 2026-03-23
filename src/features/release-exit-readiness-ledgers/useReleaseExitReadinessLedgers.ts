import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveReleaseExitReadinessLedger,
  fetchReleaseExitReadinessWorkspace,
  invalidateReleaseExitReadinessCriteria,
  isReleaseExitReadinessAbortError,
  publishReleaseExitReadiness,
  signOffReleaseExitReadiness,
  startReleaseExitReadiness,
} from "./client";
import type {
  ReleaseExitReadinessAuditEvent,
  ReleaseExitReadinessCriterion,
  ReleaseExitReadinessLedger,
  ReleaseExitReadinessRun,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleaseExitReadinessLedgers() {
  const [run, setRun] = useState<ReleaseExitReadinessRun | null>(null);
  const [ledgers, setLedgers] = useState<readonly ReleaseExitReadinessLedger[]>(
    [],
  );
  const [criteria, setCriteria] = useState<
    readonly ReleaseExitReadinessCriterion[]
  >([]);
  const [auditEvents, setAuditEvents] = useState<
    readonly ReleaseExitReadinessAuditEvent[]
  >([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseExitReadinessWorkspace(controller.signal)
      .then((workspace) => {
        setRun(workspace.run);
        setLedgers(workspace.ledgers);
        setCriteria(workspace.criteria);
        setAuditEvents(workspace.auditEvents);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseExitReadinessAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the exit readiness workspace.");
      });

    return () => {
      controller.abort();
    };
  }, []);

  const activeLedger = useMemo(
    () => ledgers.find((ledger) => ledger.id === run?.activeLedgerId) ?? null,
    [ledgers, run?.activeLedgerId],
  );

  const staleCriteria = useMemo(
    () => criteria.filter((item) => item.status === "stale"),
    [criteria],
  );

  const start = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void startReleaseExitReadiness({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setLedgers(workspace.ledgers);
        setCriteria(workspace.criteria);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Started exit readiness review.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Exit readiness review is no longer ready to start.");
      });
  }, [run]);

  const approveLedger = useCallback(
    (ledgerId: ReleaseExitReadinessLedger["id"], label: string) => {
      setMutationStatus("working");
      setMessage(null);

      void approveReleaseExitReadinessLedger({ ledgerId })
        .then((workspace) => {
          setRun(workspace.run);
          setLedgers(workspace.ledgers);
          setCriteria(workspace.criteria);
          setAuditEvents(workspace.auditEvents);
          setMutationStatus("saved");
          setMessage(`Approved ${label} for the exit readiness packet.`);
        })
        .catch(() => {
          setMutationStatus("error");
          setMessage("Exit readiness ledger approval is not available.");
        });
    },
    [],
  );

  const invalidateCriteria = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void invalidateReleaseExitReadinessCriteria({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setLedgers(workspace.ledgers);
        setCriteria(workspace.criteria);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Invalidated the stale exit criteria.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Stale-criterion invalidation is not available.");
      });
  }, [run]);

  const signOff = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void signOffReleaseExitReadiness({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setLedgers(workspace.ledgers);
        setCriteria(workspace.criteria);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage(
          "Recorded approver sign-off for the revised exit readiness packet.",
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

    void publishReleaseExitReadiness({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setLedgers(workspace.ledgers);
        setCriteria(workspace.criteria);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Published the exit readiness packet.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Exit readiness publish is not available.");
      });
  }, [run]);

  return {
    activeLedger,
    approveLedger,
    auditEvents,
    criteria,
    invalidateCriteria,
    ledgers,
    message,
    mutationStatus,
    publish,
    run,
    signOff,
    staleCriteria,
    start,
    status,
  };
}
