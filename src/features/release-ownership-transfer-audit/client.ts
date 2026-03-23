import type {
  AcknowledgeReleaseOwnershipStepInput,
  ReleaseOwnershipAuditEvent,
  ReleaseOwnershipAuditEventId,
  ReleaseOwnershipTransferRun,
  ReleaseOwnershipTransferStep,
  ReleaseOwnershipTransferWorkspaceResponse,
  StartReleaseOwnershipTransferInput,
} from "./types";

const initialRun = {
  id: "ownership-transfer-run-1",
  title: "Ownership transfer audit with escalation replay context",
  summary:
    "Transfer release ownership from the current operator to the next owner, collect both acknowledgements, and replay the latest escalation history before the handoff closes.",
  stage: "draft",
  currentOwner: "Taylor",
  pendingOwner: "Mina",
  activeStepId: null,
  updatedAt: "2026-03-24 01:25 UTC",
  updatedBy: "Taylor - Release lead",
} as const satisfies ReleaseOwnershipTransferRun;

const initialSteps = [
  {
    id: "ownership-transfer-step-1",
    label: "Outgoing owner sign-off",
    owner: "Taylor",
    status: "queued",
    note: "Current owner must confirm the release context and unresolved risks before ownership can move.",
  },
  {
    id: "ownership-transfer-step-2",
    label: "Incoming owner acknowledgement",
    owner: "Mina",
    status: "queued",
    note: "Incoming owner must accept the pending release duties and confirm takeover timing.",
  },
  {
    id: "ownership-transfer-step-3",
    label: "Escalation replay",
    owner: "Mina",
    status: "queued",
    note: "Replay the last reroute, acknowledgement trail, and open follow-ups before finalizing the transfer.",
  },
] as const satisfies readonly ReleaseOwnershipTransferStep[];

const initialAuditEvents = [
  {
    id: "ownership-event-1",
    actor: "Taylor",
    action: "initiated",
    detail:
      "Prepared the ownership transfer packet with the current rollout state, pending risks, and escalation summary.",
    timestamp: "2026-03-24 01:20 UTC",
  },
] as const satisfies readonly ReleaseOwnershipAuditEvent[];

export const releaseOwnershipTransferFetchDelayMs = 180;
export const releaseOwnershipTransferMutationDelayMs = 220;

let run: ReleaseOwnershipTransferRun = { ...initialRun };
let steps: ReleaseOwnershipTransferStep[] = initialSteps.map((step) => ({
  ...step,
}));
let auditEvents: ReleaseOwnershipAuditEvent[] = initialAuditEvents.map(
  (event) => ({
    ...event,
  }),
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

function cloneWorkspace(): ReleaseOwnershipTransferWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    run: { ...run },
    steps: steps.map((step) => ({ ...step })),
    auditEvents: auditEvents.map((event) => ({ ...event })),
  };
}

function nextAuditEventId(): ReleaseOwnershipAuditEventId {
  const eventId =
    `ownership-event-${nextAuditEventNumber}` as ReleaseOwnershipAuditEventId;
  nextAuditEventNumber += 1;
  return eventId;
}

function appendAuditEvent(
  action: ReleaseOwnershipAuditEvent["action"],
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

export function resetReleaseOwnershipTransferAuditMockState() {
  run = { ...initialRun };
  steps = initialSteps.map((step) => ({ ...step }));
  auditEvents = initialAuditEvents.map((event) => ({ ...event }));
  nextAuditEventNumber = initialAuditEvents.length + 1;
}

export function isReleaseOwnershipTransferAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function fetchReleaseOwnershipTransferWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseOwnershipTransferWorkspaceResponse> {
  return new Promise<ReleaseOwnershipTransferWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);
        resolve(cloneWorkspace());
      }, releaseOwnershipTransferFetchDelayMs);

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

