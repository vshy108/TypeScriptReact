import type {
  ApproveReleaseExitReadinessLedgerInput,
  InvalidateReleaseExitReadinessCriteriaInput,
  PublishReleaseExitReadinessInput,
  ReleaseExitReadinessAuditEvent,
  ReleaseExitReadinessAuditEventId,
  ReleaseExitReadinessCriterion,
  ReleaseExitReadinessLedger,
  ReleaseExitReadinessRun,
  ReleaseExitReadinessWorkspaceResponse,
  SignOffReleaseExitReadinessInput,
  StartReleaseExitReadinessInput,
} from "./types";

const initialRun = {
  id: "exit-readiness-run-1",
  title: "Exit readiness ledgers",
  summary:
    "Review exit readiness ledgers by owner, invalidate stale criteria that no longer match the verified recovery posture, collect approver sign-off on the revised exit criteria, and only then publish the final exit readiness packet.",
  stage: "draft",
  activeLedgerId: null,
  publishBlockedReason:
    "Ledger review, stale-criterion invalidation, and approver sign-off must complete before the exit readiness packet can publish.",
  updatedAt: "2026-03-24 09:10 UTC",
  updatedBy: "Avery - Incident lead",
} as const satisfies ReleaseExitReadinessRun;

const initialLedgers = [
  {
    id: "exit-readiness-ledger-1",
    label: "Checkout exit ledger",
    owner: "Mina",
    audience: "Launch operators",
    status: "queued",
    note: "Checkout exit criteria are reviewed first because they determine whether customer traffic can safely leave the recovery posture.",
  },
  {
    id: "exit-readiness-ledger-2",
    label: "Support exit ledger",
    owner: "Jordan",
    audience: "Support leads",
    status: "queued",
    note: "Support exit criteria are reviewed second so escalation paths only close after the revised checkout criteria are approved.",
  },
  {
    id: "exit-readiness-ledger-3",
    label: "Executive exit ledger",
    owner: "Priya",
    audience: "Executive stakeholders",
    status: "queued",
    note: "Executive exit criteria are reviewed last so the final readiness packet references only approved operational criteria.",
  },
] as const satisfies readonly ReleaseExitReadinessLedger[];

const initialCriteria = [
  {
    id: "exit-readiness-criterion-1",
    ledger: "Checkout exit ledger",
    staleCriterion:
      "Checkout can exit recovery once primary-region latency stays under 300 ms for 30 minutes.",
    revisedCriterion:
      "Checkout can exit recovery once latency stays under 250 ms for 90 minutes and replay backlog remains clear across every recovery region.",
    reason:
      "The earlier criterion became stale once cross-region replay stability was added to the exit bar, not just primary-region latency.",
    status: "current",
  },
  {
    id: "exit-readiness-criterion-2",
    ledger: "Support exit ledger",
    staleCriterion:
      "Support can close the incident lane once new tickets trend down for one hour.",
    revisedCriterion:
      "Support can close the incident lane only after tickets trend down for two hours and no macro overrides remain active.",
    reason:
      "The previous support criterion became stale when macro overrides remained necessary beyond the first hour of ticket improvement.",
    status: "current",
  },
  {
    id: "exit-readiness-criterion-3",
    ledger: "Executive exit ledger",
    staleCriterion:
      "Executives can declare exit readiness as soon as checkout recovery is complete.",
    revisedCriterion:
      "Executives can declare exit readiness only after checkout, support, and customer-facing exit criteria are all approved.",
    reason:
      "The checkout-only criterion became stale once executive readiness language was tied to the full exit-ledger set.",
    status: "current",
  },
] as const satisfies readonly ReleaseExitReadinessCriterion[];

const initialAuditEvents = [
  {
    id: "exit-readiness-audit-1",
    actor: "Avery",
    action: "initiated",
    detail:
      "Prepared exit readiness ledgers with owner review and criterion rows ready for reconciliation.",
    timestamp: "2026-03-24 09:05 UTC",
  },
] as const satisfies readonly ReleaseExitReadinessAuditEvent[];

export const releaseExitReadinessFetchDelayMs = 180;
export const releaseExitReadinessMutationDelayMs = 220;

let run: ReleaseExitReadinessRun = { ...initialRun };
let ledgers: ReleaseExitReadinessLedger[] = initialLedgers.map((ledger) => ({
  ...ledger,
}));
let criteria: ReleaseExitReadinessCriterion[] = initialCriteria.map((item) => ({
  ...item,
}));
let auditEvents: ReleaseExitReadinessAuditEvent[] = initialAuditEvents.map(
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

function cloneWorkspace(): ReleaseExitReadinessWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    run: { ...run },
    ledgers: ledgers.map((ledger) => ({ ...ledger })),
    criteria: criteria.map((item) => ({ ...item })),
    auditEvents: auditEvents.map((event) => ({ ...event })),
  };
}

function nextAuditEventId(): ReleaseExitReadinessAuditEventId {
  const eventId =
    `exit-readiness-audit-${nextAuditEventNumber}` as ReleaseExitReadinessAuditEventId;
  nextAuditEventNumber += 1;
  return eventId;
}

