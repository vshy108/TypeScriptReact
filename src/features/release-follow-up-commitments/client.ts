import type {
  ApproveReleaseFollowUpCommitmentInput,
  InvalidateReleaseFollowUpEtaDriftsInput,
  PublishReleaseFollowUpInput,
  ReleaseFollowUpAuditEvent,
  ReleaseFollowUpAuditEventId,
  ReleaseFollowUpCommitment,
  ReleaseFollowUpCommitmentRun,
  ReleaseFollowUpEtaDrift,
  ReleaseFollowUpWorkspaceResponse,
  SignOffReleaseFollowUpInput,
  StartReleaseFollowUpInput,
} from "./types";

const initialRun = {
  id: "follow-up-run-1",
  title: "Post-incident follow-up commitments",
  summary:
    "Review follow-up commitments by owner, invalidate ETA claims that drifted during incident recovery, collect approver sign-off on the revised commitments, and only then publish the follow-up bundle.",
  stage: "draft",
  activeCommitmentId: null,
  publishBlockedReason:
    "Owner review, ETA drift invalidation, and approver sign-off must complete before the follow-up commitments can publish.",
  updatedAt: "2026-03-24 05:45 UTC",
  updatedBy: "Avery - Incident lead",
} as const satisfies ReleaseFollowUpCommitmentRun;

const initialCommitments = [
  {
    id: "follow-up-commitment-1",
    label: "Checkout remediation follow-up",
    owner: "Mina",
    audience: "Customer operations",
    status: "queued",
    note: "Customer operations reviews the checkout remediation promise first because it drives the most visible follow-up ETA.",
  },
  {
    id: "follow-up-commitment-2",
    label: "Support playbook revision",
    owner: "Jordan",
    audience: "Support leadership",
    status: "queued",
    note: "Support leadership validates the playbook revision once the public remediation commitment is clarified.",
  },
  {
    id: "follow-up-commitment-3",
    label: "Incident review publication",
    owner: "Priya",
    audience: "Executive stakeholders",
    status: "queued",
    note: "Executive follow-up goes last so its ETA reflects the final approved commitments rather than stale recovery assumptions.",
  },
] as const satisfies readonly ReleaseFollowUpCommitment[];

const initialEtaDrifts = [
  {
    id: "follow-up-eta-1",
    commitment: "Checkout remediation follow-up",
    baselineEta: "24 hours",
    revisedEta: "36 hours",
    reason:
      "Regional validation uncovered more remediation tasks than the original commitment assumed.",
    status: "current",
  },
  {
    id: "follow-up-eta-2",
    commitment: "Support playbook revision",
    baselineEta: "48 hours",
    revisedEta: "72 hours",
    reason:
      "Support macros need additional approval after the FAQ and messaging changes landed.",
    status: "current",
  },
  {
    id: "follow-up-eta-3",
    commitment: "Incident review publication",
    baselineEta: "3 business days",
    revisedEta: "5 business days",
    reason:
      "The executive review now depends on the corrected remediation evidence and updated support playbook.",
    status: "current",
  },
] as const satisfies readonly ReleaseFollowUpEtaDrift[];

const initialAuditEvents = [
  {
    id: "follow-up-audit-1",
    actor: "Avery",
    action: "initiated",
    detail:
      "Prepared the post-incident follow-up commitments with owner review lanes and ETA drift checks.",
    timestamp: "2026-03-24 05:40 UTC",
  },
] as const satisfies readonly ReleaseFollowUpAuditEvent[];

export const releaseFollowUpFetchDelayMs = 180;
export const releaseFollowUpMutationDelayMs = 220;

let run: ReleaseFollowUpCommitmentRun = { ...initialRun };
let commitments: ReleaseFollowUpCommitment[] = initialCommitments.map(
  (commitment) => ({ ...commitment }),
);
let etaDrifts: ReleaseFollowUpEtaDrift[] = initialEtaDrifts.map((item) => ({
  ...item,
}));
let auditEvents: ReleaseFollowUpAuditEvent[] = initialAuditEvents.map(
  (event) => ({ ...event }),
);
let nextAuditEventNumber = initialAuditEvents.length + 1;

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

