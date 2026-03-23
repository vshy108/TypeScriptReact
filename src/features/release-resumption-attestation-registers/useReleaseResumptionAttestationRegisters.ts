import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveReleaseResumptionAttestationRegister,
  fetchReleaseResumptionAttestationWorkspace,
  invalidateReleaseResumptionAttestationChecks,
  isReleaseResumptionAttestationAbortError,
  publishReleaseResumptionAttestation,
  signOffReleaseResumptionAttestation,
  startReleaseResumptionAttestation,
} from "./client";
import type {
  ReleaseResumptionAttestationAuditEvent,
  ReleaseResumptionAttestationCheck,
  ReleaseResumptionAttestationRegister,
  ReleaseResumptionAttestationRun,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleaseResumptionAttestationRegisters() {
  const [run, setRun] = useState<ReleaseResumptionAttestationRun | null>(null);
  const [registers, setRegisters] = useState<
    readonly ReleaseResumptionAttestationRegister[]
  >([]);
  const [checks, setChecks] = useState<
    readonly ReleaseResumptionAttestationCheck[]
  >([]);
  const [auditEvents, setAuditEvents] = useState<
    readonly ReleaseResumptionAttestationAuditEvent[]
  >([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseResumptionAttestationWorkspace(controller.signal)
      .then((workspace) => {
        setRun(workspace.run);
        setRegisters(workspace.registers);
        setChecks(workspace.checks);
        setAuditEvents(workspace.auditEvents);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseResumptionAttestationAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the resumption attestation workspace.");
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

  const staleChecks = useMemo(
    () => checks.filter((check) => check.status === "stale"),
    [checks],
  );

  const start = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void startReleaseResumptionAttestation({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setRegisters(workspace.registers);
        setChecks(workspace.checks);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Started resumption attestation review.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage(
          "Resumption attestation review is no longer ready to start.",
        );
      });
  }, [run]);

  const approveRegister = useCallback(
    (registerId: ReleaseResumptionAttestationRegister["id"], label: string) => {
      setMutationStatus("working");
      setMessage(null);

      void approveReleaseResumptionAttestationRegister({ registerId })
        .then((workspace) => {
          setRun(workspace.run);
          setRegisters(workspace.registers);
          setChecks(workspace.checks);
          setAuditEvents(workspace.auditEvents);
          setMutationStatus("saved");
          setMessage(
            `Approved ${label} for the resumption attestation packet.`,
          );
        })
        .catch(() => {
          setMutationStatus("error");
          setMessage(
            "Resumption attestation register approval is not available.",
          );
        });
    },
    [],
  );

  const invalidateChecks = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void invalidateReleaseResumptionAttestationChecks({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setRegisters(workspace.registers);
        setChecks(workspace.checks);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Invalidated the stale resumption checks.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Stale-check invalidation is not available.");
      });
  }, [run]);

  const signOff = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void signOffReleaseResumptionAttestation({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setRegisters(workspace.registers);
        setChecks(workspace.checks);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage(
          "Recorded approver sign-off for the revised resumption attestation packet.",
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

    void publishReleaseResumptionAttestation({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setRegisters(workspace.registers);
        setChecks(workspace.checks);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Published the resumption attestation packet.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Resumption attestation publish is not available.");
      });
  }, [run]);

  return {
    activeRegister,
    approveRegister,
    auditEvents,
    checks,
    invalidateChecks,
    message,
    mutationStatus,
    publish,
    registers,
    run,
    signOff,
    staleChecks,
    start,
    status,
  };
}
