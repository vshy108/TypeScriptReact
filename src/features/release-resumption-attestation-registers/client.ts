import type {
  ApproveReleaseResumptionAttestationRegisterInput,
  InvalidateReleaseResumptionAttestationChecksInput,
  PublishReleaseResumptionAttestationInput,
  ReleaseResumptionAttestationAuditEvent,
  ReleaseResumptionAttestationAuditEventId,
  ReleaseResumptionAttestationCheck,
  ReleaseResumptionAttestationRegister,
  ReleaseResumptionAttestationRun,
  ReleaseResumptionAttestationWorkspaceResponse,
  SignOffReleaseResumptionAttestationInput,
  StartReleaseResumptionAttestationInput,
} from "./types";

const initialRun = {
  id: "resumption-attestation-run-1",
  title: "Resumption attestation registers",
  summary:
    "Review service-resumption attestation registers by owner, invalidate stale resumption checks that no longer match the verified restart posture, collect approver sign-off on the revised checks, and only then publish the final resumption packet.",
  stage: "draft",
  activeRegisterId: null,
  publishBlockedReason:
    "Register review, stale-check invalidation, and approver sign-off must complete before the resumption packet can publish.",
  updatedAt: "2026-03-24 10:05 UTC",
  updatedBy: "Avery - Incident lead",
} as const satisfies ReleaseResumptionAttestationRun;

const initialRegisters = [
  {
    id: "resumption-attestation-register-1",
    label: "Checkout resumption register",
    owner: "Mina",
    audience: "Launch operators",
    status: "queued",
    note: "Checkout resumption is reviewed first because customer traffic only returns once the restart register clears.",
  },
  {
    id: "resumption-attestation-register-2",
    label: "Support resumption register",
    owner: "Jordan",
    audience: "Support leads",
    status: "queued",
    note: "Support resumption is reviewed second so escalation coverage only resumes after the customer lane is stable again.",
  },
  {
    id: "resumption-attestation-register-3",
    label: "Finance resumption register",
    owner: "Priya",
    audience: "Executive stakeholders",
    status: "queued",
    note: "Finance resumption is reviewed last so the final packet references only approved customer and support restart checks.",
  },
] as const satisfies readonly ReleaseResumptionAttestationRegister[];

const initialChecks = [
  {
    id: "resumption-attestation-check-1",
    register: "Checkout resumption register",
    staleCheck:
      "Checkout can resume once write retries remain below 2% for 30 minutes.",
    revisedCheck:
      "Checkout can resume once write retries remain below 1% for 90 minutes and replay lag stays flat across every recovery shard.",
    reason:
      "The earlier checkout check became stale once replay lag and shard-wide recovery became part of the restart threshold.",
    status: "current",
  },
  {
    id: "resumption-attestation-check-2",
    register: "Support resumption register",
    staleCheck:
      "Support can resume normal queue handling once backlog age trends down for one hour.",
    revisedCheck:
      "Support can resume normal queue handling only after backlog age trends down for two hours and no manual routing overrides remain active.",
    reason:
      "The earlier support check became stale once manual routing overrides extended beyond the initial recovery window.",
    status: "current",
  },
  {
    id: "resumption-attestation-check-3",
    register: "Finance resumption register",
    staleCheck:
      "Finance can resume settlement once checkout restarts in the primary region.",
    revisedCheck:
      "Finance can resume settlement only after checkout, support, and reconciliation checks are all approved.",
    reason:
      "The checkout-only settlement check became stale once finance restart language depended on the full resumption packet.",
    status: "current",
  },
] as const satisfies readonly ReleaseResumptionAttestationCheck[];

const initialAuditEvents = [
  {
    id: "resumption-attestation-audit-1",
    actor: "Avery",
    action: "initiated",
    detail:
      "Prepared the resumption attestation registers with owner review and check rows ready for reconciliation.",
    timestamp: "2026-03-24 10:00 UTC",
  },
] as const satisfies readonly ReleaseResumptionAttestationAuditEvent[];

export const releaseResumptionAttestationFetchDelayMs = 190;
export const releaseResumptionAttestationMutationDelayMs = 230;

let run: ReleaseResumptionAttestationRun = { ...initialRun };
let registers: ReleaseResumptionAttestationRegister[] = initialRegisters.map(
  (register) => ({ ...register }),
);
let checks: ReleaseResumptionAttestationCheck[] = initialChecks.map(
  (check) => ({
    ...check,
  }),
);
let auditEvents: ReleaseResumptionAttestationAuditEvent[] =
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

function cloneWorkspace(): ReleaseResumptionAttestationWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    run: { ...run },
    registers: registers.map((register) => ({ ...register })),
    checks: checks.map((check) => ({ ...check })),
    auditEvents: auditEvents.map((event) => ({ ...event })),
  };
}

function nextAuditEventId(): ReleaseResumptionAttestationAuditEventId {
  const eventId =
    `resumption-attestation-audit-${nextAuditEventNumber}` as ReleaseResumptionAttestationAuditEventId;
  nextAuditEventNumber += 1;
  return eventId;
}

function appendAuditEvent(
  action: ReleaseResumptionAttestationAuditEvent["action"],
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

function nextQueuedRegister() {
  return registers.find((register) => register.status === "queued") ?? null;
}

function allChecksInvalidated() {
  return checks.every((check) => check.status === "invalidated");
}

function allChecksApproved() {
  return checks.every((check) => check.status === "approved");
}

export function resetReleaseResumptionAttestationMockState() {
  run = { ...initialRun };
  registers = initialRegisters.map((register) => ({ ...register }));
  checks = initialChecks.map((check) => ({ ...check }));
  auditEvents = initialAuditEvents.map((event) => ({ ...event }));
  nextAuditEventNumber = initialAuditEvents.length + 1;
}

export function isReleaseResumptionAttestationAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function fetchReleaseResumptionAttestationWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseResumptionAttestationWorkspaceResponse> {
  return new Promise<ReleaseResumptionAttestationWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);
        resolve(cloneWorkspace());
      }, releaseResumptionAttestationFetchDelayMs);

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

