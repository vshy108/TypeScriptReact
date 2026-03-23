import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchReleaseHandoffWorkspace,
  isReleaseHandoffAbortError,
  isReleaseHandoffConflictError,
  releaseHandoffPollIntervalMs,
  saveReleaseHandoff,
  simulateExternalHandoffUpdate,
} from "./client";
import type { ReleaseHandoffRecord } from "./types";

type RequestStatus = "loading" | "ready" | "error";
type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useReleaseHandoffConflict() {
  const [serverRecord, setServerRecord] = useState<ReleaseHandoffRecord | null>(
    null,
  );
  const [draftNote, setDraftNote] = useState("");
  const [baselineRevision, setBaselineRevision] = useState<number | null>(null);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [pollTick, setPollTick] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setPollTick((currentTick) => currentTick + 1);
    }, releaseHandoffPollIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseHandoffWorkspace(controller.signal)
      .then((workspace) => {
        setServerRecord(workspace.record);
        setStatus("ready");
        setBaselineRevision(
          (currentRevision) => currentRevision ?? workspace.record.revision,
        );
        setDraftNote(
          (currentDraft) => currentDraft || workspace.record.handoffNote,
        );
      })
      .catch((error: unknown) => {
        if (isReleaseHandoffAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the handoff workspace.");
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
      draftNote.trim() !== serverRecord.handoffNote.trim()
    );
  }, [baselineRevision, draftNote, serverRecord]);

  const reloadFromServer = useCallback(() => {
    if (!serverRecord) {
      return;
    }

    setDraftNote(serverRecord.handoffNote);
    setBaselineRevision(serverRecord.revision);
    setSaveStatus("idle");
    setMessage("Reloaded the latest server version into the draft.");
  }, [serverRecord]);

  const save = useCallback(() => {
    if (!serverRecord || baselineRevision === null) {
      return;
    }

    setSaveStatus("saving");
    setMessage(null);

    void saveReleaseHandoff({
      handoffId: serverRecord.id,
      handoffNote: draftNote,
      expectedRevision: baselineRevision,
    })
      .then((savedResult) => {
        setServerRecord(savedResult.record);
        setBaselineRevision(savedResult.record.revision);
        setDraftNote(savedResult.record.handoffNote);
        setSaveStatus("saved");
        setMessage(`Saved handoff revision ${savedResult.record.revision}.`);
      })
      .catch((error: unknown) => {
        setSaveStatus("error");
        if (isReleaseHandoffConflictError(error) && error.serverRecord) {
          setServerRecord(error.serverRecord);
          setMessage(error.message);
          return;
        }

        setMessage(
          isReleaseHandoffConflictError(error)
            ? error.message
            : "Could not save the handoff note.",
        );
      });
  }, [baselineRevision, draftNote, serverRecord]);

  const triggerExternalUpdate = useCallback(() => {
    simulateExternalHandoffUpdate();
    setPollTick((currentTick) => currentTick + 1);
  }, []);

  return {
    draftNote,
    hasConflict,
    message,
    reloadFromServer,
    save,
    saveStatus,
    serverRecord,
    status,
    triggerExternalUpdate,
    updateDraftNote: setDraftNote,
  };
}
