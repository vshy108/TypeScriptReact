import type {
  ApplyReleaseIncidentCommsOverrideInput,
  ApproveReleaseIncidentCommsPackInput,
  PublishReleaseIncidentCommsInput,
  ReleaseIncidentCommsApprovalPack,
  ReleaseIncidentCommsAuditEvent,
  ReleaseIncidentCommsAuditEventId,
  ReleaseIncidentCommsDiffRow,
  ReleaseIncidentCommsRun,
  ReleaseIncidentCommsWorkspaceResponse,
  StartReleaseIncidentCommsInput,
} from "./types";

const initialRun = {
  id: "incident-comms-run-1",
  title: "Incident comms approval packs with legal override",
  summary:
    "Stage communications approval across operations and legal, compare the customer-visible rollback wording, and require the legal override diff before publish can proceed.",
  stage: "draft",
  activePackId: null,
  publishBlockedReason:
    "Operations review, legal review, and the rollback wording override must all complete before publish.",
  updatedAt: "2026-03-24 04:10 UTC",
  updatedBy: "Avery - Communications lead",
} as const satisfies ReleaseIncidentCommsRun;

const initialPacks = [
  {
    id: "incident-comms-pack-1",
    label: "Operations approval pack",
    owner: "Taylor",
    role: "Incident commander",
    status: "queued",
    note: "Operations confirms the rollback facts, mitigation status, and timeline references before legal review starts.",
  },
  {
    id: "incident-comms-pack-2",
    label: "Legal approval pack",
    owner: "Priya",
    role: "Legal reviewer",
    status: "queued",
    note: "Legal reviews the customer-visible rollback wording and may require narrower claims before publish.",
  },
] as const satisfies readonly ReleaseIncidentCommsApprovalPack[];

const initialDiffRows = [
  {
    id: "incident-comms-diff-1",
    field: "Headline",
    baseline: "Rollback completed and customer impact is stabilizing.",
    override:
      "Rollback completed and service is recovering while we continue validation.",
    status: "changed",
  },
  {
    id: "incident-comms-diff-2",
    field: "Customer summary",
    baseline:
      "We have restored the previous release and resolved the checkout issue for most customers.",
    override:
      "We restored the previous release and are seeing service recovery while validation continues across regions.",
    status: "changed",
  },
  {
    id: "incident-comms-diff-3",
    field: "Next update promise",
    baseline: "Next update in 15 minutes.",
    override:
      "Next update once regional validation completes or sooner if status changes.",
    status: "changed",
  },
] as const satisfies readonly ReleaseIncidentCommsDiffRow[];

const initialAuditEvents = [
  {
    id: "incident-comms-audit-1",
    actor: "Avery",
    action: "initiated",
    detail:
      "Prepared staged communications packs with baseline rollback wording and the pending legal override diff.",
    timestamp: "2026-03-24 04:05 UTC",
  },
] as const satisfies readonly ReleaseIncidentCommsAuditEvent[];

export const releaseIncidentCommsFetchDelayMs = 180;
export const releaseIncidentCommsMutationDelayMs = 220;

let run: ReleaseIncidentCommsRun = { ...initialRun };
let packs: ReleaseIncidentCommsApprovalPack[] = initialPacks.map((pack) => ({
  ...pack,
}));
let diffRows: ReleaseIncidentCommsDiffRow[] = initialDiffRows.map((row) => ({
  ...row,
}));
let auditEvents: ReleaseIncidentCommsAuditEvent[] = initialAuditEvents.map(
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

function cloneWorkspace(): ReleaseIncidentCommsWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    run: { ...run },
    packs: packs.map((pack) => ({ ...pack })),
    diffRows: diffRows.map((row) => ({ ...row })),
    auditEvents: auditEvents.map((event) => ({ ...event })),
  };
}

function nextAuditEventId(): ReleaseIncidentCommsAuditEventId {
  const eventId =
    `incident-comms-audit-${nextAuditEventNumber}` as ReleaseIncidentCommsAuditEventId;
  nextAuditEventNumber += 1;
  return eventId;
}

function appendAuditEvent(
  action: ReleaseIncidentCommsAuditEvent["action"],
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

function allDiffsApproved() {
  return diffRows.every((row) => row.status === "approved");
}

export function resetReleaseIncidentCommsApprovalPacksMockState() {
  run = { ...initialRun };
  packs = initialPacks.map((pack) => ({ ...pack }));
  diffRows = initialDiffRows.map((row) => ({ ...row }));
  auditEvents = initialAuditEvents.map((event) => ({ ...event }));
  nextAuditEventNumber = initialAuditEvents.length + 1;
}

export function isReleaseIncidentCommsAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function fetchReleaseIncidentCommsWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseIncidentCommsWorkspaceResponse> {
  return new Promise<ReleaseIncidentCommsWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);
        resolve(cloneWorkspace());
      }, releaseIncidentCommsFetchDelayMs);

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