function appendAuditEvent(
  action: ReleaseExitReadinessAuditEvent["action"],
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

function allCriteriaInvalidated() {
  return criteria.every((item) => item.status === "invalidated");
}

function allCriteriaApproved() {
  return criteria.every((item) => item.status === "approved");
}

export function resetReleaseExitReadinessMockState() {
  run = { ...initialRun };
  ledgers = initialLedgers.map((ledger) => ({ ...ledger }));
  criteria = initialCriteria.map((item) => ({ ...item }));
  auditEvents = initialAuditEvents.map((event) => ({ ...event }));
  nextAuditEventNumber = initialAuditEvents.length + 1;
}

export function isReleaseExitReadinessAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function fetchReleaseExitReadinessWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseExitReadinessWorkspaceResponse> {
  return new Promise<ReleaseExitReadinessWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);
        resolve(cloneWorkspace());
      }, releaseExitReadinessFetchDelayMs);

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

export function startReleaseExitReadiness(
  input: StartReleaseExitReadinessInput,
  signal?: AbortSignal,
): Promise<ReleaseExitReadinessWorkspaceResponse> {
  return new Promise<ReleaseExitReadinessWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (run.id !== input.runId || run.stage !== "draft") {
          reject(
            new Error("Exit readiness review is no longer ready to start."),
          );
          return;
        }

        ledgers = ledgers.map((ledger, index) =>
          index === 0
            ? {
                ...ledger,
                status: "awaiting-review",
                note: "Awaiting owner review before the next exit readiness ledger opens.",
              }
            : ledger,
        );

        run = {
          ...run,
          stage: "ledger-review",
          activeLedgerId: "exit-readiness-ledger-1",
          publishBlockedReason:
            "Each exit readiness ledger must clear owner review before stale criteria can be invalidated.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Avery - Incident lead",
        };

        appendAuditEvent(
          "initiated",
          "Avery",
          "Started exit readiness review with the checkout exit ledger.",
        );

        resolve(cloneWorkspace());
      }, releaseExitReadinessMutationDelayMs);

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

export function approveReleaseExitReadinessLedger(
  input: ApproveReleaseExitReadinessLedgerInput,
  signal?: AbortSignal,
): Promise<ReleaseExitReadinessWorkspaceResponse> {
  return new Promise<ReleaseExitReadinessWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        const ledger =
          ledgers.find((item) => item.id === input.ledgerId) ?? null;

        if (!ledger || ledger.status !== "awaiting-review") {
          reject(new Error("Exit readiness ledger approval is not available."));
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
                  note: `${item.label} is the next exit readiness ledger awaiting review.`,
                }
              : item,
          );

          run = {
            ...run,
            stage: "ledger-review",
            activeLedgerId: nextLedger.id,
            publishBlockedReason:
              "Finish exit readiness ledger review before stale criteria can be invalidated.",
            updatedAt: formatTimestamp(new Date()),
            updatedBy: ledger.owner,
          };
          resolve(cloneWorkspace());
          return;
        }

        criteria = criteria.map((item) => ({ ...item, status: "stale" }));

        run = {
          ...run,
          stage: "stale-criterion-review",
          activeLedgerId: null,
          publishBlockedReason:
            "Invalidate stale criteria before approver sign-off can clear the exit readiness packet.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: ledger.owner,
        };

        resolve(cloneWorkspace());
      }, releaseExitReadinessMutationDelayMs);

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

export function invalidateReleaseExitReadinessCriteria(
  input: InvalidateReleaseExitReadinessCriteriaInput,
  signal?: AbortSignal,
): Promise<ReleaseExitReadinessWorkspaceResponse> {
  return new Promise<ReleaseExitReadinessWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (run.id !== input.runId || run.stage !== "stale-criterion-review") {
          reject(new Error("Stale-criterion invalidation is not available."));
          return;
        }

        criteria = criteria.map((item) => ({
          ...item,
          status: "invalidated",
        }));

        run = {
          ...run,
          stage: "approver-signoff",
          publishBlockedReason:
            "Approver sign-off must confirm the revised exit criteria before publish can proceed.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Avery - Incident lead",
        };

        appendAuditEvent(
          "invalidated",
          "Avery",
          "Invalidated stale exit readiness criteria so only the revised packet remains eligible for publish.",
        );

        resolve(cloneWorkspace());
      }, releaseExitReadinessMutationDelayMs);

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

export function signOffReleaseExitReadiness(
  input: SignOffReleaseExitReadinessInput,
  signal?: AbortSignal,
): Promise<ReleaseExitReadinessWorkspaceResponse> {
  return new Promise<ReleaseExitReadinessWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (
          run.id !== input.runId ||
          run.stage !== "approver-signoff" ||
          !allCriteriaInvalidated()
        ) {
          reject(new Error("Approver sign-off is not available."));
          return;
        }

        criteria = criteria.map((item) => ({
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
          "Approver sign-off recorded for the revised exit readiness packet.",
        );

        resolve(cloneWorkspace());
      }, releaseExitReadinessMutationDelayMs);

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

export function publishReleaseExitReadiness(
  input: PublishReleaseExitReadinessInput,
  signal?: AbortSignal,
): Promise<ReleaseExitReadinessWorkspaceResponse> {
  return new Promise<ReleaseExitReadinessWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (
          run.id !== input.runId ||
          run.stage !== "ready-to-publish" ||
          !allCriteriaApproved()
        ) {
          reject(new Error("Exit readiness publish is not available."));
          return;
        }

        ledgers = ledgers.map((ledger) => ({
          ...ledger,
          status: "published",
          note: `${ledger.label} published with the revised approved exit criteria.`,
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
          "Published the exit readiness packet after stale-criterion invalidation and approver sign-off.",
        );

        resolve(cloneWorkspace());
      }, releaseExitReadinessMutationDelayMs);

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