function cloneWorkspace(): ReleaseFollowUpWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    run: { ...run },
    commitments: commitments.map((commitment) => ({ ...commitment })),
    etaDrifts: etaDrifts.map((item) => ({ ...item })),
    auditEvents: auditEvents.map((event) => ({ ...event })),
  };
}

function nextAuditEventId(): ReleaseFollowUpAuditEventId {
  const eventId =
    `follow-up-audit-${nextAuditEventNumber}` as ReleaseFollowUpAuditEventId;
  nextAuditEventNumber += 1;
  return eventId;
}

function appendAuditEvent(
  action: ReleaseFollowUpAuditEvent["action"],
  actor: string,
  detail: string,
) {
  auditEvents = [
    {
      id: nextAuditEventId(),
      actor,
      action,
      detail,
      timestamp: formatTimestamp(new Date()),
    },
    ...auditEvents,
  ];
}

function nextQueuedCommitment() {
  return (
    commitments.find((commitment) => commitment.status === "queued") ?? null
  );
}

function allEtaDriftsInvalidated() {
  return etaDrifts.every((item) => item.status === "invalidated");
}

function allEtaDriftsApproved() {
  return etaDrifts.every((item) => item.status === "approved");
}

export function resetReleaseFollowUpCommitmentsMockState() {
  run = { ...initialRun };
  commitments = initialCommitments.map((commitment) => ({ ...commitment }));
  etaDrifts = initialEtaDrifts.map((item) => ({ ...item }));
  auditEvents = initialAuditEvents.map((event) => ({ ...event }));
  nextAuditEventNumber = initialAuditEvents.length + 1;
}

export function isReleaseFollowUpAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function fetchReleaseFollowUpWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseFollowUpWorkspaceResponse> {
  return new Promise<ReleaseFollowUpWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve(cloneWorkspace());
    }, releaseFollowUpFetchDelayMs);

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

export function startReleaseFollowUp(
  input: StartReleaseFollowUpInput,
  signal?: AbortSignal,
): Promise<ReleaseFollowUpWorkspaceResponse> {
  return new Promise<ReleaseFollowUpWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (run.id !== input.runId || run.stage !== "draft") {
        reject(
          new Error("Follow-up commitments are no longer ready to start."),
        );
        return;
      }

      commitments = commitments.map((commitment, index) =>
        index === 0
          ? {
              ...commitment,
              status: "awaiting-review",
              note: "Awaiting owner review before the next follow-up commitment opens.",
            }
          : commitment,
      );

      run = {
        ...run,
        stage: "owner-review",
        activeCommitmentId: "follow-up-commitment-1",
        publishBlockedReason:
          "Each follow-up commitment must clear owner review before ETA drift can be invalidated.",
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Avery - Incident lead",
      };

      appendAuditEvent(
        "initiated",
        "Avery",
        "Started post-incident follow-up review with the checkout remediation commitment.",
      );
      resolve(cloneWorkspace());
    }, releaseFollowUpMutationDelayMs);

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

