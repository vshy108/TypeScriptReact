import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchReleaseHistoryWorkspace,
  isReleaseHistoryAbortError,
  saveReleaseHistoryDraft,
  simulateTeammateHistoryChange,
  undoLatestReleaseHistoryChange,
} from "./client";
import type { ReleaseAuditEntry, ReleaseHistoryRecord } from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleaseChangeHistory() {
  const [record, setRecord] = useState<ReleaseHistoryRecord | null>(null);
  const [auditTrail, setAuditTrail] = useState<readonly ReleaseAuditEntry[]>(
    [],
  );
  const [headlineDraft, setHeadlineDraft] = useState("");
  const [summaryDraft, setSummaryDraft] = useState("");
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseHistoryWorkspace(controller.signal)
      .then((workspace) => {
        setRecord(workspace.record);
        setAuditTrail(workspace.auditTrail);
        setHeadlineDraft(workspace.record.headline);
        setSummaryDraft(workspace.record.summary);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseHistoryAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the history workspace.");
      });

    return () => {
      controller.abort();
    };
  }, []);

  const updateWorkspace = useCallback(
    (workspace: {
      record: ReleaseHistoryRecord;
      auditTrail: readonly ReleaseAuditEntry[];
    }) => {
      setRecord(workspace.record);
      setAuditTrail(workspace.auditTrail);
      setHeadlineDraft(workspace.record.headline);
      setSummaryDraft(workspace.record.summary);
    },
    [],
  );

  const saveDraft = useCallback(() => {
    if (!record) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void saveReleaseHistoryDraft({
      historyId: record.id,
      headline: headlineDraft,
      summary: summaryDraft,
    })
      .then((workspace) => {
        updateWorkspace(workspace);
        setMutationStatus("saved");
        setMessage(
          `Saved release history revision ${workspace.record.revision}.`,
        );
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Could not save the release draft.");
      });
  }, [headlineDraft, record, summaryDraft, updateWorkspace]);

  const simulateTeammateChange = useCallback(() => {
    setMutationStatus("working");
    setMessage(null);

    void simulateTeammateHistoryChange()
      .then((workspace) => {
        updateWorkspace(workspace);
        setMutationStatus("saved");
        setMessage(
          "A teammate updated the shared release copy and the audit history captured the attribution.",
        );
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Could not simulate the teammate change.");
      });
  }, [updateWorkspace]);

  const undoLatestChange = useCallback(() => {
    setMutationStatus("working");
    setMessage(null);

    void undoLatestReleaseHistoryChange()
      .then((workspace) => {
        updateWorkspace(workspace);
        setMutationStatus("saved");
        setMessage(
          `Undid the latest change and restored revision ${workspace.record.revision}.`,
        );
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Could not undo the latest change.");
      });
  }, [updateWorkspace]);

  const latestEntry = useMemo(() => auditTrail[0] ?? null, [auditTrail]);

  return {
    auditTrail,
    headlineDraft,
    latestEntry,
    message,
    mutationStatus,
    record,
    saveDraft,
    simulateTeammateChange,
    status,
    summaryDraft,
    undoLatestChange,
    updateHeadlineDraft: setHeadlineDraft,
    updateSummaryDraft: setSummaryDraft,
  };
}
