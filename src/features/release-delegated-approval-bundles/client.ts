import type {
  ApproveReleaseDelegatedBundleInput,
  PublishReleaseDelegatedApprovalInput,
  ReleaseDelegatedApprovalAuditEvent,
  ReleaseDelegatedApprovalAuditEventId,
  ReleaseDelegatedApprovalBundle,
  ReleaseDelegatedApprovalEvidence,
  ReleaseDelegatedApprovalRun,
  ReleaseDelegatedApprovalWorkspaceResponse,
  ReplayReleaseDelegatedEvidenceInput,
  StartReleaseDelegatedApprovalInput,
} from "./types";

const initialRun = {
  id: "delegated-approval-run-1",
  title: "Delegated approval bundles with expiry windows",
  summary:
    "Collect approval bundles from primary owners, fall back to delegates when the approval window expires, replay the audit evidence, and only then allow publish.",
  stage: "draft",
  activeBundleId: null,
  publishBlockedReason:
    "Approval bundles and audit evidence must be complete before publish.",
  updatedAt: "2026-03-24 02:10 UTC",
  updatedBy: "Avery - Release coordinator",
} as const satisfies ReleaseDelegatedApprovalRun;

const initialBundles = [
  {
    id: "delegated-bundle-1",
    label: "Customer-facing approval bundle",
    primaryApprover: "Priya",
    delegateApprover: "Mina",
    currentApprover: "Priya",
    expiresInSeconds: null,
    status: "queued",
    note: "Primary communications approver owns the first approval window for the customer-facing bundle.",
  },
  {
    id: "delegated-bundle-2",
    label: "Executive escalation approval bundle",
    primaryApprover: "Taylor",
    delegateApprover: "Jordan",
    currentApprover: "Taylor",
    expiresInSeconds: null,
    status: "queued",
    note: "Executive approval bundle stays queued until the customer-facing approval is complete.",
  },
] as const satisfies readonly ReleaseDelegatedApprovalBundle[];

const initialEvidence = [
  {
    id: "delegated-evidence-1",
    title: "Escalation reroute summary",
    status: "pending-replay",
    note: "Replay the rerouted acknowledgement path so the final approver sees who inherited the bundle.",
  },
  {
    id: "delegated-evidence-2",
    title: "Approver change log",
    status: "pending-replay",
    note: "Replay the audit trail that records each approval handoff and expiry-triggered delegation.",
  },
] as const satisfies readonly ReleaseDelegatedApprovalEvidence[];

const initialAuditEvents = [
  {
    id: "delegated-audit-1",
    actor: "Avery",
    action: "initiated",
    detail:
      "Prepared the delegated approval bundle pack with evidence links, escalation notes, and publish blockers.",
    timestamp: "2026-03-24 02:05 UTC",
  },
] as const satisfies readonly ReleaseDelegatedApprovalAuditEvent[];

export const releaseDelegatedApprovalFetchDelayMs = 180;
export const releaseDelegatedApprovalMutationDelayMs = 220;
export const releaseDelegatedApprovalTickMs = 1000;

let run: ReleaseDelegatedApprovalRun = { ...initialRun };
let bundles: ReleaseDelegatedApprovalBundle[] = initialBundles.map(
  (bundle) => ({
    ...bundle,
  }),
);
let evidence: ReleaseDelegatedApprovalEvidence[] = initialEvidence.map(
  (item) => ({
    ...item,
  }),
);
let auditEvents: ReleaseDelegatedApprovalAuditEvent[] = initialAuditEvents.map(
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

function cloneWorkspace(): ReleaseDelegatedApprovalWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    run: { ...run },
    bundles: bundles.map((bundle) => ({ ...bundle })),
    evidence: evidence.map((item) => ({ ...item })),
    auditEvents: auditEvents.map((event) => ({ ...event })),
  };
}

function nextQueuedBundle() {
  return bundles.find((bundle) => bundle.status === "queued") ?? null;
}

