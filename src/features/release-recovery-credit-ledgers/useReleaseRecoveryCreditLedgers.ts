import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveReleaseRecoveryCreditLedger,
  fetchReleaseRecoveryCreditWorkspace,
  invalidateReleaseRecoveryCredits,
  isReleaseRecoveryCreditAbortError,
  publishReleaseRecoveryCredit,
  signOffReleaseRecoveryCredit,
  startReleaseRecoveryCredit,
} from "./client";
import type {
  ReleaseRecoveryCredit,
  ReleaseRecoveryCreditAuditEvent,
  ReleaseRecoveryCreditLedger,
  ReleaseRecoveryCreditRun,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleaseRecoveryCreditLedgers() {
  const [run, setRun] = useState<ReleaseRecoveryCreditRun | null>(null);
  const [ledgers, setLedgers] = useState<
    readonly ReleaseRecoveryCreditLedger[]
  >([]);
  const [credits, setCredits] = useState<readonly ReleaseRecoveryCredit[]>([]);
  const [auditEvents, setAuditEvents] = useState<
    readonly ReleaseRecoveryCreditAuditEvent[]
  >([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseRecoveryCreditWorkspace(controller.signal)
      .then((workspace) => {
        setRun(workspace.run);
        setLedgers(workspace.ledgers);
        setCredits(workspace.credits);
        setAuditEvents(workspace.auditEvents);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseRecoveryCreditAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the recovery credit workspace.");
      });

    return () => {
      controller.abort();
    };
  }, []);

  const activeLedger = useMemo(
    () => ledgers.find((ledger) => ledger.id === run?.activeLedgerId) ?? null,
    [ledgers, run?.activeLedgerId],
  );

  const staleCredits = useMemo(
    () => credits.filter((credit) => credit.status === "stale"),
    [credits],
  );

  const start = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void startReleaseRecoveryCredit({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setLedgers(workspace.ledgers);
        setCredits(workspace.credits);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Started recovery credit review.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Recovery credit review is no longer ready to start.");
      });
  }, [run]);

  const approveLedger = useCallback(
    (ledgerId: ReleaseRecoveryCreditLedger["id"], label: string) => {
      setMutationStatus("working");
      setMessage(null);

      void approveReleaseRecoveryCreditLedger({ ledgerId })
        .then((workspace) => {
          setRun(workspace.run);
          setLedgers(workspace.ledgers);
          setCredits(workspace.credits);
          setAuditEvents(workspace.auditEvents);
          setMutationStatus("saved");
          setMessage(`Approved ${label} for the recovery credit ledger.`);
        })
        .catch(() => {
          setMutationStatus("error");
          setMessage("Recovery credit ledger approval is not available.");
        });
    },
    [],
  );

  const invalidateCredits = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void invalidateReleaseRecoveryCredits({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setLedgers(workspace.ledgers);
        setCredits(workspace.credits);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Invalidated the stale recovery credits.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Stale-credit invalidation is not available.");
      });
  }, [run]);

  const signOff = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void signOffReleaseRecoveryCredit({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setLedgers(workspace.ledgers);
        setCredits(workspace.credits);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage(
          "Recorded approver sign-off for the revised recovery credit ledger.",
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

    void publishReleaseRecoveryCredit({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setLedgers(workspace.ledgers);
        setCredits(workspace.credits);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Published the recovery credit ledger.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Recovery credit publish is not available.");
      });
  }, [run]);

  return {
    activeLedger,
    approveLedger,
    auditEvents,
    credits,
    invalidateCredits,
    ledgers,
    message,
    mutationStatus,
    publish,
    run,
    signOff,
    staleCredits,
    start,
    status,
  };
}