export function startReleaseIncidentComms(
  input: StartReleaseIncidentCommsInput,
  signal?: AbortSignal,
): Promise<ReleaseIncidentCommsWorkspaceResponse> {
  return new Promise<ReleaseIncidentCommsWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (run.id !== input.runId || run.stage !== "draft") {
          reject(
            new Error("Incident comms approval is no longer ready to start."),
          );
          return;
        }

        packs = packs.map((pack, index) =>
          index === 0
            ? {
                ...pack,
                status: "awaiting-approval",
                note: "Awaiting operations approval before the legal pack can open.",
              }
            : pack,
        );

        run = {
          ...run,
          stage: "ops-review",
          activePackId: "incident-comms-pack-1",
          publishBlockedReason:
            "Operations approval must finish before the legal override review can begin.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Avery - Communications lead",
        };

        appendAuditEvent(
          "initiated",
          "Avery",
          "Started staged incident communications review with the operations approval pack.",
        );

        resolve(cloneWorkspace());
      }, releaseIncidentCommsMutationDelayMs);

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

export function approveReleaseIncidentCommsPack(
  input: ApproveReleaseIncidentCommsPackInput,
  signal?: AbortSignal,
): Promise<ReleaseIncidentCommsWorkspaceResponse> {
  return new Promise<ReleaseIncidentCommsWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        const pack = packs.find((item) => item.id === input.packId) ?? null;

        if (!pack || pack.status !== "awaiting-approval") {
          reject(new Error("Approval is not available."));
          return;
        }

        packs = packs.map((item) => {
          if (item.id === input.packId) {
            return {
              ...item,
              status: "approved",
              note: `${item.owner} approved ${item.label}.`,
            };
          }

          if (
            input.packId === "incident-comms-pack-1" &&
            item.id === "incident-comms-pack-2"
          ) {
            return {
              ...item,
              status: "awaiting-approval",
              note: "Awaiting legal approval and rollback wording review.",
            };
          }

          return item;
        });

        appendAuditEvent(
          "approved",
          pack.owner,
          `${pack.owner} approved ${pack.label}.`,
        );

        if (input.packId === "incident-comms-pack-1") {
          run = {
            ...run,
            stage: "legal-review",
            activePackId: "incident-comms-pack-2",
            publishBlockedReason:
              "Legal must approve the customer-visible wording and apply the override before publish.",
            updatedAt: formatTimestamp(new Date()),
            updatedBy: pack.owner,
          };

          resolve(cloneWorkspace());
          return;
        }

        run = {
          ...run,
          stage: "override-required",
          activePackId: "incident-comms-pack-2",
          publishBlockedReason:
            "Apply the legal wording override to the rollback copy before publish can proceed.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: pack.owner,
        };

        resolve(cloneWorkspace());
      }, releaseIncidentCommsMutationDelayMs);

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

export function applyReleaseIncidentCommsOverride(
  input: ApplyReleaseIncidentCommsOverrideInput,
  signal?: AbortSignal,
): Promise<ReleaseIncidentCommsWorkspaceResponse> {
  return new Promise<ReleaseIncidentCommsWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (run.id !== input.runId || run.stage !== "override-required") {
          reject(new Error("Legal override is not available."));
          return;
        }

        diffRows = diffRows.map((row) => ({
          ...row,
          status: "approved",
        }));

        packs = packs.map((pack) =>
          pack.id === "incident-comms-pack-2"
            ? {
                ...pack,
                status: "override-applied",
                note: "Legal override applied to the customer-visible rollback wording.",
              }
            : pack,
        );

        run = {
          ...run,
          stage: "ready-to-publish",
          activePackId: null,
          publishBlockedReason: null,
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Priya - Legal reviewer",
        };

        appendAuditEvent(
          "overridden",
          "Priya",
          "Applied the legal override to the customer-visible rollback wording diff.",
        );

        resolve(cloneWorkspace());
      }, releaseIncidentCommsMutationDelayMs);

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

export function publishReleaseIncidentComms(
  input: PublishReleaseIncidentCommsInput,
  signal?: AbortSignal,
): Promise<ReleaseIncidentCommsWorkspaceResponse> {
  return new Promise<ReleaseIncidentCommsWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (
          run.id !== input.runId ||
          run.stage !== "ready-to-publish" ||
          !allDiffsApproved()
        ) {
          reject(new Error("Incident comms publish is not available."));
          return;
        }

        run = {
          ...run,
          stage: "published",
          publishBlockedReason: null,
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Avery - Communications lead",
        };

        appendAuditEvent(
          "published",
          "Avery",
          "Published the staged incident communication pack after the legal override was applied.",
        );

        resolve(cloneWorkspace());
      }, releaseIncidentCommsMutationDelayMs);

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
