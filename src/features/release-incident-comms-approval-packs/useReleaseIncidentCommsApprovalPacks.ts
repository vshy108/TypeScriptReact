import { useCallback, useEffect, useMemo, useState } from "react";
import {
  applyReleaseIncidentCommsOverride,
  approveReleaseIncidentCommsPack,
  fetchReleaseIncidentCommsWorkspace,
  isReleaseIncidentCommsAbortError,
  publishReleaseIncidentComms,
  startReleaseIncidentComms,
} from "./client";
import type {
  ReleaseIncidentCommsApprovalPack,
  ReleaseIncidentCommsAuditEvent,
  ReleaseIncidentCommsDiffRow,
  ReleaseIncidentCommsRun,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleaseIncidentCommsApprovalPacks() {
  const [run, setRun] = useState<ReleaseIncidentCommsRun | null>(null);
  const [packs, setPacks] = useState<
    readonly ReleaseIncidentCommsApprovalPack[]
  >([]);
  const [diffRows, setDiffRows] = useState<
    readonly ReleaseIncidentCommsDiffRow[]
  >([]);
  const [auditEvents, setAuditEvents] = useState<
    readonly ReleaseIncidentCommsAuditEvent[]
  >([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseIncidentCommsWorkspace(controller.signal)
      .then((workspace) => {
        setRun(workspace.run);
        setPacks(workspace.packs);
        setDiffRows(workspace.diffRows);
        setAuditEvents(workspace.auditEvents);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseIncidentCommsAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the incident communications workspace.");
      });

    return () => {
      controller.abort();
    };
  }, []);

  const activePack = useMemo(
    () => packs.find((pack) => pack.id === run?.activePackId) ?? null,
    [packs, run?.activePackId],
  );

  const hasPendingDiffs = useMemo(
    () => diffRows.some((row) => row.status !== "approved"),
    [diffRows],
  );

  const start = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void startReleaseIncidentComms({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setPacks(workspace.packs);
        setDiffRows(workspace.diffRows);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Started staged incident communications review.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Incident comms approval is no longer ready to start.");
      });
  }, [run]);

  const approvePack = useCallback(
    (packId: ReleaseIncidentCommsApprovalPack["id"], owner: string) => {
      setMutationStatus("working");
      setMessage(null);

      void approveReleaseIncidentCommsPack({ packId })
        .then((workspace) => {
          setRun(workspace.run);
          setPacks(workspace.packs);
          setDiffRows(workspace.diffRows);
          setAuditEvents(workspace.auditEvents);
          setMutationStatus("saved");
          setMessage(`Captured staged approval from ${owner}.`);
        })
        .catch(() => {
          setMutationStatus("error");
          setMessage("Approval is not available.");
        });
    },
    [],
  );

  const applyOverride = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void applyReleaseIncidentCommsOverride({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setPacks(workspace.packs);
        setDiffRows(workspace.diffRows);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Applied the legal wording override to the rollback copy.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Legal override is not available.");
      });
  }, [run]);

  const publish = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void publishReleaseIncidentComms({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setPacks(workspace.packs);
        setDiffRows(workspace.diffRows);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Published the staged incident communications pack.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Incident comms publish is not available.");
      });
  }, [run]);

  return {
    activePack,
    applyOverride,
    approvePack,
    auditEvents,
    diffRows,
    hasPendingDiffs,
    message,
    mutationStatus,
    packs,
    publish,
    run,
    start,
    status,
  };
}
