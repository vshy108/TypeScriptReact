import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveReleaseRollbackDecision,
  executeReleaseRollbackDecision,
  fetchReleaseRollbackDecisionWorkspace,
  isReleaseRollbackDecisionAbortError,
  resolveReleaseRollbackMetric,
  startReleaseRollbackDecision,
} from "./client";
import type {
  ReleaseRollbackDecisionAuditEvent,
  ReleaseRollbackDecisionRun,
  ReleaseRollbackMetric,
  ReleaseRollbackSignoff,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleaseRollbackDecisionMatrix() {
  const [run, setRun] = useState<ReleaseRollbackDecisionRun | null>(null);
  const [metrics, setMetrics] = useState<readonly ReleaseRollbackMetric[]>([]);
  const [signoffs, setSignoffs] = useState<readonly ReleaseRollbackSignoff[]>(
    [],
  );
  const [auditEvents, setAuditEvents] = useState<
    readonly ReleaseRollbackDecisionAuditEvent[]
  >([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseRollbackDecisionWorkspace(controller.signal)
      .then((workspace) => {
        setRun(workspace.run);
        setMetrics(workspace.metrics);
        setSignoffs(workspace.signoffs);
        setAuditEvents(workspace.auditEvents);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseRollbackDecisionAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the rollback decision workspace.");
      });

    return () => {
      controller.abort();
    };
  }, []);

  const conflictingMetrics = useMemo(
    () => metrics.filter((metric) => metric.status === "conflicting"),
    [metrics],
  );

  const approvedCount = useMemo(
    () => signoffs.filter((signoff) => signoff.status === "approved").length,
    [signoffs],
  );

  const start = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void startReleaseRollbackDecision({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setMetrics(workspace.metrics);
        setSignoffs(workspace.signoffs);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Started rollback decision review.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Rollback decision matrix is no longer ready to start.");
      });
  }, [run]);

  const resolveMetric = useCallback(
    (metricId: ReleaseRollbackMetric["id"], decision: "rollback" | "hold") => {
      setMutationStatus("working");
      setMessage(null);

      void resolveReleaseRollbackMetric({ metricId, decision })
        .then((workspace) => {
          setRun(workspace.run);
          setMetrics(workspace.metrics);
          setSignoffs(workspace.signoffs);
          setAuditEvents(workspace.auditEvents);
          setMutationStatus("saved");
          setMessage(`Resolved the decision matrix in favor of ${decision}.`);
        })
        .catch(() => {
          setMutationStatus("error");
          setMessage("Metric resolution is not available.");
        });
    },
    [],
  );

  const approve = useCallback(
    (signoffId: ReleaseRollbackSignoff["id"], owner: string) => {
      setMutationStatus("working");
      setMessage(null);

      void approveReleaseRollbackDecision({ signoffId })
        .then((workspace) => {
          setRun(workspace.run);
          setMetrics(workspace.metrics);
          setSignoffs(workspace.signoffs);
          setAuditEvents(workspace.auditEvents);
          setMutationStatus("saved");
          setMessage(`Captured quorum approval from ${owner}.`);
        })
        .catch(() => {
          setMutationStatus("error");
          setMessage("Quorum approval is not available.");
        });
    },
    [],
  );

  const execute = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void executeReleaseRollbackDecision({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setMetrics(workspace.metrics);
        setSignoffs(workspace.signoffs);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage(
          `Executed the ${workspace.run.recommendedAction} decision after quorum.`,
        );
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Rollback execution is not available.");
      });
  }, [run]);

  return {
    approvedCount,
    approve,
    auditEvents,
    conflictingMetrics,
    execute,
    message,
    metrics,
    mutationStatus,
    resolveMetric,
    run,
    signoffs,
    start,
    status,
  };
}
