import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveReleaseRemediationEvidenceBundle,
  fetchReleaseRemediationEvidenceWorkspace,
  invalidateReleaseRemediationProofs,
  isReleaseRemediationEvidenceAbortError,
  publishReleaseRemediationEvidence,
  signOffReleaseRemediationEvidence,
  startReleaseRemediationEvidence,
} from "./client";
import type {
  ReleaseRemediationAuditEvent,
  ReleaseRemediationEvidenceBundle,
  ReleaseRemediationEvidenceRun,
  ReleaseRemediationProof,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleaseRemediationEvidenceBundles() {
  const [run, setRun] = useState<ReleaseRemediationEvidenceRun | null>(null);
  const [bundles, setBundles] = useState<
    readonly ReleaseRemediationEvidenceBundle[]
  >([]);
  const [proofs, setProofs] = useState<readonly ReleaseRemediationProof[]>([]);
  const [auditEvents, setAuditEvents] = useState<
    readonly ReleaseRemediationAuditEvent[]
  >([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseRemediationEvidenceWorkspace(controller.signal)
      .then((workspace) => {
        setRun(workspace.run);
        setBundles(workspace.bundles);
        setProofs(workspace.proofs);
        setAuditEvents(workspace.auditEvents);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseRemediationEvidenceAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the remediation evidence workspace.");
      });

    return () => {
      controller.abort();
    };
  }, []);

  const activeBundle = useMemo(
    () => bundles.find((bundle) => bundle.id === run?.activeBundleId) ?? null,
    [bundles, run?.activeBundleId],
  );

  const staleProofs = useMemo(
    () => proofs.filter((proof) => proof.status === "stale"),
    [proofs],
  );

  const start = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void startReleaseRemediationEvidence({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setBundles(workspace.bundles);
        setProofs(workspace.proofs);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Started remediation evidence review.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Remediation evidence review is no longer ready to start.");
      });
  }, [run]);

  const approveBundle = useCallback(
    (bundleId: ReleaseRemediationEvidenceBundle["id"], label: string) => {
      setMutationStatus("working");
      setMessage(null);

      void approveReleaseRemediationEvidenceBundle({ bundleId })
        .then((workspace) => {
          setRun(workspace.run);
          setBundles(workspace.bundles);
          setProofs(workspace.proofs);
          setAuditEvents(workspace.auditEvents);
          setMutationStatus("saved");
          setMessage(`Approved ${label} for the remediation packet.`);
        })
        .catch(() => {
          setMutationStatus("error");
          setMessage("Bundle approval is not available.");
        });
    },
    [],
  );

  const invalidateProofs = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void invalidateReleaseRemediationProofs({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setBundles(workspace.bundles);
        setProofs(workspace.proofs);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Invalidated the stale remediation proof.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Stale-proof invalidation is not available.");
      });
  }, [run]);

  const signOff = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void signOffReleaseRemediationEvidence({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setBundles(workspace.bundles);
        setProofs(workspace.proofs);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage(
          "Recorded approver sign-off for the remediation evidence packet.",
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

    void publishReleaseRemediationEvidence({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setBundles(workspace.bundles);
        setProofs(workspace.proofs);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Published the remediation evidence packet.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Remediation evidence publish is not available.");
      });
  }, [run]);

  return {
    activeBundle,
    approveBundle,
    auditEvents,
    bundles,
    invalidateProofs,
    message,
    mutationStatus,
    proofs,
    publish,
    run,
    signOff,
    staleProofs,
    start,
    status,
  };
}
