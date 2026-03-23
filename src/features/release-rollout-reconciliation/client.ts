import type {
  ReleaseRolloutWorkspaceResponse,
  ReleaseSegmentRecord,
  RequestRolloutPromotionInput,
  RequestRolloutPromotionSuccess,
} from "./types";

const initialSegments = [
  {
    id: "segment-1",
    audience: "Enterprise EU",
    requestedRolloutPercent: 68,
    actualRolloutPercent: 68,
    status: "steady",
    revision: 1,
    updatedAt: "2026-03-23 17:05 UTC",
  },
  {
    id: "segment-2",
    audience: "Free tier global",
    requestedRolloutPercent: 100,
    actualRolloutPercent: 100,
    status: "steady",
    revision: 1,
    updatedAt: "2026-03-23 16:52 UTC",
  },
] as const satisfies readonly ReleaseSegmentRecord[];

export const releaseRolloutFetchDelayMs = 180;
export const releaseRolloutSaveDelayMs = 240;
export const releaseRolloutPollIntervalMs = 650;
export const releaseRolloutReconcileDelayMs = 700;

let serverSegments: ReleaseSegmentRecord[] = initialSegments.map((segment) => ({
  ...segment,
}));
const pendingReconciliations = new Map<string, number>();

function formatTimestamp(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function createAbortError() {
  return new DOMException("The operation was aborted.", "AbortError");
}

function scheduleServerReconciliation(segmentId: ReleaseSegmentRecord["id"]) {
  const existingTimeoutId = pendingReconciliations.get(segmentId);
  if (existingTimeoutId !== undefined) {
    window.clearTimeout(existingTimeoutId);
  }

  const timeoutId = window.setTimeout(() => {
    serverSegments = serverSegments.map((segment) =>
      segment.id === segmentId
        ? {
            ...segment,
            actualRolloutPercent: 92,
            requestedRolloutPercent: 92,
            status: "steady",
            revision: segment.revision + 1,
            updatedAt: formatTimestamp(new Date()),
          }
        : segment,
    );
    pendingReconciliations.delete(segmentId);
  }, releaseRolloutReconcileDelayMs);

  pendingReconciliations.set(segmentId, timeoutId);
}

export function resetReleaseRolloutReconciliationMockState() {
  pendingReconciliations.forEach((timeoutId) => {
    window.clearTimeout(timeoutId);
  });
  pendingReconciliations.clear();
  serverSegments = initialSegments.map((segment) => ({ ...segment }));
}

export function fetchReleaseRolloutWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseRolloutWorkspaceResponse> {
  return new Promise<ReleaseRolloutWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve({
        refreshedAt: formatTimestamp(new Date()),
        segments: serverSegments.map((segment) => ({ ...segment })),
      });
    }, releaseRolloutFetchDelayMs);

    function handleAbort() {
      window.clearTimeout(timeoutId);
      signal?.removeEventListener("abort", handleAbort);
      reject(createAbortError());
    }

    if (signal?.aborted) {
      handleAbort();
      return;
    }

    signal?.addEventListener("abort", handleAbort, { once: true });
  });
}

export function requestRolloutPromotion(
  input: RequestRolloutPromotionInput,
  signal?: AbortSignal,
): Promise<RequestRolloutPromotionSuccess> {
  return new Promise<RequestRolloutPromotionSuccess>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      serverSegments = serverSegments.map((segment) => {
        if (segment.id !== input.segmentId) {
          return segment;
        }

        if (segment.revision !== input.expectedRevision) {
          return segment;
        }

        return {
          ...segment,
          requestedRolloutPercent: input.targetPercent,
          status: "reconciling",
          revision: segment.revision + 1,
          updatedAt: formatTimestamp(new Date()),
        };
      });

      const updatedSegment = serverSegments.find(
        (segment) => segment.id === input.segmentId,
      );
      if (!updatedSegment) {
        reject(new Error("Segment not found"));
        return;
      }

      scheduleServerReconciliation(input.segmentId);
      resolve({
        acceptedAt: updatedSegment.updatedAt,
        segment: { ...updatedSegment },
      });
    }, releaseRolloutSaveDelayMs);

    function handleAbort() {
      window.clearTimeout(timeoutId);
      signal?.removeEventListener("abort", handleAbort);
      reject(createAbortError());
    }

    if (signal?.aborted) {
      handleAbort();
      return;
    }

    signal?.addEventListener("abort", handleAbort, { once: true });
  });
}

export function isReleaseRolloutAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}
