import type {
  ApproveReleaseCustomerPromiseInput,
  InvalidateReleaseCustomerClaimsInput,
  PublishReleaseCustomerPromisesInput,
  ReleaseCustomerClaim,
  ReleaseCustomerPromise,
  ReleaseCustomerPromiseAuditEvent,
  ReleaseCustomerPromiseAuditEventId,
  ReleaseCustomerPromiseRun,
  ReleaseCustomerPromiseWorkspaceResponse,
  SignOffReleaseCustomerPromisesInput,
  StartReleaseCustomerPromiseInput,
} from "./types";

const initialRun = {
  id: "customer-promise-run-1",
  title: "Customer promise reconciliation",
  summary:
    "Review every outward-facing customer promise, invalidate stale claims that no longer match verified recovery, collect approver sign-off on the revised wording, and only then publish the reconciled promise set.",
  stage: "draft",
  activePromiseId: null,
  publishBlockedReason:
    "Promise review, stale-claim invalidation, and approver sign-off must complete before the reconciled promises can publish.",
  updatedAt: "2026-03-24 06:35 UTC",
  updatedBy: "Avery - Incident lead",
} as const satisfies ReleaseCustomerPromiseRun;

const initialPromises = [
  {
    id: "customer-promise-1",
    label: "Checkout recovery promise",
    owner: "Mina",
    audience: "Affected merchants",
    status: "queued",
    note: "Merchant-facing checkout promises are reviewed first because they drive the most visible recovery expectations.",
  },
  {
    id: "customer-promise-2",
    label: "Support resolution promise",
    owner: "Jordan",
    audience: "Support escalations",
    status: "queued",
    note: "Support wording is reviewed second so agent promises inherit the revised merchant-safe recovery posture.",
  },
  {
    id: "customer-promise-3",
    label: "Executive account promise",
    owner: "Priya",
    audience: "Strategic accounts",
    status: "queued",
    note: "Executive account language is reconciled last so it only references promises already approved in public and support channels.",
  },
] as const satisfies readonly ReleaseCustomerPromise[];

const initialClaims = [
  {
    id: "customer-claim-1",
    promise: "Checkout recovery promise",
    staleClaim:
      "All affected merchants will see checkout fully recovered within two hours.",
    revisedClaim:
      "Most affected merchants will see checkout recovered within six hours, with manual remediation for the remaining edge cases.",
    reason:
      "The original timing claim became stale after regional replay validation showed a smaller set of merchants needed manual repair.",
    status: "current",
  },
  {
    id: "customer-claim-2",
    promise: "Support resolution promise",
    staleClaim:
      "Support can promise every reimbursement case is resolved by end of day.",
    revisedClaim:
      "Support can promise reimbursement review starts immediately, with final case resolution tracked over the next business day.",
    reason:
      "The blanket same-day resolution claim stopped matching the revised finance review path required for some reimbursements.",
    status: "current",
  },
  {
    id: "customer-claim-3",
    promise: "Executive account promise",
    staleClaim:
      "Strategic accounts can be told the incident is fully closed today.",
    revisedClaim:
      "Strategic accounts can be told the incident is stabilized today, with final closure pending the reconciled remediation evidence packet.",
    reason:
      "Closure language became stale once the executive summary depended on the still-pending remediation evidence approval.",
    status: "current",
  },
] as const satisfies readonly ReleaseCustomerClaim[];

const initialAuditEvents = [
  {
    id: "customer-promise-audit-1",
    actor: "Avery",
    action: "initiated",
    detail:
      "Prepared customer promise lanes with stale-claim comparisons ready for owner review.",
    timestamp: "2026-03-24 06:30 UTC",
  },
] as const satisfies readonly ReleaseCustomerPromiseAuditEvent[];

export const releaseCustomerPromiseFetchDelayMs = 180;
export const releaseCustomerPromiseMutationDelayMs = 220;

let run: ReleaseCustomerPromiseRun = { ...initialRun };
let promises: ReleaseCustomerPromise[] = initialPromises.map((item) => ({
  ...item,
}));
let claims: ReleaseCustomerClaim[] = initialClaims.map((item) => ({ ...item }));
let auditEvents: ReleaseCustomerPromiseAuditEvent[] = initialAuditEvents.map(
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

function cloneWorkspace(): ReleaseCustomerPromiseWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    run: { ...run },
    promises: promises.map((item) => ({ ...item })),
    claims: claims.map((item) => ({ ...item })),
    auditEvents: auditEvents.map((event) => ({ ...event })),
  };
}

function nextAuditEventId(): ReleaseCustomerPromiseAuditEventId {
  const eventId =
    `customer-promise-audit-${nextAuditEventNumber}` as ReleaseCustomerPromiseAuditEventId;
  nextAuditEventNumber += 1;
  return eventId;
}

function appendAuditEvent(
  action: ReleaseCustomerPromiseAuditEvent["action"],
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

function nextQueuedPromise() {
  return promises.find((item) => item.status === "queued") ?? null;
}

function allClaimsInvalidated() {
  return claims.every((item) => item.status === "invalidated");
}

function allClaimsApproved() {
  return claims.every((item) => item.status === "approved");
}

export function resetReleaseCustomerPromiseMockState() {
  run = { ...initialRun };
  promises = initialPromises.map((item) => ({ ...item }));
  claims = initialClaims.map((item) => ({ ...item }));
  auditEvents = initialAuditEvents.map((event) => ({ ...event }));
  nextAuditEventNumber = initialAuditEvents.length + 1;
}

export function isReleaseCustomerPromiseAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function fetchReleaseCustomerPromiseWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseCustomerPromiseWorkspaceResponse> {
  return new Promise<ReleaseCustomerPromiseWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);
        resolve(cloneWorkspace());
      }, releaseCustomerPromiseFetchDelayMs);

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