export function startReleaseResumptionAttestation(
  input: StartReleaseResumptionAttestationInput,
  signal?: AbortSignal,
): Promise<ReleaseResumptionAttestationWorkspaceResponse> {
  return new Promise<ReleaseResumptionAttestationWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (run.id !== input.runId || run.stage !== "draft") {
          reject(
            new Error(
              "Resumption attestation review is no longer ready to start.",
            ),
          );
          return;
        }

        registers = registers.map((register, index) =>
          index === 0
            ? {
                ...register,
                status: "awaiting-review",
                note: "Awaiting owner review before the next resumption register opens.",
              }
            : register,
        );

        run = {
          ...run,
          stage: "register-review",
          activeRegisterId: "resumption-attestation-register-1",
          publishBlockedReason:
            "Each resumption register must clear owner review before stale checks can be invalidated.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Avery - Incident lead",
        };

        appendAuditEvent(
          "initiated",
          "Avery",
          "Started resumption attestation review with the checkout resumption register.",
        );

        resolve(cloneWorkspace());
      }, releaseResumptionAttestationMutationDelayMs);

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

export function approveReleaseResumptionAttestationRegister(
  input: ApproveReleaseResumptionAttestationRegisterInput,
  signal?: AbortSignal,
): Promise<ReleaseResumptionAttestationWorkspaceResponse> {
  return new Promise<ReleaseResumptionAttestationWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        const register =
          registers.find((item) => item.id === input.registerId) ?? null;

        if (!register || register.status !== "awaiting-review") {
          reject(
            new Error(
              "Resumption attestation register approval is not available.",
            ),
          );
          return;
        }

        registers = registers.map((item) =>
          item.id === input.registerId
            ? {
                ...item,
                status: "approved",
                note: `${item.owner} approved ${item.label}.`,
              }
            : item,
        );

        appendAuditEvent(
          "approved",
          register.owner,
          `${register.owner} approved ${register.label}.`,
        );

        const nextRegister = nextQueuedRegister();
        if (nextRegister) {
          registers = registers.map((item) =>
            item.id === nextRegister.id
              ? {
                  ...item,
                  status: "awaiting-review",
                  note: `${item.label} is the next resumption register awaiting review.`,
                }
              : item,
          );

          run = {
            ...run,
            stage: "register-review",
            activeRegisterId: nextRegister.id,
            publishBlockedReason:
              "Finish resumption register review before stale checks can be invalidated.",
            updatedAt: formatTimestamp(new Date()),
            updatedBy: register.owner,
          };
          resolve(cloneWorkspace());
          return;
        }

        checks = checks.map((check) => ({ ...check, status: "stale" }));

        run = {
          ...run,
          stage: "stale-check-review",
          activeRegisterId: null,
          publishBlockedReason:
            "Invalidate stale checks before approver sign-off can clear the resumption packet.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: register.owner,
        };

        resolve(cloneWorkspace());
      }, releaseResumptionAttestationMutationDelayMs);

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

export function invalidateReleaseResumptionAttestationChecks(
  input: InvalidateReleaseResumptionAttestationChecksInput,
  signal?: AbortSignal,
): Promise<ReleaseResumptionAttestationWorkspaceResponse> {
  return new Promise<ReleaseResumptionAttestationWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (run.id !== input.runId || run.stage !== "stale-check-review") {
          reject(new Error("Stale-check invalidation is not available."));
          return;
        }

        checks = checks.map((check) => ({
          ...check,
          status: "invalidated",
        }));

        run = {
          ...run,
          stage: "approver-signoff",
          publishBlockedReason:
            "Approver sign-off must confirm the revised resumption checks before publish can proceed.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Avery - Incident lead",
        };

        appendAuditEvent(
          "invalidated",
          "Avery",
          "Invalidated stale resumption checks so only the revised packet remains eligible for publish.",
        );

        resolve(cloneWorkspace());
      }, releaseResumptionAttestationMutationDelayMs);

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

export function signOffReleaseResumptionAttestation(
  input: SignOffReleaseResumptionAttestationInput,
  signal?: AbortSignal,
): Promise<ReleaseResumptionAttestationWorkspaceResponse> {
  return new Promise<ReleaseResumptionAttestationWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (
          run.id !== input.runId ||
          run.stage !== "approver-signoff" ||
          !allChecksInvalidated()
        ) {
          reject(new Error("Approver sign-off is not available."));
          return;
        }

        checks = checks.map((check) => ({
          ...check,
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
          "Approver sign-off recorded for the revised resumption attestation packet.",
        );

        resolve(cloneWorkspace());
      }, releaseResumptionAttestationMutationDelayMs);

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

export function publishReleaseResumptionAttestation(
  input: PublishReleaseResumptionAttestationInput,
  signal?: AbortSignal,
): Promise<ReleaseResumptionAttestationWorkspaceResponse> {
  return new Promise<ReleaseResumptionAttestationWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (
          run.id !== input.runId ||
          run.stage !== "ready-to-publish" ||
          !allChecksApproved()
        ) {
          reject(new Error("Resumption attestation publish is not available."));
          return;
        }

        registers = registers.map((register) => ({
          ...register,
          status: "published",
          note: `${register.label} published with the revised approved resumption checks.`,
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
          "Published the resumption attestation packet after stale-check invalidation and approver sign-off.",
        );

        resolve(cloneWorkspace());
      }, releaseResumptionAttestationMutationDelayMs);

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
