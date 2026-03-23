import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchReleaseApprovalWorkspace,
  isReleaseApprovalAbortError,
  isReleaseApprovalMutationError,
  submitReleaseApprovalDecision,
} from "./client";
import type {
  ApprovalDecision,
  ReleaseApprovalDraft,
  ReleaseApprovalId,
  ReleaseApprovalOption,
  ReleaseApprovalWorkspaceResponse,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";
type SubmitStatus = "idle" | "saving" | "saved" | "error";

function buildDraft(
  decision: ApprovalDecision,
  note: string,
  rolloutPercent: number,
): ReleaseApprovalDraft {
  return {
    decision,
    note,
    rolloutPercent,
  };
}

export function useReleaseApprovalWorkflow() {
  const [workspace, setWorkspace] =
    useState<ReleaseApprovalWorkspaceResponse | null>(null);
  const [selectedReleaseId, setSelectedReleaseId] =
    useState<ReleaseApprovalId | null>(null);
  const [draft, setDraft] = useState<ReleaseApprovalDraft>(() =>
    buildDraft("approve", "", 0),
  );
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setErrorMessage(null);

    void fetchReleaseApprovalWorkspace(controller.signal)
      .then((nextWorkspace) => {
        setWorkspace(nextWorkspace);
        setSelectedReleaseId(
          (currentId) => currentId ?? nextWorkspace.releases[0]?.id ?? null,
        );
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseApprovalAbortError(error)) {
          return;
        }

        setStatus("error");
        setErrorMessage("Could not load the release approval workspace.");
      });

    return () => {
      controller.abort();
    };
  }, []);

  const selectedRelease = useMemo(() => {
    if (!workspace) {
      return null;
    }

    return (
      workspace.releases.find((release) => release.id === selectedReleaseId) ??
      workspace.releases[0] ??
      null
    );
  }, [selectedReleaseId, workspace]);

  useEffect(() => {
    if (!selectedRelease) {
      return;
    }

    setDraft(
      buildDraft(
        selectedRelease.currentDecision,
        selectedRelease.history[0]?.note ?? "",
        selectedRelease.rolloutPercent,
      ),
    );
    setSubmitStatus("idle");
    setSubmitMessage(null);
    setErrorMessage(null);
  }, [selectedRelease?.id]);

  const releaseOptions = useMemo<readonly ReleaseApprovalOption[]>(() => {
    return (
      workspace?.releases.map(({ id, name, owner, stage }) => ({
        id,
        name,
        owner,
        stage,
      })) ?? []
    );
  }, [workspace]);

  const isDirty = useMemo(() => {
    if (!selectedRelease) {
      return false;
    }

    return (
      draft.decision !== selectedRelease.currentDecision ||
      draft.rolloutPercent !== selectedRelease.rolloutPercent ||
      draft.note.trim() !== (selectedRelease.history[0]?.note ?? "").trim()
    );
  }, [draft, selectedRelease]);

  const selectRelease = useCallback((releaseId: ReleaseApprovalId) => {
    setSelectedReleaseId(releaseId);
  }, []);

  const updateDecision = useCallback((decision: ApprovalDecision) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      decision,
    }));
    setSubmitStatus("idle");
    setSubmitMessage(null);
    setErrorMessage(null);
  }, []);

  const updateNote = useCallback((note: string) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      note,
    }));
    setSubmitStatus("idle");
    setSubmitMessage(null);
    setErrorMessage(null);
  }, []);

  const updateRolloutPercent = useCallback((rolloutPercent: number) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      rolloutPercent,
    }));
    setSubmitStatus("idle");
    setSubmitMessage(null);
    setErrorMessage(null);
  }, []);

  const resetDraft = useCallback(() => {
    if (!selectedRelease) {
      return;
    }

    setDraft(
      buildDraft(
        selectedRelease.currentDecision,
        selectedRelease.history[0]?.note ?? "",
        selectedRelease.rolloutPercent,
      ),
    );
    setSubmitStatus("idle");
    setSubmitMessage(null);
    setErrorMessage(null);
  }, [selectedRelease]);

  const submit = useCallback(() => {
    if (!selectedRelease) {
      return;
    }

    setSubmitStatus("saving");
    setSubmitMessage(null);
    setErrorMessage(null);

    void submitReleaseApprovalDecision({
      releaseId: selectedRelease.id,
      decision: draft.decision,
      note: draft.note,
      rolloutPercent: draft.rolloutPercent,
    })
      .then((savedResult) => {
        setWorkspace((currentWorkspace) => {
          if (!currentWorkspace) {
            return currentWorkspace;
          }

          return {
            revision: savedResult.revision,
            loadedAt: savedResult.savedAt,
            releases: currentWorkspace.releases.map((release) =>
              release.id === savedResult.release.id
                ? savedResult.release
                : release,
            ),
          };
        });
        setDraft(
          buildDraft(
            savedResult.release.currentDecision,
            savedResult.release.history[0]?.note ?? "",
            savedResult.release.rolloutPercent,
          ),
        );
        setSubmitStatus("saved");
        setSubmitMessage(`Saved decision for ${savedResult.release.name}.`);
      })
      .catch((error: unknown) => {
        if (isReleaseApprovalAbortError(error)) {
          return;
        }

        setSubmitStatus("error");
        setErrorMessage(
          isReleaseApprovalMutationError(error)
            ? error.message
            : "Could not save the release approval decision.",
        );
      });
  }, [draft, selectedRelease]);

  return {
    draft,
    errorMessage,
    isDirty,
    releaseOptions,
    resetDraft,
    revision: workspace?.revision ?? null,
    selectedRelease,
    selectRelease,
    status,
    submit,
    submitMessage,
    submitStatus,
    updateDecision,
    updateNote,
    updateRolloutPercent,
  };
}
