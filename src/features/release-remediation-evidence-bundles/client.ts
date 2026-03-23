import type {
  ApproveReleaseRemediationEvidenceBundleInput,
  InvalidateReleaseRemediationProofsInput,
  PublishReleaseRemediationEvidenceInput,
  ReleaseRemediationAuditEvent,
  ReleaseRemediationAuditEventId,
  ReleaseRemediationEvidenceBundle,
  ReleaseRemediationEvidenceRun,
  ReleaseRemediationProof,
  ReleaseRemediationWorkspaceResponse,
  SignOffReleaseRemediationEvidenceInput,
  StartReleaseRemediationEvidenceInput,
} from "./types";

const initialRun = {
  id: "remediation-evidence-run-1",
  title: "Remediation evidence bundles",
  summary:
    "Review remediation evidence bundles by owner, invalidate stale proof that no longer matches the incident state, collect approver sign-off on the revised evidence, and only then publish the final remediation packet.",
  stage: "draft",
  activeBundleId: null,
  publishBlockedReason:
    "Bundle review, stale-proof invalidation, and approver sign-off must complete before the remediation packet can publish.",
  updatedAt: "2026-03-24 06:10 UTC",
  updatedBy: "Avery - Incident lead",
} as const satisfies ReleaseRemediationEvidenceRun;

const initialBundles = [
  {
    id: "remediation-evidence-bundle-1",
    label: "Checkout verification bundle",
    owner: "Mina",
    area: "Checkout",
    status: "queued",
    note: "Checkout verification goes first because it anchors the highest-risk remediation proof shared outside the incident team.",
  },
  {
    id: "remediation-evidence-bundle-2",
    label: "Support readiness bundle",
    owner: "Jordan",
    area: "Support operations",
    status: "queued",
    note: "Support readiness evidence is reviewed after checkout verification so the playbook proof reflects the updated customer state.",
  },
  {
    id: "remediation-evidence-bundle-3",
    label: "Executive review bundle",
    owner: "Priya",
    area: "Leadership reporting",
    status: "queued",
    note: "Executive evidence is reviewed last so it only references approved proof from the remediation and support bundles.",
  },
] as const satisfies readonly ReleaseRemediationEvidenceBundle[];

const initialProofs = [
  {
    id: "remediation-proof-1",
    bundle: "Checkout verification bundle",
    baselineProof:
      "Synthetic checks passed in the primary region after rollback.",
    revisedProof:
      "Synthetic checks and regional replay traces passed after remediation verification completed across recovery regions.",
    reason:
      "Primary-region-only proof became stale once cross-region verification became the new release bar.",
    status: "current",
  },
  {
    id: "remediation-proof-2",
    bundle: "Support readiness bundle",
    baselineProof: "Support macros were updated after rollback execution.",
    revisedProof:
      "Support macros and escalation scripts were updated after FAQ, routing, and remediation proof were reconciled.",
    reason:
      "The original proof no longer covered the additional customer messaging and routing changes introduced after rollback.",
    status: "current",
  },
  {
    id: "remediation-proof-3",
    bundle: "Executive review bundle",
    baselineProof: "Executive summary reflects the original mitigation plan.",
    revisedProof:
      "Executive summary reflects the approved remediation evidence, revised ETAs, and verified support readiness state.",
    reason:
      "The mitigation-only summary became stale after follow-up commitments and support readiness proof changed.",
    status: "current",
  },
] as const satisfies readonly ReleaseRemediationProof[];

const initialAuditEvents = [
  {
    id: "remediation-audit-1",
    actor: "Avery",
    action: "initiated",
    detail:
      "Prepared remediation evidence bundles with bundle owners and proof rows ready for review.",
    timestamp: "2026-03-24 06:05 UTC",
  },
] as const satisfies readonly ReleaseRemediationAuditEvent[];

export const releaseRemediationEvidenceFetchDelayMs = 180;
export const releaseRemediationEvidenceMutationDelayMs = 220;

let run: ReleaseRemediationEvidenceRun = { ...initialRun };
let bundles: ReleaseRemediationEvidenceBundle[] = initialBundles.map(
  (bundle) => ({ ...bundle }),
);
let proofs: ReleaseRemediationProof[] = initialProofs.map((proof) => ({
  ...proof,
}));
let auditEvents: ReleaseRemediationAuditEvent[] = initialAuditEvents.map(
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

function cloneWorkspace(): ReleaseRemediationWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    run: { ...run },
    bundles: bundles.map((bundle) => ({ ...bundle })),
    proofs: proofs.map((proof) => ({ ...proof })),
    auditEvents: auditEvents.map((event) => ({ ...event })),
  };
}

function nextAuditEventId(): ReleaseRemediationAuditEventId {
  const eventId =
    `remediation-audit-${nextAuditEventNumber}` as ReleaseRemediationAuditEventId;
  nextAuditEventNumber += 1;
  return eventId;
}

function appendAuditEvent(
  action: ReleaseRemediationAuditEvent["action"],
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

function nextQueuedBundle() {
  return bundles.find((bundle) => bundle.status === "queued") ?? null;
}

function allProofsInvalidated() {
  return proofs.every((proof) => proof.status === "invalidated");
}

function allProofsApproved() {
  return proofs.every((proof) => proof.status === "approved");
}

export function resetReleaseRemediationEvidenceBundlesMockState() {
  run = { ...initialRun };
  bundles = initialBundles.map((bundle) => ({ ...bundle }));
  proofs = initialProofs.map((proof) => ({ ...proof }));
  auditEvents = initialAuditEvents.map((event) => ({ ...event }));
  nextAuditEventNumber = initialAuditEvents.length + 1;
}

export function isReleaseRemediationEvidenceAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function fetchReleaseRemediationEvidenceWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseRemediationWorkspaceResponse> {
  return new Promise<ReleaseRemediationWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve(cloneWorkspace());
    }, releaseRemediationEvidenceFetchDelayMs);

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

