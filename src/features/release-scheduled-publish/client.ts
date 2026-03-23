import type {
  ApproveReleaseScheduleInput,
  ReleaseScheduleApproval,
  ReleaseScheduleRecord,
  ReleaseScheduleWorkspaceResponse,
  ScheduleReleasePublishInput,
} from "./types";

const initialRecord = {
  id: "schedule-1",
  title: "Release scheduled publish and rollback window",
  headline:
    "Mitigation is confirmed and the customer update is ready to publish.",
  stage: "draft",
  countdownSeconds: null,
  rollbackWindowSeconds: null,
  updatedAt: "2026-03-23 20:45 UTC",
  updatedBy: "Avery - Incident commander",
} as const satisfies ReleaseScheduleRecord;

const initialApprovals = [
  {
    id: "approval-1",
    name: "Mina",
    role: "Support liaison",
    status: "approved",
  },
  {
    id: "approval-2",
    name: "Priya",
    role: "Legal reviewer",
    status: "pending",
  },
] as const satisfies readonly ReleaseScheduleApproval[];

export const releaseScheduledFetchDelayMs = 180;
export const releaseScheduledMutationDelayMs = 220;
export const releaseScheduledTickMs = 1000;

let record: ReleaseScheduleRecord = { ...initialRecord };
let approvals: ReleaseScheduleApproval[] = initialApprovals.map((approval) => ({
  ...approval,
}));

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

function cloneWorkspace(): ReleaseScheduleWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    record: { ...record },
    approvals: approvals.map((approval) => ({ ...approval })),
  };
}

function approvalsReady() {
  return approvals.every((approval) => approval.status === "approved");
}

export function resetReleaseScheduledPublishMockState() {
  record = { ...initialRecord };
  approvals = initialApprovals.map((approval) => ({ ...approval }));
}

export function isReleaseScheduledAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function advanceReleaseScheduledClock() {
  if (record.stage === "scheduled" && record.countdownSeconds !== null) {
    const nextCountdown = Math.max(0, record.countdownSeconds - 1);
    record = {
      ...record,
      countdownSeconds: nextCountdown,
      updatedAt: formatTimestamp(new Date()),
    };

    if (nextCountdown === 0) {
      record = {
        ...record,
        stage: "published",
        countdownSeconds: null,
        rollbackWindowSeconds: 5,
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Taylor - On-call engineer",
      };
    }
    return;
  }

  if (record.stage === "published" && record.rollbackWindowSeconds !== null) {
    const nextWindow = Math.max(0, record.rollbackWindowSeconds - 1);
    record = {
      ...record,
      rollbackWindowSeconds: nextWindow,
      updatedAt: formatTimestamp(new Date()),
    };

    if (nextWindow === 0) {
      record = {
        ...record,
        rollbackWindowSeconds: null,
      };
    }
  }
}

export function fetchReleaseScheduledWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseScheduleWorkspaceResponse> {
  return new Promise<ReleaseScheduleWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve(cloneWorkspace());
    }, releaseScheduledFetchDelayMs);

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

export function approveReleaseScheduled(
  input: ApproveReleaseScheduleInput,
  signal?: AbortSignal,
): Promise<ReleaseScheduleWorkspaceResponse> {
  return new Promise<ReleaseScheduleWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      approvals = approvals.map((approval) =>
        approval.id === input.approvalId
          ? { ...approval, status: "approved" }
          : approval,
      );
      resolve(cloneWorkspace());
    }, releaseScheduledMutationDelayMs);

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

export function scheduleReleasePublish(
  input: ScheduleReleasePublishInput,
  signal?: AbortSignal,
): Promise<ReleaseScheduleWorkspaceResponse> {
  return new Promise<ReleaseScheduleWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      if (!approvalsReady()) {
        reject(
          new Error("Approvals must be complete before scheduling publish."),
        );
        return;
      }

      record = {
        ...record,
        stage: "scheduled",
        countdownSeconds: 3,
        rollbackWindowSeconds: null,
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Taylor - On-call engineer",
      };
      resolve(cloneWorkspace());
    }, releaseScheduledMutationDelayMs);

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

export function rollbackPublishedRelease(
  signal?: AbortSignal,
): Promise<ReleaseScheduleWorkspaceResponse> {
  return new Promise<ReleaseScheduleWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      if (
        record.stage !== "published" ||
        record.rollbackWindowSeconds === null ||
        record.rollbackWindowSeconds === 0
      ) {
        reject(new Error("Rollback is not currently available."));
        return;
      }

      record = {
        ...record,
        stage: "rolled-back",
        rollbackWindowSeconds: null,
        countdownSeconds: null,
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Taylor - On-call engineer",
      };
      resolve(cloneWorkspace());
    }, releaseScheduledMutationDelayMs);

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
