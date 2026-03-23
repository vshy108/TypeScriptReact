import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveReleaseRemediationReadinessRegistry,
  fetchReleaseRemediationReadinessWorkspace,
  invalidateReleaseRemediationReadinessEvidence,
  isReleaseRemediationReadinessAbortError,
  publishReleaseRemediationReadiness,
  signOffReleaseRemediationReadiness,
  startReleaseRemediationReadiness,
} from "./client";
import type {
  ReleaseRemediationReadinessAuditEvent,
  ReleaseRemediationReadinessEvidence,
  ReleaseRemediationReadinessRegistry,
  ReleaseRemediationReadinessRun,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleaseRemediationReadinessRegistries() {
  const [run, setRun] = useState<ReleaseRemediationReadinessRun | null>(null);
  const [registries, setRegistries] = useState<
    readonly ReleaseRemediationReadinessRegistry[]
  >([]);
  const [evidenceRows, setEvidenceRows] = useState<
    readonly ReleaseRemediationReadinessEvidence[]
  >([]);
  const [auditEvents, setAuditEvents] = useState<
    readonly ReleaseRemediationReadinessAuditEvent[]
  >([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseRemediationReadinessWorkspace(controller.signal)
      .then((workspace) => {
        setRun(workspace.run);
        setRegistries(workspace.registries);
        setEvidenceRows(workspace.evidenceRows);
        setAuditEvents(workspace.auditEvents);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseRemediationReadinessAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the remediation readiness workspace.");
      });

    return () => {
      controller.abort();
    };
  }, []);

  const activeRegistry = useMemo(
    () =>
      registries.find((registry) => registry.id === run?.activeRegistryId) ??
      null,
    [registries, run?.activeRegistryId],
  );

  const staleEvidenceRows = useMemo(
    () => evidenceRows.filter((item) => item.status === "stale"),
    [evidenceRows],
  );

  const start = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void startReleaseRemediationReadiness({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setRegistries(workspace.registries);
        setEvidenceRows(workspace.evidenceRows);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Started remediation readiness review.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Remediation readiness review is no longer ready to start.");
      });
  }, [run]);

  const approveRegistry = useCallback(
    (registryId: ReleaseRemediationReadinessRegistry["id"], label: string) => {
      setMutationStatus("working");
      setMessage(null);

      void approveReleaseRemediationReadinessRegistry({ registryId })
        .then((workspace) => {
          setRun(workspace.run);
          setRegistries(workspace.registries);
          setEvidenceRows(workspace.evidenceRows);
          setAuditEvents(workspace.auditEvents);
          setMutationStatus("saved");
          setMessage(`Approved ${label} for the remediation readiness packet.`);
        })
        .catch(() => {
          setMutationStatus("error");
          setMessage(
            "Remediation readiness registry approval is not available.",
          );
        });
    },
    [],
  );

  const invalidateEvidence = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void invalidateReleaseRemediationReadinessEvidence({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setRegistries(workspace.registries);
        setEvidenceRows(workspace.evidenceRows);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Invalidated the stale remediation readiness evidence.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Stale-evidence invalidation is not available.");
      });
  }, [run]);

  const signOff = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void signOffReleaseRemediationReadiness({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setRegistries(workspace.registries);
        setEvidenceRows(workspace.evidenceRows);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage(
          "Recorded approver sign-off for the revised remediation readiness packet.",
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

    void publishReleaseRemediationReadiness({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setRegistries(workspace.registries);
        setEvidenceRows(workspace.evidenceRows);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Published the remediation readiness packet.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Remediation readiness publish is not available.");
      });
  }, [run]);

  return {
    activeRegistry,
    approveRegistry,
    auditEvents,
    evidenceRows,
    invalidateEvidence,
    message,
    mutationStatus,
    publish,
    registries,
    run,
    signOff,
    staleEvidenceRows,
    start,
    status,
  };
}