export function startReleaseCustomerPromise(
  input: StartReleaseCustomerPromiseInput,
  signal?: AbortSignal,
): Promise<ReleaseCustomerPromiseWorkspaceResponse> {
  return new Promise<ReleaseCustomerPromiseWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (run.id !== input.runId || run.stage !== "draft") {
          reject(
            new Error(
              "Customer promise reconciliation is no longer ready to start.",
            ),
          );
          return;
        }

        promises = promises.map((item, index) =>
          index === 0
            ? {
                ...item,
                status: "awaiting-review",
                note: "Awaiting owner review before the next customer promise lane opens.",
              }
            : item,
        );

        run = {
          ...run,
          stage: "promise-review",
          activePromiseId: "customer-promise-1",
          publishBlockedReason:
            "Each customer promise must clear owner review before stale claims can be invalidated.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Avery - Incident lead",
        };

        appendAuditEvent(
          "initiated",
          "Avery",
          "Started customer promise reconciliation with the checkout recovery lane.",
        );

        resolve(cloneWorkspace());
      }, releaseCustomerPromiseMutationDelayMs);

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

export function approveReleaseCustomerPromise(
  input: ApproveReleaseCustomerPromiseInput,
  signal?: AbortSignal,
): Promise<ReleaseCustomerPromiseWorkspaceResponse> {
  return new Promise<ReleaseCustomerPromiseWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        const promise =
          promises.find((item) => item.id === input.promiseId) ?? null;

        if (!promise || promise.status !== "awaiting-review") {
          reject(new Error("Promise approval is not available."));
          return;
        }

        promises = promises.map((item) =>
          item.id === input.promiseId
            ? {
                ...item,
                status: "approved",
                note: `${item.owner} approved ${item.label}.`,
              }
            : item,
        );

        appendAuditEvent(
          "approved",
          promise.owner,
          `${promise.owner} approved ${promise.label}.`,
        );

        const nextPromise = nextQueuedPromise();
        if (nextPromise) {
          promises = promises.map((item) =>
            item.id === nextPromise.id
              ? {
                  ...item,
                  status: "awaiting-review",
                  note: `${item.label} is the next customer promise lane awaiting review.`,
                }
              : item,
          );

          run = {
            ...run,
            stage: "promise-review",
            activePromiseId: nextPromise.id,
            publishBlockedReason:
              "Finish promise review before stale claims can be invalidated.",
            updatedAt: formatTimestamp(new Date()),
            updatedBy: promise.owner,
          };
          resolve(cloneWorkspace());
          return;
        }

        claims = claims.map((item) => ({ ...item, status: "stale" }));

        run = {
          ...run,
          stage: "stale-claim-review",
          activePromiseId: null,
          publishBlockedReason:
            "Invalidate stale claims before approver sign-off can clear the reconciled customer promises.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: promise.owner,
        };

        resolve(cloneWorkspace());
      }, releaseCustomerPromiseMutationDelayMs);

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

export function invalidateReleaseCustomerClaims(
  input: InvalidateReleaseCustomerClaimsInput,
  signal?: AbortSignal,
): Promise<ReleaseCustomerPromiseWorkspaceResponse> {
  return new Promise<ReleaseCustomerPromiseWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (run.id !== input.runId || run.stage !== "stale-claim-review") {
          reject(new Error("Stale-claim invalidation is not available."));
          return;
        }

        claims = claims.map((item) => ({ ...item, status: "invalidated" }));

        run = {
          ...run,
          stage: "approver-signoff",
          publishBlockedReason:
            "Approver sign-off must confirm the revised customer promises before publish can proceed.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Avery - Incident lead",
        };

        appendAuditEvent(
          "invalidated",
          "Avery",
          "Invalidated stale customer claims so only reconciled promise language remains eligible for publish.",
        );

        resolve(cloneWorkspace());
      }, releaseCustomerPromiseMutationDelayMs);

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

export function signOffReleaseCustomerPromises(
  input: SignOffReleaseCustomerPromisesInput,
  signal?: AbortSignal,
): Promise<ReleaseCustomerPromiseWorkspaceResponse> {
  return new Promise<ReleaseCustomerPromiseWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (
          run.id !== input.runId ||
          run.stage !== "approver-signoff" ||
          !allClaimsInvalidated()
        ) {
          reject(new Error("Approver sign-off is not available."));
          return;
        }

        claims = claims.map((item) => ({ ...item, status: "approved" }));

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
          "Approver sign-off recorded for the reconciled customer promise set.",
        );

        resolve(cloneWorkspace());
      }, releaseCustomerPromiseMutationDelayMs);

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

export function publishReleaseCustomerPromises(
  input: PublishReleaseCustomerPromisesInput,
  signal?: AbortSignal,
): Promise<ReleaseCustomerPromiseWorkspaceResponse> {
  return new Promise<ReleaseCustomerPromiseWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (
          run.id !== input.runId ||
          run.stage !== "ready-to-publish" ||
          !allClaimsApproved()
        ) {
          reject(new Error("Customer promise publish is not available."));
          return;
        }

        promises = promises.map((item) => ({
          ...item,
          status: "published",
          note: `${item.label} published with the reconciled approved claim.`,
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
          "Published the reconciled customer promises after stale-claim invalidation and approver sign-off.",
        );

        resolve(cloneWorkspace());
      }, releaseCustomerPromiseMutationDelayMs);

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