function nextAuditEventId(): ReleaseDelegatedApprovalAuditEventId {
  const eventId =
    `delegated-audit-${nextAuditEventNumber}` as ReleaseDelegatedApprovalAuditEventId;
  nextAuditEventNumber += 1;
  return eventId;
}

function appendAuditEvent(
  action: ReleaseDelegatedApprovalAuditEvent["action"],
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

function allBundlesApproved() {
  return bundles.every((bundle) => bundle.status === "approved");
}

function allEvidenceReplayed() {
  return evidence.every((item) => item.status === "replayed");
}

export function resetReleaseDelegatedApprovalBundlesMockState() {
  run = { ...initialRun };
  bundles = initialBundles.map((bundle) => ({ ...bundle }));
  evidence = initialEvidence.map((item) => ({ ...item }));
  auditEvents = initialAuditEvents.map((event) => ({ ...event }));
  nextAuditEventNumber = initialAuditEvents.length + 1;
}

export function isReleaseDelegatedApprovalAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function advanceReleaseDelegatedApprovalClock() {
  if (run.stage !== "collecting-approvals") {
    return;
  }

  const activeBundle =
    bundles.find((bundle) => bundle.id === run.activeBundleId) ?? null;

  if (!activeBundle || activeBundle.expiresInSeconds === null) {
    return;
  }

  const nextExpiresInSeconds = Math.max(0, activeBundle.expiresInSeconds - 1);

  bundles = bundles.map((bundle) =>
    bundle.id === activeBundle.id
      ? {
          ...bundle,
          expiresInSeconds: nextExpiresInSeconds,
        }
      : bundle,
  );

  if (nextExpiresInSeconds !== 0 || activeBundle.status === "delegated") {
    return;
  }

  bundles = bundles.map((bundle) =>
    bundle.id === activeBundle.id
      ? {
          ...bundle,
          status: "delegated",
          currentApprover: bundle.delegateApprover,
          expiresInSeconds: 2,
          note: `Approval window expired for ${bundle.primaryApprover}. Bundle delegated to ${bundle.delegateApprover} with a new expiry window.`,
        }
      : bundle,
  );

  run = {
    ...run,
    publishBlockedReason: `${activeBundle.label} missed the primary approval window and was delegated to ${activeBundle.delegateApprover}.`,
    updatedAt: formatTimestamp(new Date()),
    updatedBy: "Sentinel - Approval router",
  };

  appendAuditEvent(
    "delegated",
    activeBundle.delegateApprover,
    `${activeBundle.label} expired for ${activeBundle.primaryApprover} and was delegated to ${activeBundle.delegateApprover}.`,
  );
}

export function fetchReleaseDelegatedApprovalWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseDelegatedApprovalWorkspaceResponse> {
  return new Promise<ReleaseDelegatedApprovalWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);
        resolve(cloneWorkspace());
      }, releaseDelegatedApprovalFetchDelayMs);

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
    },
  );
}

export function startReleaseDelegatedApproval(
  input: StartReleaseDelegatedApprovalInput,
  signal?: AbortSignal,
): Promise<ReleaseDelegatedApprovalWorkspaceResponse> {
  return new Promise<ReleaseDelegatedApprovalWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (run.id !== input.runId || run.stage !== "draft") {
          reject(
            new Error(
              "Delegated approval workflow is no longer ready to start.",
            ),
          );
          return;
        }

        bundles = bundles.map((bundle, index) =>
          index === 0
            ? {
                ...bundle,
                status: "awaiting-approval",
                expiresInSeconds: 2,
                note: `Awaiting approval from ${bundle.primaryApprover} before the delegation window expires.`,
              }
            : bundle,
        );

        run = {
          ...run,
          stage: "collecting-approvals",
          activeBundleId: "delegated-bundle-1",
          publishBlockedReason:
            "All approval bundles must clear their expiry windows before publish can proceed.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Avery - Release coordinator",
        };

        appendAuditEvent(
          "initiated",
          "Avery",
          "Started delegated approval collection and opened the first expiry window for the customer-facing bundle.",
        );

        resolve(cloneWorkspace());
      }, releaseDelegatedApprovalMutationDelayMs);

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
    },
  );
}

