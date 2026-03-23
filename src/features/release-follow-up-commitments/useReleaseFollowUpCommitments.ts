import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveReleaseFollowUpCommitment,
  fetchReleaseFollowUpWorkspace,
  invalidateReleaseFollowUpEtaDrifts,
  isReleaseFollowUpAbortError,
  publishReleaseFollowUp,
  signOffReleaseFollowUp,
  startReleaseFollowUp,
} from "./client";
import type {
  ReleaseFollowUpAuditEvent,
  ReleaseFollowUpCommitment,
  ReleaseFollowUpCommitmentRun,
  ReleaseFollowUpEtaDrift,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleaseFollowUpCommitments() {
  const [run, setRun] = useState<ReleaseFollowUpCommitmentRun | null>(null);
  const [commitments, setCommitments] = useState<
    readonly ReleaseFollowUpCommitment[]
  >([]);
  const [etaDrifts, setEtaDrifts] = useState<
    readonly ReleaseFollowUpEtaDrift[]
  >([]);
  const [auditEvents, setAuditEvents] = useState<
    readonly ReleaseFollowUpAuditEvent[]
  >([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseFollowUpWorkspace(controller.signal)
      .then((workspace) => {
        setRun(workspace.run);
        setCommitments(workspace.commitments);
        setEtaDrifts(workspace.etaDrifts);
        setAuditEvents(workspace.auditEvents);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseFollowUpAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the follow-up commitments workspace.");
      });

    return () => {
      controller.abort();
    };
  }, []);

  const activeCommitment = useMemo(
    () =>
      commitments.find(
        (commitment) => commitment.id === run?.activeCommitmentId,
      ) ?? null,
    [commitments, run?.activeCommitmentId],
  );

  const driftedEtas = useMemo(
    () => etaDrifts.filter((item) => item.status === "drifted"),
    [etaDrifts],
  );

  const start = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void startReleaseFollowUp({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setCommitments(workspace.commitments);
        setEtaDrifts(workspace.etaDrifts);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Started post-incident follow-up review.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Follow-up commitments are no longer ready to start.");
      });
  }, [run]);

  const approveCommitment = useCallback(
    (commitmentId: ReleaseFollowUpCommitment["id"], label: string) => {
      setMutationStatus("working");
      setMessage(null);

      void approveReleaseFollowUpCommitment({ commitmentId })
        .then((workspace) => {
          setRun(workspace.run);
          setCommitments(workspace.commitments);
          setEtaDrifts(workspace.etaDrifts);
          setAuditEvents(workspace.auditEvents);
          setMutationStatus("saved");
          setMessage(`Approved ${label} for the follow-up bundle.`);
        })
        .catch(() => {
          setMutationStatus("error");
          setMessage("Commitment approval is not available.");
        });
    },
    [],
  );

  const invalidateEtaDrifts = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void invalidateReleaseFollowUpEtaDrifts({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setCommitments(workspace.commitments);
        setEtaDrifts(workspace.etaDrifts);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Invalidated the drifted follow-up ETAs.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("ETA drift invalidation is not available.");
      });
  }, [run]);

  const signOff = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void signOffReleaseFollowUp({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setCommitments(workspace.commitments);
        setEtaDrifts(workspace.etaDrifts);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage(
          "Recorded approver sign-off for the revised follow-up commitments.",
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

    void publishReleaseFollowUp({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setCommitments(workspace.commitments);
        setEtaDrifts(workspace.etaDrifts);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Published the follow-up commitments bundle.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Follow-up publish is not available.");
      });
  }, [run]);

  return {
    activeCommitment,
    approveCommitment,
    auditEvents,
    commitments,
    driftedEtas,
    etaDrifts,
    invalidateEtaDrifts,
    message,
    mutationStatus,
    publish,
    run,
    signOff,
    start,
    status,
  };
}
