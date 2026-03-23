import type {
  ApproveReleaseRemediationReadinessRegistryInput,
  InvalidateReleaseRemediationReadinessEvidenceInput,
  PublishReleaseRemediationReadinessInput,
  ReleaseRemediationReadinessAuditEvent,
  ReleaseRemediationReadinessAuditEventId,
  ReleaseRemediationReadinessEvidence,
  ReleaseRemediationReadinessRegistry,
  ReleaseRemediationReadinessRun,
  ReleaseRemediationReadinessWorkspaceResponse,
  SignOffReleaseRemediationReadinessInput,
  StartReleaseRemediationReadinessInput,
} from "./types";

const initialRun = {
  id: "remediation-readiness-run-1",
  title: "Remediation readiness registries",
  summary:
    "Review each remediation readiness registry, invalidate stale evidence that no longer matches the verified recovery posture, collect approver sign-off on the revised evidence, and only then publish the reconciled readiness packet.",
  stage: "draft",
  activeRegistryId: null,
  publishBlockedReason:
    "Registry review, stale-evidence invalidation, and approver sign-off must complete before the remediation readiness packet can publish.",
  updatedAt: "2026-03-24 08:05 UTC",
  updatedBy: "Avery - Incident lead",
} as const satisfies ReleaseRemediationReadinessRun;

const initialRegistries = [
  {
    id: "remediation-readiness-registry-1",
    label: "Checkout remediation registry",
    owner: "Mina",
    lane: "Checkout operations",
    status: "queued",
    note: "Checkout readiness is reviewed first because it defines whether the remediation packet can claim the customer path is stable again.",
  },
  {
    id: "remediation-readiness-registry-2",
    label: "Support remediation registry",
    owner: "Jordan",
    lane: "Support readiness",
    status: "queued",
    note: "Support readiness is reviewed second so escalations only inherit evidence that reflects the corrected checkout posture.",
  },
  {
    id: "remediation-readiness-registry-3",
    label: "Executive remediation registry",
    owner: "Priya",
    lane: "Executive reporting",
    status: "queued",
    note: "Executive readiness is reviewed last so leadership updates reference only approved remediation evidence from the operational lanes.",
  },
] as const satisfies readonly ReleaseRemediationReadinessRegistry[];

const initialEvidenceRows = [
  {
    id: "remediation-readiness-evidence-1",
    registry: "Checkout remediation registry",
    staleEvidence:
      "Primary-region synthetic checks passed after the remediation patch was applied.",
    revisedEvidence:
      "Primary and recovery-region synthetic checks plus replay verification passed after the remediation patch and traffic ramp completed.",
    reason:
      "The primary-region-only evidence became stale once the release bar required replay verification in every recovery region.",
    status: "current",
  },
  {
    id: "remediation-readiness-evidence-2",
    registry: "Support remediation registry",
    staleEvidence:
      "Support macros were updated after the remediation draft was approved.",
    revisedEvidence:
      "Support macros, escalation scripts, and rollback-safe troubleshooting guidance were updated after the final remediation evidence cleared review.",
    reason:
      "The original support evidence became stale after new troubleshooting guidance and escalation routing changes were added to the packet.",
    status: "current",
  },
  {
    id: "remediation-readiness-evidence-3",
    registry: "Executive remediation registry",
    staleEvidence:
      "Leadership summary references the initial remediation estimate and customer impact window.",
    revisedEvidence:
      "Leadership summary references the approved remediation evidence, revised ETA confidence, and verified support readiness window.",
    reason:
      "The estimate-only summary became stale after the readiness packet depended on approved operational evidence and revised confidence bands.",
    status: "current",
  },
] as const satisfies readonly ReleaseRemediationReadinessEvidence[];

const initialAuditEvents = [
  {
    id: "remediation-readiness-audit-1",
    actor: "Avery",
    action: "initiated",
    detail:
      "Prepared remediation readiness registries with owner review and evidence rows ready for reconciliation.",
    timestamp: "2026-03-24 08:00 UTC",
  },
] as const satisfies readonly ReleaseRemediationReadinessAuditEvent[];

