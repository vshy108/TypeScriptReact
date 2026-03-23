import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveReleaseReviewer,
  fetchReleaseReviewWorkspace,
  isReleaseReviewAbortError,
  publishReleaseReviewCandidate,
  resolveReleaseReviewThread,
  saveReleaseReviewDraft,
  simulateReviewerFeedback,
} from "./client";
import type {
  ReleaseReviewerApproval,
  ReleaseReviewRecord,
  ReleaseReviewThread,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleaseReviewThreads() {
  const [record, setRecord] = useState<ReleaseReviewRecord | null>(null);
  const [threads, setThreads] = useState<readonly ReleaseReviewThread[]>([]);
  const [approvals, setApprovals] = useState<
    readonly ReleaseReviewerApproval[]
  >([]);
  const [draftSummary, setDraftSummary] = useState("");
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseReviewWorkspace(controller.signal)
      .then((workspace) => {
        setRecord(workspace.record);
        setThreads(workspace.threads);
        setApprovals(workspace.approvals);
        setDraftSummary(workspace.record.summary);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseReviewAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the review workspace.");
      });

    return () => {
      controller.abort();
    };
  }, []);

  const openThreads = useMemo(
    () => threads.filter((thread) => thread.status === "open"),
    [threads],
  );
  const approvedCount = useMemo(
    () => approvals.filter((approval) => approval.status === "approved").length,
    [approvals],
  );
  const canPublish = useMemo(
    () =>
      openThreads.length === 0 &&
      approvals.every((approval) => approval.status === "approved"),
    [approvals, openThreads.length],
  );

  const updateWorkspace = useCallback(
    (workspace: {
      record: ReleaseReviewRecord;
      threads: readonly ReleaseReviewThread[];
      approvals: readonly ReleaseReviewerApproval[];
    }) => {
      setRecord(workspace.record);
      setThreads(workspace.threads);
      setApprovals(workspace.approvals);
    },
    [],
  );

  const saveDraft = useCallback(() => {
    if (!record) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void saveReleaseReviewDraft({ reviewId: record.id, summary: draftSummary })
      .then((workspace) => {
        updateWorkspace(workspace);
        setDraftSummary(workspace.record.summary);
        setMutationStatus("saved");
        setMessage(`Saved review draft revision ${workspace.record.revision}.`);
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Could not save the review draft.");
      });
  }, [draftSummary, record, updateWorkspace]);

  const requestReviewerFeedback = useCallback(() => {
    setMutationStatus("working");
    setMessage(null);

    void simulateReviewerFeedback()
      .then((workspace) => {
        updateWorkspace(workspace);
        setMutationStatus("saved");
        setMessage(
          "Legal review added a blocking thread and moved approval back to changes requested.",
        );
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Could not simulate reviewer feedback.");
      });
  }, [updateWorkspace]);

  const resolveFirstThread = useCallback(() => {
    const firstOpenThread = openThreads[0];
    if (!firstOpenThread) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void resolveReleaseReviewThread(firstOpenThread.id)
      .then((workspace) => {
        updateWorkspace(workspace);
        setMutationStatus("saved");
        setMessage("Resolved the first blocking review thread.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Could not resolve the review thread.");
      });
  }, [openThreads, updateWorkspace]);

  const approveReviewer = useCallback(
    (reviewerId: ReleaseReviewerApproval["id"], reviewerRole: string) => {
      setMutationStatus("working");
      setMessage(null);

      void approveReleaseReviewer(reviewerId)
        .then((workspace) => {
          updateWorkspace(workspace);
          setMutationStatus("saved");
          setMessage(`Approved ${reviewerRole}.`);
        })
        .catch(() => {
          setMutationStatus("error");
          setMessage("Could not record the reviewer approval.");
        });
    },
    [updateWorkspace],
  );

  const publish = useCallback(() => {
    if (!record) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void publishReleaseReviewCandidate({ reviewId: record.id })
      .then((workspace) => {
        updateWorkspace(workspace);
        setMutationStatus("saved");
        setMessage(
          `Published review candidate revision ${workspace.record.revision}.`,
        );
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage(
          "Cannot publish while threads are open or approvals are incomplete.",
        );
      });
  }, [record, updateWorkspace]);

  return {
    approvedCount,
    approvals,
    canPublish,
    draftSummary,
    message,
    mutationStatus,
    openThreads,
    publish,
    record,
    requestReviewerFeedback,
    resolveFirstThread,
    saveDraft,
    status,
    threads,
    updateDraftSummary: setDraftSummary,
    approveReviewer,
  };
}
