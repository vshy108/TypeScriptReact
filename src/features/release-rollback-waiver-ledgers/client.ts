import type {
  ApproveReleaseRollbackWaiverLedgerInput,
  InvalidateReleaseRollbackExceptionsInput,
  PublishReleaseRollbackWaiverInput,
  ReleaseRollbackException,
  ReleaseRollbackWaiverAuditEvent,
  ReleaseRollbackWaiverAuditEventId,
  ReleaseRollbackWaiverLedger,
  ReleaseRollbackWaiverRun,
  ReleaseRollbackWaiverWorkspaceResponse,
  SignOffReleaseRollbackWaiverInput,
  StartReleaseRollbackWaiverInput,
} from "./types";

const initialRun = {
  id: "rollback-waiver-run-1",
  title: "Rollback waiver ledgers",
  summary:
    "Review each rollback waiver ledger, invalidate expired exceptions that no longer match the recovery posture, collect approver sign-off on the revised waivers, and only then publish the reconciled ledger set.",
  stage: "draft",
  activeLedgerId: null,
  publishBlockedReason:
    "Ledger review, expired exception invalidation, and approver sign-off must complete before the rollback waiver ledger can publish.",
  updatedAt: "2026-03-24 06:55 UTC",
  updatedBy: "Avery - Incident lead",
} as const satisfies ReleaseRollbackWaiverRun;

const initialLedgers = [
  {
    id: "rollback-waiver-ledger-1",
    label: "Payments partner waiver ledger",
    owner: "Mina",
    scope: "Partner rollback exceptions",
    status: "queued",
    note: "Partner exceptions are reviewed first because third-party waivers can outlive the rollback if they are not explicitly reconciled.",
  },
  {
    id: "rollback-waiver-ledger-2",
    label: "Merchant SLA waiver ledger",
    owner: "Jordan",
    scope: "Merchant commitments",
    status: "queued",
    note: "Merchant SLA waivers are reviewed second so customer-facing exceptions inherit the corrected partner recovery posture.",
  },
  {
    id: "rollback-waiver-ledger-3",
    label: "Executive exception ledger",
    owner: "Priya",
    scope: "Leadership approvals",
    status: "queued",
    note: "Executive exceptions are reconciled last so the final ledger only references waivers still valid after partner and merchant review.",
  },
] as const satisfies readonly ReleaseRollbackWaiverLedger[];

const initialExceptions = [
  {
    id: "rollback-exception-1",
    ledger: "Payments partner waiver ledger",
    staleException:
      "Partner callbacks may remain on a manual failover path through the rest of the week.",
    revisedException:
      "Partner callbacks may remain on manual failover for the next 12 hours while replay drains the final backlog.",
    reason:
      "The original waiver expired once replay completion narrowed the remaining partner exception window to a shorter verified duration.",
    status: "current",
  },
  {
    id: "rollback-exception-2",
    ledger: "Merchant SLA waiver ledger",
    staleException:
      "All affected merchants will stay under SLA waiver until the next billing cycle.",
    revisedException:
      "Affected merchants stay under SLA waiver only until reconciliation closes the remaining rollback-era billing adjustments tomorrow.",
    reason:
      "The longer billing-cycle waiver became stale once finance confirmed the remaining adjustments would clear in one day.",
    status: "current",
  },
  {
    id: "rollback-exception-3",
    ledger: "Executive exception ledger",
    staleException:
      "Leadership can treat rollback exceptions as open until the full incident review is published.",
    revisedException:
      "Leadership can treat rollback exceptions as open only until the reconciled waiver ledger and remediation evidence are both approved.",
    reason:
      "The incident-review dependency alone became stale after waiver closure was split from the later executive retrospective publication.",
    status: "current",
  },
] as const satisfies readonly ReleaseRollbackException[];

const initialAuditEvents = [
  {
    id: "rollback-waiver-audit-1",
    actor: "Avery",
    action: "initiated",
    detail:
      "Prepared rollback waiver ledgers with expiry comparisons ready for owner review.",
    timestamp: "2026-03-24 06:50 UTC",
  },
] as const satisfies readonly ReleaseRollbackWaiverAuditEvent[];

