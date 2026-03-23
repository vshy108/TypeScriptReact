import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchReleaseMergeWorkspace,
  isReleaseMergeAbortError,
  saveReleaseMergeDraft,
  simulateTeammateMergeEdit,
} from "./client";
import type {
  FieldConflictState,
  MergeFieldName,
  ReleaseMergeRecord,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";
type SaveStatus = "idle" | "saving" | "saved" | "error";

function buildConflict(
  field: MergeFieldName,
  baseValue: string,
  localValue: string,
  serverValue: string,
): FieldConflictState | null {
  const localChanged = localValue !== baseValue;
  const serverChanged = serverValue !== baseValue;

  if (localChanged && serverChanged && localValue !== serverValue) {
    return { field, baseValue, localValue, serverValue };
  }

  return null;
}

export function useReleaseFieldMerge() {
  const [serverRecord, setServerRecord] = useState<ReleaseMergeRecord | null>(
    null,
  );
  const [baseRecord, setBaseRecord] = useState<ReleaseMergeRecord | null>(null);
  const [headlineDraft, setHeadlineDraft] = useState("");
  const [summaryDraft, setSummaryDraft] = useState("");
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [conflictFields, setConflictFields] = useState<
    readonly FieldConflictState[]
  >([]);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseMergeWorkspace(controller.signal)
      .then((workspace) => {
        setServerRecord(workspace.record);
        setBaseRecord(workspace.record);
        setHeadlineDraft(workspace.record.headline);
        setSummaryDraft(workspace.record.summary);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseMergeAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the merge workspace.");
      });

    return () => {
      controller.abort();
    };
  }, []);

  const hasConflicts = conflictFields.length > 0;

  const applyServerUpdate = useCallback(() => {
    simulateTeammateMergeEdit();

    void fetchReleaseMergeWorkspace().then((workspace) => {
      setServerRecord(workspace.record);

      setHeadlineDraft((currentHeadline) => {
        const currentBaseHeadline = baseRecord?.headline ?? currentHeadline;
        const localChanged = currentHeadline !== currentBaseHeadline;
        return localChanged ? currentHeadline : workspace.record.headline;
      });

      setSummaryDraft((currentSummary) => {
        const currentBaseSummary = baseRecord?.summary ?? currentSummary;
        const localChanged = currentSummary !== currentBaseSummary;
        return localChanged ? currentSummary : workspace.record.summary;
      });

      const nextConflicts = [
        buildConflict(
          "headline",
          baseRecord?.headline ?? workspace.record.headline,
          headlineDraft,
          workspace.record.headline,
        ),
        buildConflict(
          "summary",
          baseRecord?.summary ?? workspace.record.summary,
          summaryDraft,
          workspace.record.summary,
        ),
      ].filter((conflict): conflict is FieldConflictState => conflict !== null);

      setConflictFields(nextConflicts);
      setMessage(
        nextConflicts.length > 0
          ? "The server auto-merged untouched fields and left overlapping fields for you to resolve."
          : "The server change merged cleanly because your draft had not touched the same fields.",
      );
    });
  }, [baseRecord, headlineDraft, summaryDraft]);

  const resolveConflict = useCallback(
    (field: MergeFieldName, strategy: "server" | "local") => {
      const matchingConflict = conflictFields.find(
        (conflict) => conflict.field === field,
      );
      if (!matchingConflict || !serverRecord || !baseRecord) {
        return;
      }

      if (field === "headline") {
        setHeadlineDraft(
          strategy === "server"
            ? matchingConflict.serverValue
            : matchingConflict.localValue,
        );
      } else {
        setSummaryDraft(
          strategy === "server"
            ? matchingConflict.serverValue
            : matchingConflict.localValue,
        );
      }

      setBaseRecord(serverRecord);
      setConflictFields((currentConflicts) =>
        currentConflicts.filter((conflict) => conflict.field !== field),
      );
      setMessage(
        strategy === "server"
          ? `Accepted the server ${field} for the merged draft.`
          : `Kept your local ${field} and rebased it onto the latest server version.`,
      );
    },
    [baseRecord, conflictFields, serverRecord],
  );

  const save = useCallback(() => {
    if (!serverRecord || hasConflicts) {
      return;
    }

    setSaveStatus("saving");
    setMessage(null);

    void saveReleaseMergeDraft({
      mergeId: serverRecord.id,
      headline: headlineDraft,
      summary: summaryDraft,
      expectedRevision: serverRecord.revision,
    })
      .then((workspace) => {
        setServerRecord(workspace.record);
        setBaseRecord(workspace.record);
        setHeadlineDraft(workspace.record.headline);
        setSummaryDraft(workspace.record.summary);
        setSaveStatus("saved");
        setMessage(`Saved merged draft revision ${workspace.record.revision}.`);
      })
      .catch(() => {
        setSaveStatus("error");
        setMessage("Could not save the merged draft.");
      });
  }, [hasConflicts, headlineDraft, serverRecord, summaryDraft]);

  const mergePreview = useMemo(() => {
    return {
      headline: headlineDraft,
      summary: summaryDraft,
      revision: serverRecord?.revision ?? "Loading",
    };
  }, [headlineDraft, serverRecord?.revision, summaryDraft]);

  return {
    conflictFields,
    hasConflicts,
    headlineDraft,
    mergePreview,
    message,
    resolveConflict,
    save,
    saveStatus,
    serverRecord,
    status,
    summaryDraft,
    triggerServerUpdate: applyServerUpdate,
    updateHeadlineDraft: setHeadlineDraft,
    updateSummaryDraft: setSummaryDraft,
  };
}
