import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveReleaseStabilityAttestationLedger,
  fetchReleaseStabilityAttestationWorkspace,
  invalidateReleaseStabilityAttestationSignals,
  isReleaseStabilityAttestationAbortError,
  publishReleaseStabilityAttestation,
  signOffReleaseStabilityAttestation,
  startReleaseStabilityAttestation,
} from "./client";
import type {
  ReleaseStabilityAttestationAuditEvent,
  ReleaseStabilityAttestationLedger,
  ReleaseStabilityAttestationRun,
  ReleaseStabilityAttestationSignal,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleaseStabilityAttestationLedgers() {
  const [run, setRun] = useState<ReleaseStabilityAttestationRun | null>(null);
  const [ledgers, setLedgers] = useState<
    readonly ReleaseStabilityAttestationLedger[]
  >([]);
  const [signals, setSignals] = useState<
    readonly ReleaseStabilityAttestationSignal[]
  >([]);
  const [auditEvents, setAuditEvents] = useState<
    readonly ReleaseStabilityAttestationAuditEvent[]
  >([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseStabilityAttestationWorkspace(controller.signal)
      .then((workspace) => {
        setRun(workspace.run);
        setLedgers(workspace.ledgers);
        setSignals(workspace.signals);
        setAuditEvents(workspace.auditEvents);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseStabilityAttestationAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the stability attestation workspace.");
      });

    return () => {
      controller.abort();
    };
  }, []);

  const activeLedger = useMemo(
    () => ledgers.find((ledger) => ledger.id === run?.activeLedgerId) ?? null,
    [ledgers, run?.activeLedgerId],
  );

  const staleSignals = useMemo(
    () => signals.filter((item) => item.status === "stale"),
    [signals],
  );

  const start = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void startReleaseStabilityAttestation({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setLedgers(workspace.ledgers);
        setSignals(workspace.signals);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Started stability attestation review.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Stability attestation review is no longer ready to start.");
      });
  }, [run]);

  const approveLedger = useCallback(
    (ledgerId: ReleaseStabilityAttestationLedger["id"], label: string) => {
      setMutationStatus("working");
      setMessage(null);

      void approveReleaseStabilityAttestationLedger({ ledgerId })
        .then((workspace) => {
          setRun(workspace.run);
          setLedgers(workspace.ledgers);
          setSignals(workspace.signals);
          setAuditEvents(workspace.auditEvents);
          setMutationStatus("saved");
          setMessage(`Approved ${label} for the stability attestation packet.`);
        })
        .catch(() => {
          setMutationStatus("error");
          setMessage("Stability attestation ledger approval is not available.");
        });
    },
    [],
  );

  const invalidateSignals = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void invalidateReleaseStabilityAttestationSignals({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setLedgers(workspace.ledgers);
        setSignals(workspace.signals);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Invalidated the stale stability signals.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Stale-signal invalidation is not available.");
      });
  }, [run]);

  const signOff = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void signOffReleaseStabilityAttestation({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setLedgers(workspace.ledgers);
        setSignals(workspace.signals);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage(
          "Recorded approver sign-off for the revised stability attestation packet.",
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

    void publishReleaseStabilityAttestation({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setLedgers(workspace.ledgers);
        setSignals(workspace.signals);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Published the stability attestation packet.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Stability attestation publish is not available.");
      });
  }, [run]);

  return {
    activeLedger,
    approveLedger,
    auditEvents,
    invalidateSignals,
    ledgers,
    message,
    mutationStatus,
    publish,
    run,
    signOff,
    signals,
    staleSignals,
    start,
    status,
  };
}