export function approveReleaseDelegatedBundle(
  input: ApproveReleaseDelegatedBundleInput,
  signal?: AbortSignal,
): Promise<ReleaseDelegatedApprovalWorkspaceResponse> {
  return new Promise<ReleaseDelegatedApprovalWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        const activeBundle =
          bundles.find((bundle) => bundle.id === input.bundleId) ?? null;

        if (
          !activeBundle ||
          (activeBundle.status !== "awaiting-approval" &&
            activeBundle.status !== "delegated")
        ) {
          reject(new Error("Approval is not available."));
          return;
        }

        bundles = bundles.map((bundle) =>
          bundle.id === input.bundleId
            ? {
                ...bundle,
                status: "approved",
                expiresInSeconds: null,
                note: `${bundle.currentApprover} approved ${bundle.label} and cleared it for publish readiness.`,
              }
            : bundle,
        );

        appendAuditEvent(
          "approved",
          activeBundle.currentApprover,
          `${activeBundle.currentApprover} approved ${activeBundle.label}.`,
        );

        const nextBundle = nextQueuedBundle();

        if (nextBundle) {
          bundles = bundles.map((bundle) =>
            bundle.id === nextBundle.id
              ? {
                  ...bundle,
                  status: "awaiting-approval",
                  expiresInSeconds: 3,
                  note: `Awaiting approval from ${bundle.primaryApprover} before the delegation window expires.`,
                }
              : bundle,
          );

          run = {
            ...run,
            stage: "collecting-approvals",
            activeBundleId: nextBundle.id,
            publishBlockedReason:
              "Remaining approval bundles must clear before audit evidence can be replayed.",
            updatedAt: formatTimestamp(new Date()),
            updatedBy: activeBundle.currentApprover,
          };

          resolve(cloneWorkspace());
          return;
        }

        run = {
          ...run,
          stage: "replaying-evidence",
          activeBundleId: null,
          publishBlockedReason:
            "Audit evidence must be replayed before publish can proceed.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: activeBundle.currentApprover,
        };
        resolve(cloneWorkspace());
      }, releaseDelegatedApprovalMutationDelayMs);

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
    },
  );
}

export function replayReleaseDelegatedEvidence(
  input: ReplayReleaseDelegatedEvidenceInput,
  signal?: AbortSignal,
): Promise<ReleaseDelegatedApprovalWorkspaceResponse> {
  return new Promise<ReleaseDelegatedApprovalWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (
          run.id !== input.runId ||
          run.stage !== "replaying-evidence" ||
          !allBundlesApproved()
        ) {
          reject(new Error("Audit evidence replay is not available."));
          return;
        }

        evidence = evidence.map((item) => ({
          ...item,
          status: "replayed",
          note: `${item.title} was replayed for the final publish reviewer.`,
        }));

        run = {
          ...run,
          stage: "ready-to-publish",
          publishBlockedReason: null,
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Avery - Release coordinator",
        };

        appendAuditEvent(
          "replayed",
          "Avery",
          "Replayed the approval delegation evidence and cleared the publish gate.",
        );

        resolve(cloneWorkspace());
      }, releaseDelegatedApprovalMutationDelayMs);

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
    },
  );
}

export function publishReleaseDelegatedApproval(
  input: PublishReleaseDelegatedApprovalInput,
  signal?: AbortSignal,
): Promise<ReleaseDelegatedApprovalWorkspaceResponse> {
  return new Promise<ReleaseDelegatedApprovalWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (
          run.id !== input.runId ||
          run.stage !== "ready-to-publish" ||
          !allBundlesApproved() ||
          !allEvidenceReplayed()
        ) {
          reject(new Error("Publish is not available."));
          return;
        }

        run = {
          ...run,
          stage: "published",
          publishBlockedReason: null,
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Avery - Release coordinator",
        };

        appendAuditEvent(
          "published",
          "Avery",
          "Published the release after all delegated approval bundles and replayed evidence cleared the gate.",
        );

        resolve(cloneWorkspace());
      }, releaseDelegatedApprovalMutationDelayMs);

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
    },
  );
}
