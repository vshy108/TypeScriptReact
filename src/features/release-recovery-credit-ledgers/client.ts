import type {
  ApproveReleaseRecoveryCreditLedgerInput,
  InvalidateReleaseRecoveryCreditsInput,
  PublishReleaseRecoveryCreditInput,
  ReleaseRecoveryCredit,
  ReleaseRecoveryCreditAuditEvent,
  ReleaseRecoveryCreditAuditEventId,
  ReleaseRecoveryCreditLedger,
  ReleaseRecoveryCreditRun,
  ReleaseRecoveryCreditWorkspaceResponse,
  SignOffReleaseRecoveryCreditInput,
  StartReleaseRecoveryCreditInput,
} from "./types";

const initialRun = {
  id: "recovery-credit-run-1",
  title: "Recovery credit ledgers",
  summary:
    "Review each recovery credit ledger, invalidate stale credits that no longer match the verified recovery scope, collect approver sign-off on the revised credit policy, and only then publish the reconciled credit plan.",
  stage: "draft",
  activeLedgerId: null,
  publishBlockedReason:
    "Ledger review, stale-credit invalidation, and approver sign-off must complete before the recovery credit ledger can publish.",
  updatedAt: "2026-03-24 07:15 UTC",
  updatedBy: "Avery - Incident lead",
} as const satisfies ReleaseRecoveryCreditRun;

const initialLedgers = [
  {
    id: "recovery-credit-ledger-1",
    label: "Checkout credit ledger",
    owner: "Mina",
    audience: "Affected merchants",
    status: "queued",
    note: "Checkout credits are reviewed first because they cover the largest and most visible set of impacted merchants.",
  },
  {
    id: "recovery-credit-ledger-2",
    label: "Support concession ledger",
    owner: "Jordan",
    audience: "Support escalations",
    status: "queued",
    note: "Support concessions are reviewed second so the agent policy matches the approved merchant credit posture.",
  },
  {
    id: "recovery-credit-ledger-3",
    label: "Strategic account ledger",
    owner: "Priya",
    audience: "Strategic accounts",
    status: "queued",
    note: "Strategic account credits are reviewed last so they only reference the final approved baseline from merchant and support ledgers.",
  },
] as const satisfies readonly ReleaseRecoveryCreditLedger[];

const initialCredits = [
  {
    id: "recovery-credit-1",
    ledger: "Checkout credit ledger",
    staleCredit:
      "All merchants impacted during the rollback window receive a full month of credit automatically.",
    revisedCredit:
      "Merchants impacted for more than two hours receive prorated credits automatically, while shorter-impact cases receive manual review support.",
    reason:
      "The blanket full-month credit became stale once the verified outage window and impact segmentation were narrowed during recovery review.",
    status: "current",
  },
  {
    id: "recovery-credit-2",
    ledger: "Support concession ledger",
    staleCredit:
      "Support can offer discretionary refund credits on every affected case immediately.",
    revisedCredit:
      "Support can offer discretionary refund credits only for cases outside the automated credit policy after finance review confirms eligibility.",
    reason:
      "The original concession language became stale once automated credits covered the majority of cases and finance added exception handling rules.",
    status: "current",
  },
  {
    id: "recovery-credit-3",
    ledger: "Strategic account ledger",
    staleCredit:
      "Strategic accounts can be promised bespoke recovery credits this week.",
    revisedCredit:
      "Strategic accounts can be promised bespoke recovery credits only after the reconciled merchant and support ledgers are approved.",
    reason:
      "The earlier promise became stale because bespoke credit decisions now depend on the final approved baseline across the other ledgers.",
    status: "current",
  },
] as const satisfies readonly ReleaseRecoveryCredit[];

const initialAuditEvents = [
  {
    id: "recovery-credit-audit-1",
    actor: "Avery",
    action: "initiated",
    detail:
      "Prepared recovery credit ledgers with stale-credit comparisons ready for owner review.",
    timestamp: "2026-03-24 07:10 UTC",
  },
] as const satisfies readonly ReleaseRecoveryCreditAuditEvent[];

export const releaseRecoveryCreditFetchDelayMs = 180;
export const releaseRecoveryCreditMutationDelayMs = 220;

let run: ReleaseRecoveryCreditRun = { ...initialRun };
let ledgers: ReleaseRecoveryCreditLedger[] = initialLedgers.map((ledger) => ({
  ...ledger,
}));
let credits: ReleaseRecoveryCredit[] = initialCredits.map((credit) => ({
  ...credit,
}));
let auditEvents: ReleaseRecoveryCreditAuditEvent[] = initialAuditEvents.map(
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

function cloneWorkspace(): ReleaseRecoveryCreditWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    run: { ...run },
    ledgers: ledgers.map((ledger) => ({ ...ledger })),
    credits: credits.map((credit) => ({ ...credit })),
    auditEvents: auditEvents.map((event) => ({ ...event })),
  };
}

function nextAuditEventId(): ReleaseRecoveryCreditAuditEventId {
  const eventId =
    `recovery-credit-audit-${nextAuditEventNumber}` as ReleaseRecoveryCreditAuditEventId;
  nextAuditEventNumber += 1;
  return eventId;
}

