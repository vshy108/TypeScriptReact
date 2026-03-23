import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchReleaseRolloutWorkspace,
  isReleaseRolloutAbortError,
  releaseRolloutPollIntervalMs,
  requestRolloutPromotion,
} from "./client";
import type { ReleaseSegmentRecord } from "./types";

interface OptimisticPromotion {
  readonly targetPercent: number;
  readonly acceptedRevision: number | null;
}

export function useReleaseRolloutReconciliation() {
  const [serverSegments, setServerSegments] = useState<
    readonly ReleaseSegmentRecord[]
  >([]);
  const [optimisticPromotions, setOptimisticPromotions] = useState<
    Record<string, OptimisticPromotion>
  >({});
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [pollTick, setPollTick] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setPollTick((currentTick) => currentTick + 1);
    }, releaseRolloutPollIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseRolloutWorkspace(controller.signal)
      .then((workspace) => {
        setServerSegments(workspace.segments);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseRolloutAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not refresh the rollout workspace.");
      });

    return () => {
      controller.abort();
    };
  }, [pollTick]);

  useEffect(() => {
    if (serverSegments.length === 0) {
      return;
    }

    setOptimisticPromotions((currentPromotions) => {
      let nextPromotions = currentPromotions;
      let reconciliationMessage: string | null = null;

      serverSegments.forEach((segment) => {
        const optimisticPromotion = currentPromotions[segment.id];
        if (
          !optimisticPromotion ||
          optimisticPromotion.acceptedRevision === null
        ) {
          return;
        }

        if (segment.revision > optimisticPromotion.acceptedRevision) {
          if (nextPromotions === currentPromotions) {
            nextPromotions = { ...currentPromotions };
          }

          delete nextPromotions[segment.id];
          reconciliationMessage = `Server reconciled ${segment.audience} to ${segment.actualRolloutPercent}% after the optimistic promotion.`;
        }
      });

      if (reconciliationMessage) {
        setMessage(reconciliationMessage);
      }

      return nextPromotions;
    });
  }, [serverSegments]);

  const displayedSegments = useMemo(() => {
    return serverSegments.map((segment) => {
      const optimisticPromotion = optimisticPromotions[segment.id];
      if (!optimisticPromotion) {
        return {
          ...segment,
          displayPercent: segment.actualRolloutPercent,
          displayStatus: segment.status,
        };
      }

      return {
        ...segment,
        displayPercent: optimisticPromotion.targetPercent,
        displayStatus: "optimistic" as const,
      };
    });
  }, [optimisticPromotions, serverSegments]);

  const promoteToFullRollout = useCallback((segment: ReleaseSegmentRecord) => {
    setOptimisticPromotions((currentPromotions) => ({
      ...currentPromotions,
      [segment.id]: {
        targetPercent: 100,
        acceptedRevision: null,
      },
    }));
    setMessage(
      `Optimistically promoted ${segment.audience} to 100%. Waiting for the next server refresh.`,
    );

    void requestRolloutPromotion({
      segmentId: segment.id,
      targetPercent: 100,
      expectedRevision: segment.revision,
    }).then((result) => {
      setServerSegments((currentSegments) =>
        currentSegments.map((currentSegment) =>
          currentSegment.id === result.segment.id
            ? result.segment
            : currentSegment,
        ),
      );
      setOptimisticPromotions((currentPromotions) => ({
        ...currentPromotions,
        [segment.id]: {
          targetPercent: 100,
          acceptedRevision: result.segment.revision,
        },
      }));
      setMessage(
        `Server accepted the promotion request for ${segment.audience}. Background refresh will reconcile the final rollout.`,
      );
    });
  }, []);

  return {
    displayedSegments,
    message,
    promoteToFullRollout,
    status,
  };
}
