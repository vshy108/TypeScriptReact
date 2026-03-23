import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchLaunchChecklistWorkspace,
  isLaunchChecklistAbortError,
  isSaveLaunchStepError,
  saveLaunchChecklistStep,
} from "./client";
import type { LaunchChecklistWorkspaceResponse, LaunchStepId } from "./types";

type RequestStatus = "loading" | "ready" | "error";
type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useLaunchChecklistWorkflow() {
  const [workspace, setWorkspace] =
    useState<LaunchChecklistWorkspaceResponse | null>(null);
  const [activeStepId, setActiveStepId] =
    useState<LaunchStepId>("freeze-window");
  const [draftValues, setDraftValues] = useState<Record<LaunchStepId, string>>({
    "freeze-window": "",
    "announce-status": "",
    "confirm-launch": "",
  });
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetchLaunchChecklistWorkspace(controller.signal)
      .then((nextWorkspace) => {
        setWorkspace(nextWorkspace);
        setStatus("ready");
        setDraftValues({
          "freeze-window":
            nextWorkspace.launch.steps.find(
              (step) => step.id === "freeze-window",
            )?.savedValue ?? "",
          "announce-status":
            nextWorkspace.launch.steps.find(
              (step) => step.id === "announce-status",
            )?.savedValue ?? "",
          "confirm-launch":
            nextWorkspace.launch.steps.find(
              (step) => step.id === "confirm-launch",
            )?.savedValue ?? "",
        });
      })
      .catch((error: unknown) => {
        if (isLaunchChecklistAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the launch checklist workspace.");
      });

    return () => {
      controller.abort();
    };
  }, []);

  const steps = useMemo(() => workspace?.launch.steps ?? [], [workspace]);
  const activeStep = useMemo(
    () => steps.find((step) => step.id === activeStepId) ?? steps[0] ?? null,
    [activeStepId, steps],
  );

  const completedStepCount = useMemo(
    () => steps.filter((step) => step.completed).length,
    [steps],
  );

  const canOpenStep = useCallback(
    (stepId: LaunchStepId) => {
      if (stepId === "freeze-window") {
        return true;
      }

      if (stepId === "announce-status") {
        return (
          steps.find((step) => step.id === "freeze-window")?.completed ?? false
        );
      }

      return (
        (steps.find((step) => step.id === "freeze-window")?.completed ??
          false) &&
        (steps.find((step) => step.id === "announce-status")?.completed ??
          false)
      );
    },
    [steps],
  );

  const selectStep = useCallback(
    (stepId: LaunchStepId) => {
      if (!canOpenStep(stepId)) {
        return;
      }

      setActiveStepId(stepId);
      setSaveStatus("idle");
      setMessage(null);
    },
    [canOpenStep],
  );

  const updateDraft = useCallback((stepId: LaunchStepId, value: string) => {
    setDraftValues((currentValues) => ({
      ...currentValues,
      [stepId]: value,
    }));
    setSaveStatus("idle");
    setMessage(null);
  }, []);

  const saveStep = useCallback(() => {
    if (!workspace || !activeStep) {
      return;
    }

    setSaveStatus("saving");
    setMessage(null);

    void saveLaunchChecklistStep({
      launchId: workspace.launch.id,
      stepId: activeStep.id,
      value: draftValues[activeStep.id],
    })
      .then((savedResult) => {
        setWorkspace({
          revision: savedResult.revision,
          loadedAt: savedResult.savedAt,
          launch: savedResult.launch,
        });
        setDraftValues((currentValues) => ({
          ...currentValues,
          [activeStep.id]:
            savedResult.launch.steps.find((step) => step.id === activeStep.id)
              ?.savedValue ?? currentValues[activeStep.id],
        }));
        setSaveStatus("saved");
        setMessage(`Saved ${activeStep.title}.`);

        if (activeStep.id === "freeze-window") {
          setActiveStepId("announce-status");
        }

        if (activeStep.id === "announce-status") {
          setActiveStepId("confirm-launch");
        }
      })
      .catch((error: unknown) => {
        setSaveStatus("error");
        setMessage(
          isSaveLaunchStepError(error)
            ? error.message
            : "Could not save the launch checklist step.",
        );
      });
  }, [activeStep, draftValues, workspace]);

  return {
    activeStep,
    canOpenStep,
    completedStepCount,
    draftValues,
    message,
    revision: workspace?.revision ?? null,
    saveStatus,
    saveStep,
    selectStep,
    status,
    steps,
    updateDraft,
  };
}