export function approveReleaseFollowUpCommitment(
  input: ApproveReleaseFollowUpCommitmentInput,
  signal?: AbortSignal,
): Promise<ReleaseFollowUpWorkspaceResponse> {
  return new Promise<ReleaseFollowUpWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      const commitment =
        commitments.find((item) => item.id === input.commitmentId) ?? null;

      if (!commitment || commitment.status !== "awaiting-review") {
        reject(new Error("Commitment approval is not available."));
        return;
      }

      commitments = commitments.map((item) =>
        item.id === input.commitmentId
          ? {
              ...item,
              status: "approved",
              note: `${item.owner} approved ${item.label}.`,
            }
          : item,
      );

      appendAuditEvent(
        "approved",
        commitment.owner,
        `${commitment.owner} approved ${commitment.label}.`,
      );

      const nextCommitment = nextQueuedCommitment();
      if (nextCommitment) {
        commitments = commitments.map((item) =>
          item.id === nextCommitment.id
            ? {
                ...item,
                status: "awaiting-review",
                note: `${item.label} is the next follow-up commitment awaiting review.`,
              }
            : item,
        );

        run = {
          ...run,
          stage: "owner-review",
          activeCommitmentId: nextCommitment.id,
          publishBlockedReason:
            "Finish owner review before ETA drift invalidation can begin.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: commitment.owner,
        };
        resolve(cloneWorkspace());
        return;
      }

      etaDrifts = etaDrifts.map((item) => ({
        ...item,
        status: "drifted",
      }));

      run = {
        ...run,
        stage: "eta-drift-review",
        activeCommitmentId: null,
        publishBlockedReason:
          "Invalidate drifted ETAs before approver sign-off can clear the follow-up commitments.",
        updatedAt: formatTimestamp(new Date()),
        updatedBy: commitment.owner,
      };
      resolve(cloneWorkspace());
    }, releaseFollowUpMutationDelayMs);

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

export function invalidateReleaseFollowUpEtaDrifts(
  input: InvalidateReleaseFollowUpEtaDriftsInput,
  signal?: AbortSignal,
): Promise<ReleaseFollowUpWorkspaceResponse> {
  return new Promise<ReleaseFollowUpWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (run.id !== input.runId || run.stage !== "eta-drift-review") {
        reject(new Error("ETA drift invalidation is not available."));
        return;
      }

      etaDrifts = etaDrifts.map((item) => ({
        ...item,
        status: "invalidated",
      }));

      run = {
        ...run,
        stage: "approver-signoff",
        publishBlockedReason:
          "Approver sign-off must confirm the revised ETAs before publish can proceed.",
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Avery - Incident lead",
      };

      appendAuditEvent(
        "invalidated",
        "Avery",
        "Invalidated the drifted follow-up ETAs so only revised commitment windows remain eligible for publish.",
      );

      resolve(cloneWorkspace());
    }, releaseFollowUpMutationDelayMs);

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

export function signOffReleaseFollowUp(
  input: SignOffReleaseFollowUpInput,
  signal?: AbortSignal,
): Promise<ReleaseFollowUpWorkspaceResponse> {
  return new Promise<ReleaseFollowUpWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (
        run.id !== input.runId ||
        run.stage !== "approver-signoff" ||
        !allEtaDriftsInvalidated()
      ) {
        reject(new Error("Approver sign-off is not available."));
        return;
      }

      etaDrifts = etaDrifts.map((item) => ({
        ...item,
        status: "approved",
      }));

      run = {
        ...run,
        stage: "ready-to-publish",
        publishBlockedReason: null,
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Priya - Approver",
      };

      appendAuditEvent(
        "signed-off",
        "Priya",
        "Approver sign-off recorded for the revised follow-up commitments and ETAs.",
      );

      resolve(cloneWorkspace());
    }, releaseFollowUpMutationDelayMs);

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

export function publishReleaseFollowUp(
  input: PublishReleaseFollowUpInput,
  signal?: AbortSignal,
): Promise<ReleaseFollowUpWorkspaceResponse> {
  return new Promise<ReleaseFollowUpWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (
        run.id !== input.runId ||
        run.stage !== "ready-to-publish" ||
        !allEtaDriftsApproved()
      ) {
        reject(new Error("Follow-up publish is not available."));
        return;
      }

      commitments = commitments.map((commitment) => ({
        ...commitment,
        status: "published",
        note: `${commitment.label} published with the revised approved ETA.`,
      }));

      run = {
        ...run,
        stage: "published",
        publishBlockedReason: null,
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Avery - Incident lead",
      };

      appendAuditEvent(
        "published",
        "Avery",
        "Published the post-incident follow-up commitments after ETA drift invalidation and approver sign-off.",
      );

      resolve(cloneWorkspace());
    }, releaseFollowUpMutationDelayMs);

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
