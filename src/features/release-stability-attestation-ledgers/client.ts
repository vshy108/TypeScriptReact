import type {
  ApproveReleaseStabilityAttestationLedgerInput,
  InvalidateReleaseStabilityAttestationSignalsInput,
  PublishReleaseStabilityAttestationInput,
  ReleaseStabilityAttestationAuditEvent,
  ReleaseStabilityAttestationAuditEventId,
  ReleaseStabilityAttestationLedger,
  ReleaseStabilityAttestationRun,
  ReleaseStabilityAttestationSignal,
  ReleaseStabilityAttestationWorkspaceResponse,
  SignOffReleaseStabilityAttestationInput,
  StartReleaseStabilityAttestationInput,
} from "./types";

const initialRun = {
  id: "stability-attestation-run-1",
  title: "Stability attestation ledgers",
  summary:
    "Review stability attestation ledgers by owner, invalidate stale stability signals that no longer match the verified recovery posture, collect approver sign-off on the revised attestation signals, and only then publish the final stability packet.",
  stage: "draft",
  activeLedgerId: null,
  publishBlockedReason:
    "Ledger review, stale-signal invalidation, and approver sign-off must complete before the stability attestation packet can publish.",
  updatedAt: "2026-03-24 09:45 UTC",
  updatedBy: "Avery - Incident lead",
} as const satisfies ReleaseStabilityAttestationRun;

const initialLedgers = [
  {
    id: "stability-attestation-ledger-1",
    label: "Checkout stability ledger",
    owner: "Mina",
    audience: "Launch operators",
    status: "queued",
    note: "Checkout stability signals are reviewed first because they determine whether the customer path can be attested as stable again.",
  },
  {
    id: "stability-attestation-ledger-2",
    label: "Support stability ledger",
    owner: "Jordan",
    audience: "Support leads",
    status: "queued",
    note: "Support stability signals are reviewed second so escalation language only closes after the revised checkout attestation is approved.",
  },
  {
    id: "stability-attestation-ledger-3",
    label: "Executive stability ledger",
    owner: "Priya",
    audience: "Executive stakeholders",
    status: "queued",
    note: "Executive stability signals are reviewed last so the final attestation packet references only approved operational signals.",
  },
] as const satisfies readonly ReleaseStabilityAttestationLedger[];

const initialSignals = [
  {
    id: "stability-attestation-signal-1",
    ledger: "Checkout stability ledger",
    staleSignal:
      "Checkout is stable once primary-region retries stay below 2% for 30 minutes.",
    revisedSignal:
      "Checkout is stable once retries stay below 1% for 90 minutes and replay lag remains flat across every recovery region.",
    reason:
      "The earlier signal became stale once replay lag and cross-region stability became part of the attestation bar, not just primary-region retries.",
    status: "current",
  },
  {
    id: "stability-attestation-signal-2",
    ledger: "Support stability ledger",
    staleSignal:
      "Support can attest stability once escalation volume trends down for one hour.",
    revisedSignal:
      "Support can attest stability only after escalation volume trends down for two hours and no operator overrides remain active.",
    reason:
      "The previous support signal became stale once operator overrides extended beyond the initial improvement window.",
    status: "current",
  },
  {
    id: "stability-attestation-signal-3",
    ledger: "Executive stability ledger",
    staleSignal:
      "Executives can attest stability as soon as checkout recovery is complete.",
    revisedSignal:
      "Executives can attest stability only after checkout, support, and customer-facing stability signals are all approved.",
    reason:
      "The checkout-only signal became stale once executive stability language was tied to the full attestation ledger set.",
    status: "current",
  },
] as const satisfies readonly ReleaseStabilityAttestationSignal[];

const initialAuditEvents = [
  {
    id: "stability-attestation-audit-1",
    actor: "Avery",
    action: "initiated",
    detail:
      "Prepared stability attestation ledgers with owner review and signal rows ready for reconciliation.",
    timestamp: "2026-03-24 09:40 UTC",
  },
] as const satisfies readonly ReleaseStabilityAttestationAuditEvent[];

export const releaseStabilityAttestationFetchDelayMs = 180;
export const releaseStabilityAttestationMutationDelayMs = 220;

let run: ReleaseStabilityAttestationRun = { ...initialRun };
let ledgers: ReleaseStabilityAttestationLedger[] = initialLedgers.map(
  (ledger) => ({
    ...ledger,
  }),
);
let signals: ReleaseStabilityAttestationSignal[] = initialSignals.map(
  (item) => ({
    ...item,
  }),
);
let auditEvents: ReleaseStabilityAttestationAuditEvent[] =
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

function cloneWorkspace(): ReleaseStabilityAttestationWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    run: { ...run },
    ledgers: ledgers.map((ledger) => ({ ...ledger })),
    signals: signals.map((item) => ({ ...item })),
    auditEvents: auditEvents.map((event) => ({ ...event })),
  };
}

function nextAuditEventId(): ReleaseStabilityAttestationAuditEventId {
  const eventId =
    `stability-attestation-audit-${nextAuditEventNumber}` as ReleaseStabilityAttestationAuditEventId;
  nextAuditEventNumber += 1;
  return eventId;
}

