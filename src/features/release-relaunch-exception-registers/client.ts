import type {
  ApproveReleaseRelaunchRegisterInput,
  InvalidateReleaseRelaunchThresholdsInput,
  PublishReleaseRelaunchExceptionInput,
  ReleaseRelaunchExceptionAuditEvent,
  ReleaseRelaunchExceptionAuditEventId,
  ReleaseRelaunchExceptionRun,
  ReleaseRelaunchExceptionWorkspaceResponse,
  ReleaseRelaunchRegister,
  ReleaseRelaunchThreshold,
  SignOffReleaseRelaunchExceptionInput,
  StartReleaseRelaunchExceptionInput,
} from "./types";

const initialRun = {
  id: "relaunch-exception-run-1",
  title: "Relaunch exception registers",
  summary:
    "Review each relaunch exception register, invalidate stale thresholds that no longer match the verified relaunch posture, collect approver sign-off on the revised thresholds, and only then publish the reconciled register set.",
  stage: "draft",
  activeRegisterId: null,
  publishBlockedReason:
    "Register review, stale-threshold invalidation, and approver sign-off must complete before the relaunch exception register can publish.",
  updatedAt: "2026-03-24 07:40 UTC",
  updatedBy: "Avery - Incident lead",
} as const satisfies ReleaseRelaunchExceptionRun;

const initialRegisters = [
  {
    id: "relaunch-register-1",
    label: "Checkout relaunch register",
    owner: "Mina",
    audience: "Launch operators",
    status: "queued",
    note: "Checkout relaunch exceptions are reviewed first because they gate the customer-facing relaunch threshold most directly.",
  },
  {
    id: "relaunch-register-2",
    label: "Support relaunch register",
    owner: "Jordan",
    audience: "Support leads",
    status: "queued",
    note: "Support relaunch thresholds are reviewed second so escalation playbooks inherit the corrected checkout relaunch posture.",
  },
  {
    id: "relaunch-register-3",
    label: "Executive relaunch register",
    owner: "Priya",
    audience: "Executive stakeholders",
    status: "queued",
    note: "Executive relaunch thresholds are reviewed last so they only reference approved thresholds from the operational lanes.",
  },
] as const satisfies readonly ReleaseRelaunchRegister[];

const initialThresholds = [
  {
    id: "relaunch-threshold-1",
    register: "Checkout relaunch register",
    staleThreshold:
      "Checkout can relaunch when replay backlog stays below 10 minutes for one hour.",
    revisedThreshold:
      "Checkout can relaunch when replay backlog stays below 5 minutes for two hours across every recovery region.",
    reason:
      "The earlier threshold became stale after cross-region replay validation raised the relaunch bar beyond the primary-region metric.",
    status: "current",
  },
  {
    id: "relaunch-threshold-2",
    register: "Support relaunch register",
    staleThreshold:
      "Support can close the relaunch exception lane as soon as new tickets trend down for one hour.",
    revisedThreshold:
      "Support can close the relaunch exception lane only after new tickets trend down for two hours and macro overrides are retired.",
    reason:
      "The earlier support threshold became stale after macro overrides remained necessary beyond the first hour of ticket improvement.",
    status: "current",
  },
  {
    id: "relaunch-threshold-3",
    register: "Executive relaunch register",
    staleThreshold:
      "Executives can announce relaunch completion once checkout traffic is restored.",
    revisedThreshold:
      "Executives can announce relaunch completion only after checkout, support, and exception-register thresholds are all approved.",
    reason:
      "The traffic-only threshold became stale once executive completion language was tied to the full operational exception register set.",
    status: "current",
  },
] as const satisfies readonly ReleaseRelaunchThreshold[];

const initialAuditEvents = [
  {
    id: "relaunch-exception-audit-1",
    actor: "Avery",
    action: "initiated",
    detail:
      "Prepared relaunch exception registers with stale-threshold comparisons ready for owner review.",
    timestamp: "2026-03-24 07:35 UTC",
  },
] as const satisfies readonly ReleaseRelaunchExceptionAuditEvent[];

export const releaseRelaunchExceptionFetchDelayMs = 180;
export const releaseRelaunchExceptionMutationDelayMs = 220;

let run: ReleaseRelaunchExceptionRun = { ...initialRun };
let registers: ReleaseRelaunchRegister[] = initialRegisters.map((register) => ({
  ...register,
}));
let thresholds: ReleaseRelaunchThreshold[] = initialThresholds.map((item) => ({
  ...item,
}));
let auditEvents: ReleaseRelaunchExceptionAuditEvent[] = initialAuditEvents.map(
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

function cloneWorkspace(): ReleaseRelaunchExceptionWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    run: { ...run },
    registers: registers.map((register) => ({ ...register })),
    thresholds: thresholds.map((item) => ({ ...item })),
    auditEvents: auditEvents.map((event) => ({ ...event })),
  };
}

function nextAuditEventId(): ReleaseRelaunchExceptionAuditEventId {
  const eventId =
    `relaunch-exception-audit-${nextAuditEventNumber}` as ReleaseRelaunchExceptionAuditEventId;
  nextAuditEventNumber += 1;
  return eventId;
}

