import type {
  PromoteReleaseBranchInput,
  ReleaseBranchRecord,
  ReleaseBranchWorkspaceResponse,
} from "./types";

const initialBranches = [
  {
    id: "branch-1",
    name: "Primary customer update",
    kind: "primary",
    headline: "Mitigation is confirmed and the rollout remains paused.",
    summary:
      "We confirmed mitigation, kept the rollout paused, and are preparing the next customer update while support coordinates outbound guidance.",
    revision: 1,
    updatedAt: "2026-03-23 20:10 UTC",
    updatedBy: "Avery - Incident commander",
  },
  {
    id: "branch-2",
    name: "Support-forward branch",
    kind: "alternate",
    headline:
      "Mitigation is confirmed and support guidance is ready for customers.",
    summary:
      "We confirmed mitigation, kept the rollout paused, and drafted a support-forward update that adds outbound guidance for affected customers.",
    revision: 1,
    updatedAt: "2026-03-23 20:16 UTC",
    updatedBy: "Jordan - Communications lead",
  },
] as const satisfies readonly ReleaseBranchRecord[];

export const releaseBranchFetchDelayMs = 180;
export const releaseBranchMutationDelayMs = 220;

let branches: ReleaseBranchRecord[] = initialBranches.map((branch) => ({
  ...branch,
}));
let activeBranchId: ReleaseBranchRecord["id"] = "branch-1";

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

function cloneWorkspace(): ReleaseBranchWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    branches: branches.map((branch) => ({ ...branch })),
    activeBranchId,
  };
}

export function resetReleaseBranchCompareMockState() {
  branches = initialBranches.map((branch) => ({ ...branch }));
  activeBranchId = "branch-1";
}

export function isReleaseBranchAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function fetchReleaseBranchWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseBranchWorkspaceResponse> {
  return new Promise<ReleaseBranchWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve(cloneWorkspace());
    }, releaseBranchFetchDelayMs);

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

export function selectReleaseBranch(
  branchId: ReleaseBranchRecord["id"],
  signal?: AbortSignal,
): Promise<ReleaseBranchWorkspaceResponse> {
  return new Promise<ReleaseBranchWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      activeBranchId = branchId;
      resolve(cloneWorkspace());
    }, releaseBranchMutationDelayMs);

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

export function promoteReleaseBranch(
  input: PromoteReleaseBranchInput,
  signal?: AbortSignal,
): Promise<ReleaseBranchWorkspaceResponse> {
  return new Promise<ReleaseBranchWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      const selectedBranch = branches.find(
        (branch) => branch.id === input.branchId,
      );
      if (!selectedBranch) {
        reject(new Error("Selected branch was not found."));
        return;
      }

      branches = branches.map((branch) =>
        branch.id === input.branchId
          ? {
              ...branch,
              kind: "primary",
              revision: branch.revision + 1,
              updatedAt: formatTimestamp(new Date()),
              updatedBy: "Taylor - On-call engineer",
            }
          : branch.kind === "primary"
            ? { ...branch, kind: "alternate" }
            : branch,
      );
      activeBranchId = input.branchId;

      resolve(cloneWorkspace());
    }, releaseBranchMutationDelayMs);

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