export const releaseRollbackWaiverFetchDelayMs = 180;
export const releaseRollbackWaiverMutationDelayMs = 220;

let run: ReleaseRollbackWaiverRun = { ...initialRun };
let ledgers: ReleaseRollbackWaiverLedger[] = initialLedgers.map((ledger) => ({
  ...ledger,
}));
let exceptions: ReleaseRollbackException[] = initialExceptions.map((item) => ({
  ...item,
}));
let auditEvents: ReleaseRollbackWaiverAuditEvent[] = initialAuditEvents.map(
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

function cloneWorkspace(): ReleaseRollbackWaiverWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    run: { ...run },
    ledgers: ledgers.map((ledger) => ({ ...ledger })),
    exceptions: exceptions.map((item) => ({ ...item })),
    auditEvents: auditEvents.map((event) => ({ ...event })),
  };
}

function nextAuditEventId(): ReleaseRollbackWaiverAuditEventId {
  const eventId =
    `rollback-waiver-audit-${nextAuditEventNumber}` as ReleaseRollbackWaiverAuditEventId;
  nextAuditEventNumber += 1;
  return eventId;
}

function appendAuditEvent(
  action: ReleaseRollbackWaiverAuditEvent["action"],
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

function nextQueuedLedger() {
  return ledgers.find((ledger) => ledger.status === "queued") ?? null;
}

function allExceptionsInvalidated() {
  return exceptions.every((item) => item.status === "invalidated");
}

function allExceptionsApproved() {
  return exceptions.every((item) => item.status === "approved");
}

export function resetReleaseRollbackWaiverMockState() {
  run = { ...initialRun };
  ledgers = initialLedgers.map((ledger) => ({ ...ledger }));
  exceptions = initialExceptions.map((item) => ({ ...item }));
  auditEvents = initialAuditEvents.map((event) => ({ ...event }));
  nextAuditEventNumber = initialAuditEvents.length + 1;
}

export function isReleaseRollbackWaiverAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function fetchReleaseRollbackWaiverWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseRollbackWaiverWorkspaceResponse> {
  return new Promise<ReleaseRollbackWaiverWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);
        resolve(cloneWorkspace());
      }, releaseRollbackWaiverFetchDelayMs);

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

export function startReleaseRollbackWaiver(
  input: StartReleaseRollbackWaiverInput,
  signal?: AbortSignal,
): Promise<ReleaseRollbackWaiverWorkspaceResponse> {
  return new Promise<ReleaseRollbackWaiverWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (run.id !== input.runId || run.stage !== "draft") {
          reject(
            new Error("Rollback waiver review is no longer ready to start."),
          );
          return;
        }

        ledgers = ledgers.map((ledger, index) =>
          index === 0
            ? {
                ...ledger,
                status: "awaiting-review",
                note: "Awaiting owner review before the next waiver ledger opens.",
              }
            : ledger,
        );

        run = {
          ...run,
          stage: "ledger-review",
          activeLedgerId: "rollback-waiver-ledger-1",
          publishBlockedReason:
            "Each waiver ledger must clear owner review before expired exceptions can be invalidated.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Avery - Incident lead",
        };

        appendAuditEvent(
          "initiated",
          "Avery",
          "Started rollback waiver review with the payments partner ledger.",
        );

        resolve(cloneWorkspace());
      }, releaseRollbackWaiverMutationDelayMs);

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

