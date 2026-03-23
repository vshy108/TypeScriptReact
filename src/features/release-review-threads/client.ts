import type {
  PublishReleaseReviewInput,
  ReleaseReviewerApproval,
  ReleaseReviewRecord,
  ReleaseReviewThread,
  ReleaseReviewWorkspaceResponse,
  SaveReleaseReviewDraftInput,
} from "./types";

const initialRecord = {
  id: "review-1",
  title: "Release messaging review threads",
  audience: "Affected enterprise tenants",
  summary:
    "We paused the rollout, confirmed mitigation, and are preparing the next customer update with support and legal review before publication.",
  revision: 1,
  stage: "draft",
  updatedAt: "2026-03-23 18:30 UTC",
  updatedBy: "Avery - Incident commander",
} as const satisfies ReleaseReviewRecord;

const initialThreads = [] as const satisfies readonly ReleaseReviewThread[];

const initialApprovals = [
  {
    id: "reviewer-1",
    name: "Mina",
    role: "Support liaison",
    status: "approved",
  },
  {
    id: "reviewer-2",
    name: "Priya",
    role: "Legal reviewer",
    status: "pending",
  },
] as const satisfies readonly ReleaseReviewerApproval[];

export const releaseReviewFetchDelayMs = 180;
export const releaseReviewMutationDelayMs = 220;

let serverRecord: ReleaseReviewRecord = { ...initialRecord };
let serverThreads: ReleaseReviewThread[] = initialThreads.map((thread) => ({
  ...thread,
}));
let serverApprovals: ReleaseReviewerApproval[] = initialApprovals.map(
  (approval) => ({ ...approval }),
);

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

function cloneWorkspace(): ReleaseReviewWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    record: { ...serverRecord },
    threads: serverThreads.map((thread) => ({ ...thread })),
    approvals: serverApprovals.map((approval) => ({ ...approval })),
  };
}

function hasOpenThreads() {
  return serverThreads.some((thread) => thread.status === "open");
}

function approvalsReady() {
  return serverApprovals.every((approval) => approval.status === "approved");
}

export function resetReleaseReviewThreadsMockState() {
  serverRecord = { ...initialRecord };
  serverThreads = initialThreads.map((thread) => ({ ...thread }));
  serverApprovals = initialApprovals.map((approval) => ({ ...approval }));
}

export function isReleaseReviewAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function fetchReleaseReviewWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseReviewWorkspaceResponse> {
  return new Promise<ReleaseReviewWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve(cloneWorkspace());
    }, releaseReviewFetchDelayMs);

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

export function saveReleaseReviewDraft(
  input: SaveReleaseReviewDraftInput,
  signal?: AbortSignal,
): Promise<ReleaseReviewWorkspaceResponse> {
  return new Promise<ReleaseReviewWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      serverRecord = {
        ...serverRecord,
        revision: serverRecord.revision + 1,
        summary: input.summary.trim(),
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Taylor - On-call engineer",
      };

      resolve(cloneWorkspace());
    }, releaseReviewMutationDelayMs);

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

export function simulateReviewerFeedback(
  signal?: AbortSignal,
): Promise<ReleaseReviewWorkspaceResponse> {
  return new Promise<ReleaseReviewWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (!serverThreads.some((thread) => thread.id === "thread-1")) {
        serverThreads = [
          {
            id: "thread-1",
            field: "summary",
            author: "Priya",
            role: "Legal reviewer",
            comment:
              "Please explicitly state that mitigation is confirmed before this customer update goes out.",
            status: "open",
          },
          ...serverThreads,
        ];
      }

      serverApprovals = serverApprovals.map((approval) =>
        approval.role === "Legal reviewer"
          ? { ...approval, status: "changes-requested" }
          : approval,
      );

      resolve(cloneWorkspace());
    }, releaseReviewMutationDelayMs);

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

export function resolveReleaseReviewThread(
  threadId: ReleaseReviewThread["id"],
  signal?: AbortSignal,
): Promise<ReleaseReviewWorkspaceResponse> {
  return new Promise<ReleaseReviewWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      serverThreads = serverThreads.map((thread) =>
        thread.id === threadId ? { ...thread, status: "resolved" } : thread,
      );

      resolve(cloneWorkspace());
    }, releaseReviewMutationDelayMs);

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

export function approveReleaseReviewer(
  reviewerId: ReleaseReviewerApproval["id"],
  signal?: AbortSignal,
): Promise<ReleaseReviewWorkspaceResponse> {
  return new Promise<ReleaseReviewWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      serverApprovals = serverApprovals.map((approval) =>
        approval.id === reviewerId
          ? { ...approval, status: "approved" }
          : approval,
      );

      resolve(cloneWorkspace());
    }, releaseReviewMutationDelayMs);

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

export function publishReleaseReviewCandidate(
  input: PublishReleaseReviewInput,
  signal?: AbortSignal,
): Promise<ReleaseReviewWorkspaceResponse> {
  return new Promise<ReleaseReviewWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (hasOpenThreads() || !approvalsReady()) {
        reject(
          new Error(
            "Cannot publish while threads are open or approvals are incomplete.",
          ),
        );
        return;
      }

      serverRecord = {
        ...serverRecord,
        revision: serverRecord.revision + 1,
        stage: "published",
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Taylor - On-call engineer",
      };

      resolve(cloneWorkspace());
    }, releaseReviewMutationDelayMs);

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
