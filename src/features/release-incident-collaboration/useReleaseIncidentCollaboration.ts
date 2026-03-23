import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchReleaseIncidentWorkspace,
  isReleaseIncidentAbortError,
  isReleaseIncidentConflictError,
  releaseIncidentPollIntervalMs,
  saveReleaseIncidentDraft,
  simulateTeammateIncidentEdit,
} from "./client";
import type {
  ReleaseCollaboratorPresence,
  ReleaseIncidentRecord,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";
type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useReleaseIncidentCollaboration() {
  const [serverRecord, setServerRecord] =
    useState<ReleaseIncidentRecord | null>(null);
  const [collaborators, setCollaborators] = useState<
    readonly ReleaseCollaboratorPresence[]
  >([]);
  const [draftSummary, setDraftSummary] = useState("");
  const [baselineRevision, setBaselineRevision] = useState<number | null>(null);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [pollTick, setPollTick] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setPollTick((currentTick) => currentTick + 1);
    }, releaseIncidentPollIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseIncidentWorkspace(controller.signal)
      .then((workspace) => {
        setServerRecord(workspace.record);
        setCollaborators(workspace.collaborators);
        setStatus("ready");
        setBaselineRevision(
          (currentRevision) => currentRevision ?? workspace.record.revision,
        );
        setDraftSummary(
          (currentDraft) => currentDraft || workspace.record.summary,
        );
      })
      .catch((error: unknown) => {
        if (isReleaseIncidentAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the collaborative incident workspace.");
      });

    return () => {
      controller.abort();
    };
  }, [pollTick]);

  const hasConflict = useMemo(() => {
    if (!serverRecord || baselineRevision === null) {
      return false;
    }

    return (
      serverRecord.revision !== baselineRevision &&
      draftSummary.trim() !== serverRecord.summary.trim()
    );
  }, [baselineRevision, draftSummary, serverRecord]);

  const activeEditors = useMemo(() => {
    return collaborators.filter(
      (collaborator) => collaborator.status === "editing",
    );
  }, [collaborators]);

  const reloadFromServer = useCallback(() => {
    if (!serverRecord) {
      return;
    }

    setDraftSummary(serverRecord.summary);
    setBaselineRevision(serverRecord.revision);
    setSaveStatus("idle");
    setMessage("Reloaded the latest shared draft from the server.");
  }, [serverRecord]);

  const save = useCallback(() => {
    if (!serverRecord || baselineRevision === null) {
      return;
    }

    setSaveStatus("saving");
    setMessage(null);

    void saveReleaseIncidentDraft({
      incidentId: serverRecord.id,
      summary: draftSummary,
      expectedRevision: baselineRevision,
    })
      .then((savedResult) => {
        setServerRecord(savedResult.record);
        setCollaborators(savedResult.collaborators);
        setBaselineRevision(savedResult.record.revision);
        setDraftSummary(savedResult.record.summary);
        setSaveStatus("saved");
        setMessage(
          `Saved shared draft revision ${savedResult.record.revision}.`,
        );
      })
      .catch((error: unknown) => {
        setSaveStatus("error");
        if (isReleaseIncidentConflictError(error) && error.latestRecord) {
          setServerRecord(error.latestRecord);
          setCollaborators(error.latestCollaborators ?? []);
          setMessage(error.message);
          return;
        }

        setMessage(
          isReleaseIncidentConflictError(error)
            ? error.message
            : "Could not save the collaborative incident draft.",
        );
      });
  }, [baselineRevision, draftSummary, serverRecord]);

  const simulateTeammateEdit = useCallback(() => {
    simulateTeammateIncidentEdit();
    setPollTick((currentTick) => currentTick + 1);
  }, []);

  return {
    activeEditors,
    collaborators,
    draftSummary,
    hasConflict,
    message,
    reloadFromServer,
    save,
    saveStatus,
    serverRecord,
    simulateTeammateEdit,
    status,
    updateDraftSummary: setDraftSummary,
  };
}
