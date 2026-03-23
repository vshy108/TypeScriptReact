import type {
  ReleaseReadinessResponse,
  ReleaseReadinessSnapshot,
} from "./types";

const baseSnapshots = [
  {
    id: "release-1",
    name: "Navigation recovery rollout",
    owner: "Frontend platform",
    channel: "beta",
    stage: "rolling-out",
    rolloutPercent: 55,
    scheduledAt: "2026-03-24 09:30 UTC",
    approvals: [
      {
        id: "approval-1",
        label: "QA regression sign-off",
        owner: "Quality engineering",
        status: "approved",
        note: "Smoke coverage passed on beta web and iOS.",
      },
      {
        id: "approval-2",
        label: "Operational readiness review",
        owner: "SRE primary",
        status: "pending",
        note: "Waiting on the final dashboard alert thresholds.",
      },
    ],
    risks: [
      {
        id: "risk-1",
        summary:
          "Router cache invalidation still has one flaky edge case on back navigation.",
        severity: "medium",
        mitigation:
          "Keep rollout under 75% until the canary trace set stays clean for 24 hours.",
        open: true,
      },
      {
        id: "risk-2",
        summary: "Copy review for the recovery toast is complete.",
        severity: "low",
        mitigation: "No further action required.",
        open: false,
      },
    ],
    buildHealth: {
      passed: 46,
      total: 48,
    },
    notes: [
      "This release is the main interview example: typed client + hook + component + test seam.",
      "A realistic discussion point is whether approvals belong in the same resource or a separate endpoint.",
    ],
  },
  {
    id: "release-2",
    name: "Accessibility checklist pass",
    owner: "Design systems",
    channel: "canary",
    stage: "approval",
    rolloutPercent: 15,
    scheduledAt: "2026-03-24 14:00 UTC",
    approvals: [
      {
        id: "approval-3",
        label: "Accessibility QA",
        owner: "Inclusive design",
        status: "approved",
        note: "Dialog focus loop and semantic labels verified.",
      },
      {
        id: "approval-4",
        label: "Support readiness",
        owner: "Customer success",
        status: "pending",
        note: "Awaiting updated troubleshooting notes.",
      },
    ],
    risks: [
      {
        id: "risk-3",
        summary:
          "VoiceOver regression testing is not yet complete on Safari 18.",
        severity: "high",
        mitigation:
          "Keep this release in canary until Safari assistive-tech verification finishes.",
        open: true,
      },
    ],
    buildHealth: {
      passed: 31,
      total: 31,
    },
    notes: [
      "This release demonstrates how product risk can stay open even when automated checks are green.",
    ],
  },
  {
    id: "release-3",
    name: "Offline sync stabilization",
    owner: "Client infrastructure",
    channel: "stable",
    stage: "paused",
    rolloutPercent: 100,
    scheduledAt: "2026-03-25 08:00 UTC",
    approvals: [
      {
        id: "approval-5",
        label: "Incident review",
        owner: "Incident commander",
        status: "blocked",
        note: "Rollback plan must be updated after last week's timeout spike.",
      },
    ],
    risks: [
      {
        id: "risk-4",
        summary:
          "Sync backlog pressure rose during the last brownout rehearsal.",
        severity: "high",
        mitigation:
          "Pause changes until the retry queue cap is tuned and revalidated.",
        open: true,
      },
      {
        id: "risk-5",
        summary: "Release notes are ready for support handoff.",
        severity: "low",
        mitigation: "No further action required.",
        open: false,
      },
    ],
    buildHealth: {
      passed: 27,
      total: 30,
    },
    notes: [
      "A paused release is useful in interviews because it forces you to explain workflow state, not just loading state.",
    ],
  },
] as const satisfies readonly ReleaseReadinessSnapshot[];

export const releaseReadinessDelayMs = 420;

let nextRevision = 1;

export function resetReleaseReadinessMockState() {
  nextRevision = 1;
}

function formatLoadedAt(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function createAbortError() {
  return new DOMException("The operation was aborted.", "AbortError");
}

export function isReleaseReadinessAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

function buildResponseForRevision(revision: number): ReleaseReadinessResponse {
  return {
    revision,
    loadedAt: formatLoadedAt(new Date()),
    releases: baseSnapshots.map((release) => {
      if (release.id !== "release-1") {
        return release;
      }

      const nextRolloutPercent = Math.min(
        100,
        release.rolloutPercent + (revision - 1) * 5,
      );
      const nextOperationalNote =
        revision > 1
          ? "Operational readiness review updated after the latest dashboard threshold sync."
          : release.approvals[1].note;

      return {
        ...release,
        rolloutPercent: nextRolloutPercent,
        approvals: release.approvals.map((approval) =>
          approval.id === "approval-2"
            ? {
                ...approval,
                note: nextOperationalNote,
              }
            : approval,
        ),
      };
    }),
  };
}

export function fetchReleaseReadiness(
  signal?: AbortSignal,
): Promise<ReleaseReadinessResponse> {
  const revision = nextRevision++;

  return new Promise<ReleaseReadinessResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve(buildResponseForRevision(revision));
    }, releaseReadinessDelayMs);

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