function appendAuditEvent(
  action: ReleaseRelaunchExceptionAuditEvent["action"],
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

function allThresholdsInvalidated() {
  return thresholds.every((item) => item.status === "invalidated");
}

function allThresholdsApproved() {
  return thresholds.every((item) => item.status === "approved");
}

export function resetReleaseRelaunchExceptionMockState() {
  run = { ...initialRun };
  registers = initialRegisters.map((register) => ({ ...register }));
  thresholds = initialThresholds.map((item) => ({ ...item }));
  auditEvents = initialAuditEvents.map((event) => ({ ...event }));
  nextAuditEventNumber = initialAuditEvents.length + 1;
}

export function isReleaseRelaunchExceptionAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function fetchReleaseRelaunchExceptionWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseRelaunchExceptionWorkspaceResponse> {
  return new Promise<ReleaseRelaunchExceptionWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);
        resolve(cloneWorkspace());
      }, releaseRelaunchExceptionFetchDelayMs);

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

export function startReleaseRelaunchException(
  input: StartReleaseRelaunchExceptionInput,
  signal?: AbortSignal,
): Promise<ReleaseRelaunchExceptionWorkspaceResponse> {
  return new Promise<ReleaseRelaunchExceptionWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (run.id !== input.runId || run.stage !== "draft") {
          reject(
            new Error("Relaunch exception review is no longer ready to start."),
          );
          return;
        }

        registers = registers.map((register, index) =>
          index === 0
            ? {
                ...register,
                status: "awaiting-review",
                note: "Awaiting owner review before the next relaunch register opens.",
              }
            : register,
        );

        run = {
          ...run,
          stage: "register-review",
          activeRegisterId: "relaunch-register-1",
          publishBlockedReason:
            "Each relaunch register must clear owner review before stale thresholds can be invalidated.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Avery - Incident lead",
        };

        appendAuditEvent(
          "initiated",
          "Avery",
          "Started relaunch exception review with the checkout relaunch register.",
        );

        resolve(cloneWorkspace());
      }, releaseRelaunchExceptionMutationDelayMs);

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

export function approveReleaseRelaunchRegister(
  input: ApproveReleaseRelaunchRegisterInput,
  signal?: AbortSignal,
): Promise<ReleaseRelaunchExceptionWorkspaceResponse> {
  return new Promise<ReleaseRelaunchExceptionWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        const register =
          registers.find((item) => item.id === input.registerId) ?? null;

        if (!register || register.status !== "awaiting-review") {
          reject(new Error("Relaunch register approval is not available."));
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
                  note: `${item.label} is the next relaunch register awaiting review.`,
                }
              : item,
          );

          run = {
            ...run,
            stage: "register-review",
            activeRegisterId: nextRegister.id,
            publishBlockedReason:
              "Finish relaunch register review before stale thresholds can be invalidated.",
            updatedAt: formatTimestamp(new Date()),
            updatedBy: register.owner,
          };
          resolve(cloneWorkspace());
          return;
        }

        thresholds = thresholds.map((item) => ({ ...item, status: "stale" }));

        run = {
          ...run,
          stage: "stale-threshold-review",
          activeRegisterId: null,
          publishBlockedReason:
            "Invalidate stale thresholds before approver sign-off can clear the relaunch exception register.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: register.owner,
        };

        resolve(cloneWorkspace());
      }, releaseRelaunchExceptionMutationDelayMs);

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

export function invalidateReleaseRelaunchThresholds(
  input: InvalidateReleaseRelaunchThresholdsInput,
  signal?: AbortSignal,
): Promise<ReleaseRelaunchExceptionWorkspaceResponse> {
  return new Promise<ReleaseRelaunchExceptionWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (run.id !== input.runId || run.stage !== "stale-threshold-review") {
          reject(new Error("Stale-threshold invalidation is not available."));
          return;
        }

        thresholds = thresholds.map((item) => ({
          ...item,
          status: "invalidated",
        }));

        run = {
          ...run,
          stage: "approver-signoff",
          publishBlockedReason:
            "Approver sign-off must confirm the revised relaunch thresholds before publish can proceed.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Avery - Incident lead",
        };

        appendAuditEvent(
          "invalidated",
          "Avery",
          "Invalidated stale relaunch thresholds so only the revised register remains eligible for publish.",
        );

        resolve(cloneWorkspace());
      }, releaseRelaunchExceptionMutationDelayMs);

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

export function signOffReleaseRelaunchException(
  input: SignOffReleaseRelaunchExceptionInput,
  signal?: AbortSignal,
): Promise<ReleaseRelaunchExceptionWorkspaceResponse> {
  return new Promise<ReleaseRelaunchExceptionWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (
          run.id !== input.runId ||
          run.stage !== "approver-signoff" ||
          !allThresholdsInvalidated()
        ) {
          reject(new Error("Approver sign-off is not available."));
          return;
        }

        thresholds = thresholds.map((item) => ({
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
          "Approver sign-off recorded for the revised relaunch exception register.",
        );

        resolve(cloneWorkspace());
      }, releaseRelaunchExceptionMutationDelayMs);

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

export function publishReleaseRelaunchException(
  input: PublishReleaseRelaunchExceptionInput,
  signal?: AbortSignal,
): Promise<ReleaseRelaunchExceptionWorkspaceResponse> {
  return new Promise<ReleaseRelaunchExceptionWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (
          run.id !== input.runId ||
          run.stage !== "ready-to-publish" ||
          !allThresholdsApproved()
        ) {
          reject(new Error("Relaunch exception publish is not available."));
          return;
        }

        registers = registers.map((register) => ({
          ...register,
          status: "published",
          note: `${register.label} published with the revised approved relaunch thresholds.`,
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
          "Published the relaunch exception register after stale-threshold invalidation and approver sign-off.",
        );

        resolve(cloneWorkspace());
      }, releaseRelaunchExceptionMutationDelayMs);

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