function appendAuditEvent(
  action: ReleaseRecoveryCreditAuditEvent["action"],
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

function allCreditsInvalidated() {
  return credits.every((credit) => credit.status === "invalidated");
}

function allCreditsApproved() {
  return credits.every((credit) => credit.status === "approved");
}

export function resetReleaseRecoveryCreditMockState() {
  run = { ...initialRun };
  ledgers = initialLedgers.map((ledger) => ({ ...ledger }));
  credits = initialCredits.map((credit) => ({ ...credit }));
  auditEvents = initialAuditEvents.map((event) => ({ ...event }));
  nextAuditEventNumber = initialAuditEvents.length + 1;
}

export function isReleaseRecoveryCreditAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function fetchReleaseRecoveryCreditWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseRecoveryCreditWorkspaceResponse> {
  return new Promise<ReleaseRecoveryCreditWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);
        resolve(cloneWorkspace());
      }, releaseRecoveryCreditFetchDelayMs);

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

export function startReleaseRecoveryCredit(
  input: StartReleaseRecoveryCreditInput,
  signal?: AbortSignal,
): Promise<ReleaseRecoveryCreditWorkspaceResponse> {
  return new Promise<ReleaseRecoveryCreditWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (run.id !== input.runId || run.stage !== "draft") {
          reject(
            new Error("Recovery credit review is no longer ready to start."),
          );
          return;
        }

        ledgers = ledgers.map((ledger, index) =>
          index === 0
            ? {
                ...ledger,
                status: "awaiting-review",
                note: "Awaiting owner review before the next recovery credit ledger opens.",
              }
            : ledger,
        );

        run = {
          ...run,
          stage: "ledger-review",
          activeLedgerId: "recovery-credit-ledger-1",
          publishBlockedReason:
            "Each recovery credit ledger must clear owner review before stale credits can be invalidated.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Avery - Incident lead",
        };

        appendAuditEvent(
          "initiated",
          "Avery",
          "Started recovery credit review with the checkout credit ledger.",
        );

        resolve(cloneWorkspace());
      }, releaseRecoveryCreditMutationDelayMs);

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

export function approveReleaseRecoveryCreditLedger(
  input: ApproveReleaseRecoveryCreditLedgerInput,
  signal?: AbortSignal,
): Promise<ReleaseRecoveryCreditWorkspaceResponse> {
  return new Promise<ReleaseRecoveryCreditWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        const ledger =
          ledgers.find((item) => item.id === input.ledgerId) ?? null;

        if (!ledger || ledger.status !== "awaiting-review") {
          reject(
            new Error("Recovery credit ledger approval is not available."),
          );
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
                  note: `${item.label} is the next recovery credit ledger awaiting review.`,
                }
              : item,
          );

          run = {
            ...run,
            stage: "ledger-review",
            activeLedgerId: nextLedger.id,
            publishBlockedReason:
              "Finish recovery credit review before stale credits can be invalidated.",
            updatedAt: formatTimestamp(new Date()),
            updatedBy: ledger.owner,
          };
          resolve(cloneWorkspace());
          return;
        }

        credits = credits.map((credit) => ({ ...credit, status: "stale" }));

        run = {
          ...run,
          stage: "stale-credit-review",
          activeLedgerId: null,
          publishBlockedReason:
            "Invalidate stale credits before approver sign-off can clear the recovery credit ledger.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: ledger.owner,
        };

        resolve(cloneWorkspace());
      }, releaseRecoveryCreditMutationDelayMs);

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

export function invalidateReleaseRecoveryCredits(
  input: InvalidateReleaseRecoveryCreditsInput,
  signal?: AbortSignal,
): Promise<ReleaseRecoveryCreditWorkspaceResponse> {
  return new Promise<ReleaseRecoveryCreditWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (run.id !== input.runId || run.stage !== "stale-credit-review") {
          reject(new Error("Stale-credit invalidation is not available."));
          return;
        }

        credits = credits.map((credit) => ({
          ...credit,
          status: "invalidated",
        }));

        run = {
          ...run,
          stage: "approver-signoff",
          publishBlockedReason:
            "Approver sign-off must confirm the revised recovery credits before publish can proceed.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Avery - Incident lead",
        };

        appendAuditEvent(
          "invalidated",
          "Avery",
          "Invalidated stale recovery credits so only the revised ledger remains eligible for publish.",
        );

        resolve(cloneWorkspace());
      }, releaseRecoveryCreditMutationDelayMs);

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

export function signOffReleaseRecoveryCredit(
  input: SignOffReleaseRecoveryCreditInput,
  signal?: AbortSignal,
): Promise<ReleaseRecoveryCreditWorkspaceResponse> {
  return new Promise<ReleaseRecoveryCreditWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (
          run.id !== input.runId ||
          run.stage !== "approver-signoff" ||
          !allCreditsInvalidated()
        ) {
          reject(new Error("Approver sign-off is not available."));
          return;
        }

        credits = credits.map((credit) => ({ ...credit, status: "approved" }));

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
          "Approver sign-off recorded for the revised recovery credit ledger.",
        );

        resolve(cloneWorkspace());
      }, releaseRecoveryCreditMutationDelayMs);

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

export function publishReleaseRecoveryCredit(
  input: PublishReleaseRecoveryCreditInput,
  signal?: AbortSignal,
): Promise<ReleaseRecoveryCreditWorkspaceResponse> {
  return new Promise<ReleaseRecoveryCreditWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (
          run.id !== input.runId ||
          run.stage !== "ready-to-publish" ||
          !allCreditsApproved()
        ) {
          reject(new Error("Recovery credit publish is not available."));
          return;
        }

        ledgers = ledgers.map((ledger) => ({
          ...ledger,
          status: "published",
          note: `${ledger.label} published with the revised approved credit policy.`,
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
          "Published the recovery credit ledger after stale-credit invalidation and approver sign-off.",
        );

        resolve(cloneWorkspace());
      }, releaseRecoveryCreditMutationDelayMs);

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
