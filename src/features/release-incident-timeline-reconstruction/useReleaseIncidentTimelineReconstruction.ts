import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchReleaseTimelineWorkspace,
  generateReleaseTimelineSummary,
  isReleaseTimelineAbortError,
  publishReleaseTimelineSummary,
  resolveReleaseTimelineConflict,
  startReleaseTimeline,
} from "./client";
import type {
  ReleaseTimelineAuditEvent,
  ReleaseTimelineConflict,
  ReleaseTimelineEntry,
  ReleaseTimelineExecutiveSummary,
  ReleaseTimelineRun,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleaseIncidentTimelineReconstruction() {
  const [run, setRun] = useState<ReleaseTimelineRun | null>(null);
  const [entries, setEntries] = useState<readonly ReleaseTimelineEntry[]>([]);
  const [conflicts, setConflicts] = useState<
    readonly ReleaseTimelineConflict[]
  >([]);
  const [executiveSummary, setExecutiveSummary] =
    useState<ReleaseTimelineExecutiveSummary | null>(null);
  const [auditEvents, setAuditEvents] = useState<
    readonly ReleaseTimelineAuditEvent[]
  >([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseTimelineWorkspace(controller.signal)
      .then((workspace) => {
        setRun(workspace.run);
        setEntries(workspace.entries);
        setConflicts(workspace.conflicts);
        setExecutiveSummary(workspace.executiveSummary);
        setAuditEvents(workspace.auditEvents);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseTimelineAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the timeline reconstruction workspace.");
      });

    return () => {
      controller.abort();
    };
  }, []);

  const activeConflict = useMemo(
    () =>
      conflicts.find((conflict) => conflict.id === run?.activeConflictId) ??
      null,
    [conflicts, run?.activeConflictId],
  );

  const start = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void startReleaseTimeline({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setEntries(workspace.entries);
        setConflicts(workspace.conflicts);
        setExecutiveSummary(workspace.executiveSummary);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Started incident timeline reconstruction.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Timeline reconstruction is no longer ready to start.");
      });
  }, [run]);

  const resolveConflict = useCallback(
    (
      conflictId: ReleaseTimelineConflict["id"],
      resolvedSource: "ops" | "support",
    ) => {
      setMutationStatus("working");
      setMessage(null);

      void resolveReleaseTimelineConflict({ conflictId, resolvedSource })
        .then((workspace) => {
          setRun(workspace.run);
          setEntries(workspace.entries);
          setConflicts(workspace.conflicts);
          setExecutiveSummary(workspace.executiveSummary);
          setAuditEvents(workspace.auditEvents);
          setMutationStatus("saved");
          setMessage(
            `Resolved the timeline conflict in favor of the ${resolvedSource} note.`,
          );
        })
        .catch(() => {
          setMutationStatus("error");
          setMessage("Conflict resolution is not available.");
        });
    },
    [],
  );

  const generateSummary = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void generateReleaseTimelineSummary({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setEntries(workspace.entries);
        setConflicts(workspace.conflicts);
        setExecutiveSummary(workspace.executiveSummary);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Generated a publish-safe executive summary.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Executive summary generation is not available.");
      });
  }, [run]);

  const publishSummary = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void publishReleaseTimelineSummary({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setEntries(workspace.entries);
        setConflicts(workspace.conflicts);
        setExecutiveSummary(workspace.executiveSummary);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage(
          "Published the executive summary from the reconciled timeline.",
        );
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Executive summary publish is not available.");
      });
  }, [run]);

  return {
    activeConflict,
    auditEvents,
    conflicts,
    entries,
    executiveSummary,
    generateSummary,
    message,
    mutationStatus,
    publishSummary,
    resolveConflict,
    run,
    start,
    status,
  };
}