export function approveReleaseRollbackWaiverLedger(
  input: ApproveReleaseRollbackWaiverLedgerInput,
  signal?: AbortSignal,
): Promise<ReleaseRollbackWaiverWorkspaceResponse> {
  return new Promise<ReleaseRollbackWaiverWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        const ledger =
          ledgers.find((item) => item.id === input.ledgerId) ?? null;

        if (!ledger || ledger.status !== "awaiting-review") {
          reject(new Error("Waiver ledger approval is not available."));
          return;
        }

        ledgers = ledgers.map((item) =>
          item.id === input.ledgerId
            ? {
                ...item,
                status: "approved",
                note: `${item.owner} approved ${item.label}.`,
              }
            : item,
        );

        appendAuditEvent(
          "approved",
          ledger.owner,
          `${ledger.owner} approved ${ledger.label}.`,
        );

        const nextLedger = nextQueuedLedger();
        if (nextLedger) {
          ledgers = ledgers.map((item) =>
            item.id === nextLedger.id
              ? {
                  ...item,
                  status: "awaiting-review",
                  note: `${item.label} is the next rollback waiver ledger awaiting review.`,
                }
              : item,
          );

          run = {
            ...run,
            stage: "ledger-review",
            activeLedgerId: nextLedger.id,
            publishBlockedReason:
              "Finish waiver ledger review before expired exceptions can be invalidated.",
            updatedAt: formatTimestamp(new Date()),
            updatedBy: ledger.owner,
          };
          resolve(cloneWorkspace());
          return;
        }

        exceptions = exceptions.map((item) => ({ ...item, status: "stale" }));

        run = {
          ...run,
          stage: "expired-exception-review",
          activeLedgerId: null,
          publishBlockedReason:
            "Invalidate expired exceptions before approver sign-off can clear the rollback waiver ledger.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: ledger.owner,
        };

        resolve(cloneWorkspace());
      }, releaseRollbackWaiverMutationDelayMs);

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

export function invalidateReleaseRollbackExceptions(
  input: InvalidateReleaseRollbackExceptionsInput,
  signal?: AbortSignal,
): Promise<ReleaseRollbackWaiverWorkspaceResponse> {
  return new Promise<ReleaseRollbackWaiverWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (
          run.id !== input.runId ||
          run.stage !== "expired-exception-review"
        ) {
          reject(new Error("Expired-exception invalidation is not available."));
          return;
        }

        exceptions = exceptions.map((item) => ({
          ...item,
          status: "invalidated",
        }));

        run = {
          ...run,
          stage: "approver-signoff",
          publishBlockedReason:
            "Approver sign-off must confirm the revised waiver ledger before publish can proceed.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Avery - Incident lead",
        };

        appendAuditEvent(
          "invalidated",
          "Avery",
          "Invalidated expired rollback exceptions so only the revised waiver ledger remains eligible for publish.",
        );

        resolve(cloneWorkspace());
      }, releaseRollbackWaiverMutationDelayMs);

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

export function signOffReleaseRollbackWaiver(
  input: SignOffReleaseRollbackWaiverInput,
  signal?: AbortSignal,
): Promise<ReleaseRollbackWaiverWorkspaceResponse> {
  return new Promise<ReleaseRollbackWaiverWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (
          run.id !== input.runId ||
          run.stage !== "approver-signoff" ||
          !allExceptionsInvalidated()
        ) {
          reject(new Error("Approver sign-off is not available."));
          return;
        }

        exceptions = exceptions.map((item) => ({
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
          "Approver sign-off recorded for the revised rollback waiver ledger.",
        );

        resolve(cloneWorkspace());
      }, releaseRollbackWaiverMutationDelayMs);

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

export function publishReleaseRollbackWaiver(
  input: PublishReleaseRollbackWaiverInput,
  signal?: AbortSignal,
): Promise<ReleaseRollbackWaiverWorkspaceResponse> {
  return new Promise<ReleaseRollbackWaiverWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (
          run.id !== input.runId ||
          run.stage !== "ready-to-publish" ||
          !allExceptionsApproved()
        ) {
          reject(new Error("Rollback waiver publish is not available."));
          return;
        }

        ledgers = ledgers.map((item) => ({
          ...item,
          status: "published",
          note: `${item.label} published with the revised approved exception window.`,
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
          "Published the rollback waiver ledger after expired-exception invalidation and approver sign-off.",
        );

        resolve(cloneWorkspace());
      }, releaseRollbackWaiverMutationDelayMs);

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