export function startReleaseRemediationEvidence(
  input: StartReleaseRemediationEvidenceInput,
  signal?: AbortSignal,
): Promise<ReleaseRemediationWorkspaceResponse> {
  return new Promise<ReleaseRemediationWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (run.id !== input.runId || run.stage !== "draft") {
        reject(
          new Error("Remediation evidence review is no longer ready to start."),
        );
        return;
      }

      bundles = bundles.map((bundle, index) =>
        index === 0
          ? {
              ...bundle,
              status: "awaiting-review",
              note: "Awaiting owner review before the next remediation bundle opens.",
            }
          : bundle,
      );

      run = {
        ...run,
        stage: "bundle-review",
        activeBundleId: "remediation-evidence-bundle-1",
        publishBlockedReason:
          "Each remediation evidence bundle must clear owner review before stale proof can be invalidated.",
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Avery - Incident lead",
      };

      appendAuditEvent(
        "initiated",
        "Avery",
        "Started remediation evidence review with the checkout verification bundle.",
      );
      resolve(cloneWorkspace());
    }, releaseRemediationEvidenceMutationDelayMs);

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

export function approveReleaseRemediationEvidenceBundle(
  input: ApproveReleaseRemediationEvidenceBundleInput,
  signal?: AbortSignal,
): Promise<ReleaseRemediationWorkspaceResponse> {
  return new Promise<ReleaseRemediationWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      const bundle = bundles.find((item) => item.id === input.bundleId) ?? null;

      if (!bundle || bundle.status !== "awaiting-review") {
        reject(new Error("Bundle approval is not available."));
        return;
      }

      bundles = bundles.map((item) =>
        item.id === input.bundleId
          ? {
              ...item,
              status: "approved",
              note: `${item.owner} approved ${item.label}.`,
            }
          : item,
      );

      appendAuditEvent(
        "approved",
        bundle.owner,
        `${bundle.owner} approved ${bundle.label}.`,
      );

      const nextBundle = nextQueuedBundle();
      if (nextBundle) {
        bundles = bundles.map((item) =>
          item.id === nextBundle.id
            ? {
                ...item,
                status: "awaiting-review",
                note: `${item.label} is the next remediation evidence bundle awaiting review.`,
              }
            : item,
        );

        run = {
          ...run,
          stage: "bundle-review",
          activeBundleId: nextBundle.id,
          publishBlockedReason:
            "Finish bundle review before stale proof invalidation can begin.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: bundle.owner,
        };
        resolve(cloneWorkspace());
        return;
      }

      proofs = proofs.map((proof) => ({ ...proof, status: "stale" }));

      run = {
        ...run,
        stage: "stale-proof-review",
        activeBundleId: null,
        publishBlockedReason:
          "Invalidate stale proof before approver sign-off can clear the remediation evidence packet.",
        updatedAt: formatTimestamp(new Date()),
        updatedBy: bundle.owner,
      };
      resolve(cloneWorkspace());
    }, releaseRemediationEvidenceMutationDelayMs);

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

export function invalidateReleaseRemediationProofs(
  input: InvalidateReleaseRemediationProofsInput,
  signal?: AbortSignal,
): Promise<ReleaseRemediationWorkspaceResponse> {
  return new Promise<ReleaseRemediationWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (run.id !== input.runId || run.stage !== "stale-proof-review") {
        reject(new Error("Stale-proof invalidation is not available."));
        return;
      }

      proofs = proofs.map((proof) => ({ ...proof, status: "invalidated" }));

      run = {
        ...run,
        stage: "approver-signoff",
        publishBlockedReason:
          "Approver sign-off must confirm the revised proof before publish can proceed.",
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Avery - Incident lead",
      };

      appendAuditEvent(
        "invalidated",
        "Avery",
        "Invalidated stale remediation proof so only revised evidence remains eligible for publish.",
      );

      resolve(cloneWorkspace());
    }, releaseRemediationEvidenceMutationDelayMs);

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

export function signOffReleaseRemediationEvidence(
  input: SignOffReleaseRemediationEvidenceInput,
  signal?: AbortSignal,
): Promise<ReleaseRemediationWorkspaceResponse> {
  return new Promise<ReleaseRemediationWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (
        run.id !== input.runId ||
        run.stage !== "approver-signoff" ||
        !allProofsInvalidated()
      ) {
        reject(new Error("Approver sign-off is not available."));
        return;
      }

      proofs = proofs.map((proof) => ({ ...proof, status: "approved" }));

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
        "Approver sign-off recorded for the revised remediation evidence packet.",
      );

      resolve(cloneWorkspace());
    }, releaseRemediationEvidenceMutationDelayMs);

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

export function publishReleaseRemediationEvidence(
  input: PublishReleaseRemediationEvidenceInput,
  signal?: AbortSignal,
): Promise<ReleaseRemediationWorkspaceResponse> {
  return new Promise<ReleaseRemediationWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (
        run.id !== input.runId ||
        run.stage !== "ready-to-publish" ||
        !allProofsApproved()
      ) {
        reject(new Error("Remediation evidence publish is not available."));
        return;
      }

      bundles = bundles.map((bundle) => ({
        ...bundle,
        status: "published",
        note: `${bundle.label} published with the revised approved proof.`,
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
        "Published the remediation evidence packet after stale-proof invalidation and approver sign-off.",
      );

      resolve(cloneWorkspace());
    }, releaseRemediationEvidenceMutationDelayMs);

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
