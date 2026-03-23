import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchReleaseReadiness, isReleaseReadinessAbortError } from "./client";
import type {
  ReleaseOption,
  ReleaseReadinessId,
  ReleaseReadinessResponse,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";

export function useReleaseReadiness() {
  const [response, setResponse] = useState<ReleaseReadinessResponse | null>(
    null,
  );
  const [selectedReleaseId, setSelectedReleaseId] =
    useState<ReleaseReadinessId | null>(null);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    if (!hasLoadedRef.current) {
      setStatus("loading");
    }

    setErrorMessage(null);

    void fetchReleaseReadiness(controller.signal)
      .then((nextResponse) => {
        hasLoadedRef.current = true;
        setResponse(nextResponse);
        setSelectedReleaseId(
          (currentId) => currentId ?? nextResponse.releases[0]?.id ?? null,
        );
        setStatus("ready");
        setIsRefreshing(false);
      })
      .catch((error: unknown) => {
        if (isReleaseReadinessAbortError(error)) {
          return;
        }

        setStatus("error");
        setIsRefreshing(false);
        setErrorMessage("Could not load the release readiness snapshot.");
      });

    return () => {
      controller.abort();
    };
  }, [requestVersion]);

  const releaseOptions = useMemo<readonly ReleaseOption[]>(() => {
    return (
      response?.releases.map(({ id, name, channel, stage }) => ({
        id,
        name,
        channel,
        stage,
      })) ?? []
    );
  }, [response]);

  const selectedRelease = useMemo(() => {
    if (!response) {
      return null;
    }

    return (
      response.releases.find((release) => release.id === selectedReleaseId) ??
      response.releases[0] ??
      null
    );
  }, [response, selectedReleaseId]);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    setRequestVersion((currentVersion) => currentVersion + 1);
  }, []);

  const selectRelease = useCallback((releaseId: ReleaseReadinessId) => {
    setSelectedReleaseId(releaseId);
  }, []);

  return {
    errorMessage,
    isRefreshing,
    lastLoadedAt: response?.loadedAt ?? null,
    refresh,
    releaseOptions,
    revision: response?.revision ?? null,
    selectedRelease,
    selectRelease,
    status,
  };
}
