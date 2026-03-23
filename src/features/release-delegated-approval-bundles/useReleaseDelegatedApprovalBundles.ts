import { useCallback, useEffect, useMemo, useState } from "react";
import {
  advanceReleaseDelegatedApprovalClock,
  approveReleaseDelegatedBundle,
  fetchReleaseDelegatedApprovalWorkspace,
  isReleaseDelegatedApprovalAbortError,
  publishReleaseDelegatedApproval,
  releaseDelegatedApprovalTickMs,
  replayReleaseDelegatedEvidence,
  startReleaseDelegatedApproval,
} from "./client";
import type {
  ReleaseDelegatedApprovalAuditEvent,
  ReleaseDelegatedApprovalBundle,
  ReleaseDelegatedApprovalEvidence,
  ReleaseDelegatedApprovalRun,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleaseDelegatedApprovalBundles() {
  const [run, setRun] = useState<ReleaseDelegatedApprovalRun | null>(null);
  const [bundles, setBundles] = useState<
    readonly ReleaseDelegatedApprovalBundle[]
  >([]);
  const [evidence, setEvidence] = useState<
    readonly ReleaseDelegatedApprovalEvidence[]
  >([]);
  const [auditEvents, setAuditEvents] = useState<
    readonly ReleaseDelegatedApprovalAuditEvent[]
  >([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      advanceReleaseDelegatedApprovalClock();
      setTick((currentTick) => currentTick + 1);
    }, releaseDelegatedApprovalTickMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseDelegatedApprovalWorkspace(controller.signal)
      .then((workspace) => {
        setRun(workspace.run);
        setBundles(workspace.bundles);
        setEvidence(workspace.evidence);
        setAuditEvents(workspace.auditEvents);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseDelegatedApprovalAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the delegated approval workspace.");
      });

    return () => {
      controller.abort();
    };
  }, [tick]);

  const activeBundle = useMemo(
    () => bundles.find((bundle) => bundle.id === run?.activeBundleId) ?? null,
    [bundles, run?.activeBundleId],
  );

  const start = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void startReleaseDelegatedApproval({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setBundles(workspace.bundles);
        setEvidence(workspace.evidence);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Started delegated approval collection.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Delegated approval workflow is no longer ready to start.");
      });
  }, [run]);

  const approveBundle = useCallback(
    (bundleId: ReleaseDelegatedApprovalBundle["id"], approver: string) => {
      setMutationStatus("working");
      setMessage(null);

      void approveReleaseDelegatedBundle({ bundleId })
        .then((workspace) => {
          setRun(workspace.run);
          setBundles(workspace.bundles);
          setEvidence(workspace.evidence);
          setAuditEvents(workspace.auditEvents);
          setMutationStatus("saved");
          setMessage(`Captured delegated approval from ${approver}.`);
        })
        .catch(() => {
          setMutationStatus("error");
          setMessage("Approval is not available.");
        });
    },
    [],
  );

  const replayEvidence = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void replayReleaseDelegatedEvidence({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setBundles(workspace.bundles);
        setEvidence(workspace.evidence);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage(
          "Replayed the approval evidence and cleared the publish gate.",
        );
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Audit evidence replay is not available.");
      });
  }, [run]);

  const publish = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void publishReleaseDelegatedApproval({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setBundles(workspace.bundles);
        setEvidence(workspace.evidence);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage(
          "Published after delegated approval and audit replay completed.",
        );
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Publish is not available.");
      });
  }, [run]);

  return {
    activeBundle,
    approveBundle,
    auditEvents,
    bundles,
    evidence,
    message,
    mutationStatus,
    publish,
    replayEvidence,
    run,
    start,
    status,
  };
}