export function startReleaseOwnershipTransfer(
  input: StartReleaseOwnershipTransferInput,
  signal?: AbortSignal,
): Promise<ReleaseOwnershipTransferWorkspaceResponse> {
  return new Promise<ReleaseOwnershipTransferWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (run.id !== input.runId || run.stage !== "draft") {
          reject(new Error("Ownership transfer is no longer ready to start."));
          return;
        }

        steps = steps.map((step, index) =>
          index === 0
            ? {
                ...step,
                status: "awaiting-ack",
                note: "Awaiting outgoing-owner acknowledgement for the release handoff package.",
              }
            : step,
        );

        run = {
          ...run,
          stage: "awaiting-outgoing-ack",
          activeStepId: "ownership-transfer-step-1",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Taylor - Release lead",
        };

        appendAuditEvent(
          "initiated",
          run.currentOwner,
          `${run.currentOwner} started the ownership transfer and sent the audit packet to ${run.pendingOwner}.`,
        );
        resolve(cloneWorkspace());
      }, releaseOwnershipTransferMutationDelayMs);

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

export function acknowledgeReleaseOwnershipStep(
  input: AcknowledgeReleaseOwnershipStepInput,
  signal?: AbortSignal,
): Promise<ReleaseOwnershipTransferWorkspaceResponse> {
  return new Promise<ReleaseOwnershipTransferWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        const activeStep =
          steps.find((step) => step.id === input.stepId) ?? null;

        if (!activeStep || activeStep.status !== "awaiting-ack") {
          reject(new Error("Acknowledgement is not available."));
          return;
        }

        if (activeStep.id === "ownership-transfer-step-1") {
          steps = steps.map((step) => {
            if (step.id === activeStep.id) {
              return {
                ...step,
                status: "completed",
                note: "Outgoing owner confirmed the latest release state, blockers, and ownership notes.",
              };
            }

            if (step.id === "ownership-transfer-step-2") {
              return {
                ...step,
                status: "awaiting-ack",
                note: "Awaiting acknowledgement from Mina to accept release ownership.",
              };
            }

            return step;
          });

          run = {
            ...run,
            stage: "awaiting-incoming-ack",
            activeStepId: "ownership-transfer-step-2",
            updatedAt: formatTimestamp(new Date()),
            updatedBy: "Taylor - Release lead",
          };

          appendAuditEvent(
            "acknowledged",
            activeStep.owner,
            `${activeStep.owner} acknowledged the outgoing handoff packet and cleared the transfer for the incoming owner.`,
          );
          resolve(cloneWorkspace());
          return;
        }

        if (activeStep.id === "ownership-transfer-step-2") {
          steps = steps.map((step) => {
            if (step.id === activeStep.id) {
              return {
                ...step,
                status: "completed",
                note: "Incoming owner accepted the release responsibilities and requested the latest escalation replay.",
              };
            }

            if (step.id === "ownership-transfer-step-3") {
              return {
                ...step,
                status: "awaiting-ack",
                note: "Awaiting escalation replay acknowledgement before the transfer can close.",
              };
            }

            return step;
          });

          run = {
            ...run,
            stage: "replaying-context",
            activeStepId: "ownership-transfer-step-3",
            updatedAt: formatTimestamp(new Date()),
            updatedBy: "Mina - Incoming owner",
          };

          appendAuditEvent(
            "acknowledged",
            activeStep.owner,
            `${activeStep.owner} accepted ownership transfer and asked for the latest escalation replay context.`,
          );
          resolve(cloneWorkspace());
          return;
        }

        steps = steps.map((step) =>
          step.id === activeStep.id
            ? {
                ...step,
                status: "completed",
                note: "Escalation replay was reviewed and the new owner now has the full acknowledgement trail.",
              }
            : step,
        );

        const newOwner = run.pendingOwner ?? run.currentOwner;
        run = {
          ...run,
          stage: "completed",
          currentOwner: newOwner,
          pendingOwner: null,
          activeStepId: null,
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Mina - Incoming owner",
        };

        appendAuditEvent(
          "replayed",
          activeStep.owner,
          `${activeStep.owner} replayed the reroute decisions, acknowledgement history, and remaining follow-ups.`,
        );
        appendAuditEvent(
          "transferred",
          newOwner,
          `Ownership transferred to ${newOwner} after the escalation replay context was acknowledged.`,
        );
        resolve(cloneWorkspace());
      }, releaseOwnershipTransferMutationDelayMs);

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