export const releaseRemediationReadinessFetchDelayMs = 180;
export const releaseRemediationReadinessMutationDelayMs = 220;

let run: ReleaseRemediationReadinessRun = { ...initialRun };
let registries: ReleaseRemediationReadinessRegistry[] = initialRegistries.map(
  (registry) => ({ ...registry }),
);
let evidenceRows: ReleaseRemediationReadinessEvidence[] =
  initialEvidenceRows.map((item) => ({ ...item }));
let auditEvents: ReleaseRemediationReadinessAuditEvent[] =
  initialAuditEvents.map((event) => ({ ...event }));
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

function cloneWorkspace(): ReleaseRemediationReadinessWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    run: { ...run },
    registries: registries.map((registry) => ({ ...registry })),
    evidenceRows: evidenceRows.map((item) => ({ ...item })),
    auditEvents: auditEvents.map((event) => ({ ...event })),
  };
}

function nextAuditEventId(): ReleaseRemediationReadinessAuditEventId {
  const eventId =
    `remediation-readiness-audit-${nextAuditEventNumber}` as ReleaseRemediationReadinessAuditEventId;
  nextAuditEventNumber += 1;
  return eventId;
}

function appendAuditEvent(
  action: ReleaseRemediationReadinessAuditEvent["action"],
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

function nextQueuedRegistry() {
  return registries.find((registry) => registry.status === "queued") ?? null;
}

function allEvidenceInvalidated() {
  return evidenceRows.every((item) => item.status === "invalidated");
}

function allEvidenceApproved() {
  return evidenceRows.every((item) => item.status === "approved");
}

export function resetReleaseRemediationReadinessMockState() {
  run = { ...initialRun };
  registries = initialRegistries.map((registry) => ({ ...registry }));
  evidenceRows = initialEvidenceRows.map((item) => ({ ...item }));
  auditEvents = initialAuditEvents.map((event) => ({ ...event }));
  nextAuditEventNumber = initialAuditEvents.length + 1;
}

export function isReleaseRemediationReadinessAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function fetchReleaseRemediationReadinessWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseRemediationReadinessWorkspaceResponse> {
  return new Promise<ReleaseRemediationReadinessWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);
        resolve(cloneWorkspace());
      }, releaseRemediationReadinessFetchDelayMs);

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

export function startReleaseRemediationReadiness(
  input: StartReleaseRemediationReadinessInput,
  signal?: AbortSignal,
): Promise<ReleaseRemediationReadinessWorkspaceResponse> {
  return new Promise<ReleaseRemediationReadinessWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (run.id !== input.runId || run.stage !== "draft") {
          reject(
            new Error(
              "Remediation readiness review is no longer ready to start.",
            ),
          );
          return;
        }

        registries = registries.map((registry, index) =>
          index === 0
            ? {
                ...registry,
                status: "awaiting-review",
                note: "Awaiting owner review before the next remediation readiness registry opens.",
              }
            : registry,
        );

        run = {
          ...run,
          stage: "registry-review",
          activeRegistryId: "remediation-readiness-registry-1",
          publishBlockedReason:
            "Each remediation readiness registry must clear owner review before stale evidence can be invalidated.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Avery - Incident lead",
        };

        appendAuditEvent(
          "initiated",
          "Avery",
          "Started remediation readiness review with the checkout remediation registry.",
        );

        resolve(cloneWorkspace());
      }, releaseRemediationReadinessMutationDelayMs);

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