function appendAuditEvent(
  action: ReleaseStabilityAttestationAuditEvent["action"],
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

function allSignalsInvalidated() {
  return signals.every((item) => item.status === "invalidated");
}

function allSignalsApproved() {
  return signals.every((item) => item.status === "approved");
}

export function resetReleaseStabilityAttestationMockState() {
  run = { ...initialRun };
  ledgers = initialLedgers.map((ledger) => ({ ...ledger }));
  signals = initialSignals.map((item) => ({ ...item }));
  auditEvents = initialAuditEvents.map((event) => ({ ...event }));
  nextAuditEventNumber = initialAuditEvents.length + 1;
}

export function isReleaseStabilityAttestationAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function fetchReleaseStabilityAttestationWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseStabilityAttestationWorkspaceResponse> {
  return new Promise<ReleaseStabilityAttestationWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);
        resolve(cloneWorkspace());
      }, releaseStabilityAttestationFetchDelayMs);

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

export function startReleaseStabilityAttestation(
  input: StartReleaseStabilityAttestationInput,
  signal?: AbortSignal,
): Promise<ReleaseStabilityAttestationWorkspaceResponse> {
  return new Promise<ReleaseStabilityAttestationWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (run.id !== input.runId || run.stage !== "draft") {
          reject(
            new Error(
              "Stability attestation review is no longer ready to start.",
            ),
          );
          return;
        }

        ledgers = ledgers.map((ledger, index) =>
          index === 0
            ? {
                ...ledger,
                status: "awaiting-review",
                note: "Awaiting owner review before the next stability attestation ledger opens.",
              }
            : ledger,
        );

        run = {
          ...run,
          stage: "ledger-review",
          activeLedgerId: "stability-attestation-ledger-1",
          publishBlockedReason:
            "Each stability attestation ledger must clear owner review before stale signals can be invalidated.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Avery - Incident lead",
        };

        appendAuditEvent(
          "initiated",
          "Avery",
          "Started stability attestation review with the checkout stability ledger.",
        );

        resolve(cloneWorkspace());
      }, releaseStabilityAttestationMutationDelayMs);

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

export function approveReleaseStabilityAttestationLedger(
  input: ApproveReleaseStabilityAttestationLedgerInput,
  signal?: AbortSignal,
): Promise<ReleaseStabilityAttestationWorkspaceResponse> {
  return new Promise<ReleaseStabilityAttestationWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        const ledger =
          ledgers.find((item) => item.id === input.ledgerId) ?? null;

        if (!ledger || ledger.status !== "awaiting-review") {
          reject(
            new Error(
              "Stability attestation ledger approval is not available.",
            ),
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
                  note: `${item.label} is the next stability attestation ledger awaiting review.`,
                }
              : item,
          );

          run = {
            ...run,
            stage: "ledger-review",
            activeLedgerId: nextLedger.id,
            publishBlockedReason:
              "Finish stability attestation ledger review before stale signals can be invalidated.",
            updatedAt: formatTimestamp(new Date()),
            updatedBy: ledger.owner,
          };
          resolve(cloneWorkspace());
          return;
        }

        signals = signals.map((item) => ({ ...item, status: "stale" }));

        run = {
          ...run,
          stage: "stale-signal-review",
          activeLedgerId: null,
          publishBlockedReason:
            "Invalidate stale signals before approver sign-off can clear the stability attestation packet.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: ledger.owner,
        };

        resolve(cloneWorkspace());
      }, releaseStabilityAttestationMutationDelayMs);

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

export function invalidateReleaseStabilityAttestationSignals(
  input: InvalidateReleaseStabilityAttestationSignalsInput,
  signal?: AbortSignal,
): Promise<ReleaseStabilityAttestationWorkspaceResponse> {
  return new Promise<ReleaseStabilityAttestationWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (run.id !== input.runId || run.stage !== "stale-signal-review") {
          reject(new Error("Stale-signal invalidation is not available."));
          return;
        }

        signals = signals.map((item) => ({
          ...item,
          status: "invalidated",
        }));

        run = {
          ...run,
          stage: "approver-signoff",
          publishBlockedReason:
            "Approver sign-off must confirm the revised stability signals before publish can proceed.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Avery - Incident lead",
        };

        appendAuditEvent(
          "invalidated",
          "Avery",
          "Invalidated stale stability signals so only the revised packet remains eligible for publish.",
        );

        resolve(cloneWorkspace());
      }, releaseStabilityAttestationMutationDelayMs);

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

export function signOffReleaseStabilityAttestation(
  input: SignOffReleaseStabilityAttestationInput,
  signal?: AbortSignal,
): Promise<ReleaseStabilityAttestationWorkspaceResponse> {
  return new Promise<ReleaseStabilityAttestationWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (
          run.id !== input.runId ||
          run.stage !== "approver-signoff" ||
          !allSignalsInvalidated()
        ) {
          reject(new Error("Approver sign-off is not available."));
          return;
        }

        signals = signals.map((item) => ({
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
          "Approver sign-off recorded for the revised stability attestation packet.",
        );

        resolve(cloneWorkspace());
      }, releaseStabilityAttestationMutationDelayMs);

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

export function publishReleaseStabilityAttestation(
  input: PublishReleaseStabilityAttestationInput,
  signal?: AbortSignal,
): Promise<ReleaseStabilityAttestationWorkspaceResponse> {
  return new Promise<ReleaseStabilityAttestationWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (
          run.id !== input.runId ||
          run.stage !== "ready-to-publish" ||
          !allSignalsApproved()
        ) {
          reject(new Error("Stability attestation publish is not available."));
          return;
        }

        ledgers = ledgers.map((ledger) => ({
          ...ledger,
          status: "published",
          note: `${ledger.label} published with the revised approved stability signals.`,
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
          "Published the stability attestation packet after stale-signal invalidation and approver sign-off.",
        );

        resolve(cloneWorkspace());
      }, releaseStabilityAttestationMutationDelayMs);

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
