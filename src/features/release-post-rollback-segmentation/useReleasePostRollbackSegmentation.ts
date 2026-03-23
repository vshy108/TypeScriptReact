import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveReleasePostRollbackForks,
  fetchReleasePostRollbackWorkspace,
  isReleasePostRollbackAbortError,
  publishReleasePostRollback,
  scheduleReleasePostRollbackSegment,
  startReleasePostRollback,
} from "./client";
import type {
  ReleasePostRollbackAuditEvent,
  ReleasePostRollbackMessageFork,
  ReleasePostRollbackRun,
  ReleasePostRollbackSegment,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleasePostRollbackSegmentation() {
  const [run, setRun] = useState<ReleasePostRollbackRun | null>(null);
  const [segments, setSegments] = useState<
    readonly ReleasePostRollbackSegment[]
  >([]);
  const [messageForks, setMessageForks] = useState<
    readonly ReleasePostRollbackMessageFork[]
  >([]);
  const [auditEvents, setAuditEvents] = useState<
    readonly ReleasePostRollbackAuditEvent[]
  >([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleasePostRollbackWorkspace(controller.signal)
      .then((workspace) => {
        setRun(workspace.run);
        setSegments(workspace.segments);
        setMessageForks(workspace.messageForks);
        setAuditEvents(workspace.auditEvents);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleasePostRollbackAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the post-rollback segmentation workspace.");
      });

    return () => {
      controller.abort();
    };
  }, []);

  const activeSegment = useMemo(
    () =>
      segments.find((segment) => segment.id === run?.activeSegmentId) ?? null,
    [segments, run?.activeSegmentId],
  );

  const pendingForks = useMemo(
    () => messageForks.filter((fork) => fork.status !== "approved"),
    [messageForks],
  );

  const start = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void startReleasePostRollback({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setSegments(workspace.segments);
        setMessageForks(workspace.messageForks);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Started post-rollback segmentation planning.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Post-rollback segmentation is no longer ready to start.");
      });
  }, [run]);

  const scheduleSegment = useCallback(
    (segmentId: ReleasePostRollbackSegment["id"], label: string) => {
      setMutationStatus("working");
      setMessage(null);

      void scheduleReleasePostRollbackSegment({ segmentId })
        .then((workspace) => {
          setRun(workspace.run);
          setSegments(workspace.segments);
          setMessageForks(workspace.messageForks);
          setAuditEvents(workspace.auditEvents);
          setMutationStatus("saved");
          setMessage(
            `Scheduled ${label} with its region-specific send window.`,
          );
        })
        .catch(() => {
          setMutationStatus("error");
          setMessage("Segment scheduling is not available.");
        });
    },
    [],
  );

  const approveForks = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void approveReleasePostRollbackForks({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setSegments(workspace.segments);
        setMessageForks(workspace.messageForks);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Approved the escalation-safe message forks.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Fork approval is not available.");
      });
  }, [run]);

  const publish = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void publishReleasePostRollback({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setSegments(workspace.segments);
        setMessageForks(workspace.messageForks);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Published the segmented rollback updates.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Segmented rollback publish is not available.");
      });
  }, [run]);

  return {
    activeSegment,
    approveForks,
    auditEvents,
    message,
    messageForks,
    mutationStatus,
    pendingForks,
    publish,
    run,
    scheduleSegment,
    segments,
    start,
    status,
  };
}