export function approveReleaseRemediationReadinessRegistry(
  input: ApproveReleaseRemediationReadinessRegistryInput,
  signal?: AbortSignal,
): Promise<ReleaseRemediationReadinessWorkspaceResponse> {
  return new Promise<ReleaseRemediationReadinessWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        const registry =
          registries.find((item) => item.id === input.registryId) ?? null;

        if (!registry || registry.status !== "awaiting-review") {
          reject(
            new Error(
              "Remediation readiness registry approval is not available.",
            ),
          );
          return;
        }

        registries = registries.map((item) =>
          item.id === input.registryId
            ? {
                ...item,
                status: "approved",
                note: `${item.owner} approved ${item.label}.`,
              }
            : item,
        );

        appendAuditEvent(
          "approved",
          registry.owner,
          `${registry.owner} approved ${registry.label}.`,
        );

        const nextRegistry = nextQueuedRegistry();
        if (nextRegistry) {
          registries = registries.map((item) =>
            item.id === nextRegistry.id
              ? {
                  ...item,
                  status: "awaiting-review",
                  note: `${item.label} is the next remediation readiness registry awaiting review.`,
                }
              : item,
          );

          run = {
            ...run,
            stage: "registry-review",
            activeRegistryId: nextRegistry.id,
            publishBlockedReason:
              "Finish remediation readiness registry review before stale evidence can be invalidated.",
            updatedAt: formatTimestamp(new Date()),
            updatedBy: registry.owner,
          };
          resolve(cloneWorkspace());
          return;
        }

        evidenceRows = evidenceRows.map((item) => ({
          ...item,
          status: "stale",
        }));

        run = {
          ...run,
          stage: "stale-evidence-review",
          activeRegistryId: null,
          publishBlockedReason:
            "Invalidate stale evidence before approver sign-off can clear the remediation readiness packet.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: registry.owner,
        };

        resolve(cloneWorkspace());
      }, releaseRemediationReadinessMutationDelayMs);

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

export function invalidateReleaseRemediationReadinessEvidence(
  input: InvalidateReleaseRemediationReadinessEvidenceInput,
  signal?: AbortSignal,
): Promise<ReleaseRemediationReadinessWorkspaceResponse> {
  return new Promise<ReleaseRemediationReadinessWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (run.id !== input.runId || run.stage !== "stale-evidence-review") {
          reject(new Error("Stale-evidence invalidation is not available."));
          return;
        }

        evidenceRows = evidenceRows.map((item) => ({
          ...item,
          status: "invalidated",
        }));

        run = {
          ...run,
          stage: "approver-signoff",
          publishBlockedReason:
            "Approver sign-off must confirm the revised remediation evidence before publish can proceed.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Avery - Incident lead",
        };

        appendAuditEvent(
          "invalidated",
          "Avery",
          "Invalidated stale remediation readiness evidence so only the revised packet remains eligible for publish.",
        );

        resolve(cloneWorkspace());
      }, releaseRemediationReadinessMutationDelayMs);

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

export function signOffReleaseRemediationReadiness(
  input: SignOffReleaseRemediationReadinessInput,
  signal?: AbortSignal,
): Promise<ReleaseRemediationReadinessWorkspaceResponse> {
  return new Promise<ReleaseRemediationReadinessWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (
          run.id !== input.runId ||
          run.stage !== "approver-signoff" ||
          !allEvidenceInvalidated()
        ) {
          reject(new Error("Approver sign-off is not available."));
          return;
        }

        evidenceRows = evidenceRows.map((item) => ({
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
          "Approver sign-off recorded for the revised remediation readiness packet.",
        );

        resolve(cloneWorkspace());
      }, releaseRemediationReadinessMutationDelayMs);

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

export function publishReleaseRemediationReadiness(
  input: PublishReleaseRemediationReadinessInput,
  signal?: AbortSignal,
): Promise<ReleaseRemediationReadinessWorkspaceResponse> {
  return new Promise<ReleaseRemediationReadinessWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (
          run.id !== input.runId ||
          run.stage !== "ready-to-publish" ||
          !allEvidenceApproved()
        ) {
          reject(new Error("Remediation readiness publish is not available."));
          return;
        }

        registries = registries.map((registry) => ({
          ...registry,
          status: "published",
          note: `${registry.label} published with the revised approved remediation evidence.`,
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
          "Published the remediation readiness packet after stale-evidence invalidation and approver sign-off.",
        );

        resolve(cloneWorkspace());
      }, releaseRemediationReadinessMutationDelayMs);

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
