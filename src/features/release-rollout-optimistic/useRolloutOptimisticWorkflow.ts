import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchRolloutWorkspace,
  isResolveBlockerError,
  isRolloutAbortError,
  resolveRolloutBlocker,
} from "./client";
import type { RolloutBlockerId, RolloutWorkspaceResponse } from "./types";

type RequestStatus = "loading" | "ready" | "error";

export function useRolloutOptimisticWorkflow() {
  const [workspace, setWorkspace] = useState<RolloutWorkspaceResponse | null>(
    null,
  );
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [resolutionNotes, setResolutionNotes] = useState<
    Record<RolloutBlockerId, string>
  >({} as Record<RolloutBlockerId, string>);
  const [optimisticResolvedIds, setOptimisticResolvedIds] = useState<
    readonly RolloutBlockerId[]
  >([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setErrorMessage(null);

    void fetchRolloutWorkspace(controller.signal)
      .then((nextWorkspace) => {
        setWorkspace(nextWorkspace);
        setStatus("ready");
        setResolutionNotes((currentNotes) => {
          const nextNotes = { ...currentNotes };
          for (const blocker of nextWorkspace.blockers) {
            nextNotes[blocker.id] =
              currentNotes[blocker.id] ?? blocker.resolutionNote ?? "";
          }
          return nextNotes;
        });
      })
      .catch((error: unknown) => {
        if (isRolloutAbortError(error)) {
          return;
        }

        setStatus("error");
        setErrorMessage("Could not load the rollout blocker workspace.");
      });

    return () => {
      controller.abort();
    };
  }, []);

  const visibleBlockers = useMemo(() => {
    return (
      workspace?.blockers.filter(
        (blocker) =>
          !blocker.resolved && !optimisticResolvedIds.includes(blocker.id),
      ) ?? []
    );
  }, [optimisticResolvedIds, workspace]);

  const resolvedCount = useMemo(() => {
    return (
      (workspace?.blockers.filter((blocker) => blocker.resolved).length ?? 0) +
      optimisticResolvedIds.length
    );
  }, [optimisticResolvedIds.length, workspace]);

  const updateResolutionNote = useCallback(
    (blockerId: RolloutBlockerId, resolutionNote: string) => {
      setResolutionNotes((currentNotes) => ({
        ...currentNotes,
        [blockerId]: resolutionNote,
      }));
      setErrorMessage(null);
      setSuccessMessage(null);
    },
    [],
  );

  const resolveOptimistically = useCallback(
    (blockerId: RolloutBlockerId) => {
      const resolutionNote = resolutionNotes[blockerId] ?? "";
      const blocker = workspace?.blockers.find(
        (entry) => entry.id === blockerId,
      );
      if (!blocker) {
        return;
      }

      setOptimisticResolvedIds((currentIds) => [...currentIds, blockerId]);
      setErrorMessage(null);
      setSuccessMessage(null);

      void resolveRolloutBlocker({ blockerId, resolutionNote })
        .then((savedResult) => {
          setWorkspace((currentWorkspace) => {
            if (!currentWorkspace) {
              return currentWorkspace;
            }

            return {
              revision: savedResult.revision,
              loadedAt: savedResult.savedAt,
              blockers: currentWorkspace.blockers.map((entry) =>
                entry.id === savedResult.blocker.id
                  ? savedResult.blocker
                  : entry,
              ),
            };
          });
          setOptimisticResolvedIds((currentIds) =>
            currentIds.filter((entryId) => entryId !== blockerId),
          );
          setSuccessMessage(`Resolved ${blocker.title}.`);
        })
        .catch((error: unknown) => {
          setOptimisticResolvedIds((currentIds) =>
            currentIds.filter((entryId) => entryId !== blockerId),
          );
          setErrorMessage(
            isResolveBlockerError(error)
              ? error.message
              : "Could not resolve the rollout blocker.",
          );
        });
    },
    [resolutionNotes, workspace],
  );

  return {
    errorMessage,
    resolvedCount,
    resolutionNotes,
    revision: workspace?.revision ?? null,
    status,
    successMessage,
    updateResolutionNote,
    visibleBlockers,
    resolveOptimistically,
  };
}
