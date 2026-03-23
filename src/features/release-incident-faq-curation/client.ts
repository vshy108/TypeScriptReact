import type {
  ApproveReleaseIncidentFaqChannelInput,
  InvalidateReleaseIncidentFaqAnswersInput,
  PublishReleaseIncidentFaqInput,
  ReleaseIncidentFaqAuditEvent,
  ReleaseIncidentFaqAuditEventId,
  ReleaseIncidentFaqChannel,
  ReleaseIncidentFaqEntry,
  ReleaseIncidentFaqRun,
  ReleaseIncidentFaqWorkspaceResponse,
  SignOffReleaseIncidentFaqInput,
  StartReleaseIncidentFaqInput,
} from "./types";

const initialRun = {
  id: "incident-faq-run-1",
  title: "Cross-channel incident FAQ curation",
  summary:
    "Review each outward-facing FAQ channel, invalidate stale answers created by the incident update, collect reviewer sign-off on the refreshed language, and only then publish the synchronized FAQ bundle.",
  stage: "draft",
  activeChannelId: null,
  publishBlockedReason:
    "Cross-channel review, stale-answer invalidation, and reviewer sign-off must complete before the FAQ bundle can publish.",
  updatedAt: "2026-03-24 05:15 UTC",
  updatedBy: "Mina - Support content lead",
} as const satisfies ReleaseIncidentFaqRun;

const initialChannels = [
  {
    id: "incident-faq-channel-1",
    label: "Status page FAQ",
    audience: "Public status readers",
    owner: "Mina",
    status: "queued",
    note: "The public status page is reviewed first so the visible customer FAQ aligns with the latest incident posture.",
  },
  {
    id: "incident-faq-channel-2",
    label: "Support macro FAQ",
    audience: "Support agents",
    owner: "Jordan",
    status: "queued",
    note: "Support macros must match the public status page before agents reuse the refreshed answer set.",
  },
  {
    id: "incident-faq-channel-3",
    label: "Social reply FAQ",
    audience: "Social responders",
    owner: "Elena",
    status: "queued",
    note: "Short-form social guidance publishes last because it is the easiest place for stale claims to linger.",
  },
] as const satisfies readonly ReleaseIncidentFaqChannel[];

const initialFaqEntries = [
  {
    id: "incident-faq-entry-1",
    question: "Is the rollback fully complete everywhere?",
    staleAnswer:
      "Yes, the rollback fully resolved the incident across every region.",
    refreshedAnswer:
      "The rollback is in place, and validation is still running before we claim full recovery in every region.",
    owner: "Status page",
    status: "current",
  },
  {
    id: "incident-faq-entry-2",
    question:
      "Should support promise that checkout is stable for all customers?",
    staleAnswer:
      "Yes, support can confirm checkout is stable for all customers now.",
    refreshedAnswer:
      "Support should confirm the rollback is applied while validation continues for some customer segments.",
    owner: "Support macro",
    status: "current",
  },
  {
    id: "incident-faq-entry-3",
    question: "Can social replies say the incident is fully resolved?",
    staleAnswer:
      "Yes, social replies can state the incident is fully resolved.",
    refreshedAnswer:
      "Social replies should say recovery is underway and direct customers to the status page for the latest validation updates.",
    owner: "Social reply guide",
    status: "current",
  },
] as const satisfies readonly ReleaseIncidentFaqEntry[];

const initialAuditEvents = [
  {
    id: "incident-faq-audit-1",
    actor: "Mina",
    action: "initiated",
    detail:
      "Prepared the cross-channel FAQ bundle with channel owners and refreshed answers ready for review.",
    timestamp: "2026-03-24 05:10 UTC",
  },
] as const satisfies readonly ReleaseIncidentFaqAuditEvent[];

export const releaseIncidentFaqFetchDelayMs = 180;
export const releaseIncidentFaqMutationDelayMs = 220;

let run: ReleaseIncidentFaqRun = { ...initialRun };
let channels: ReleaseIncidentFaqChannel[] = initialChannels.map((channel) => ({
  ...channel,
}));
let faqEntries: ReleaseIncidentFaqEntry[] = initialFaqEntries.map((entry) => ({
  ...entry,
}));
let auditEvents: ReleaseIncidentFaqAuditEvent[] = initialAuditEvents.map(
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

function cloneWorkspace(): ReleaseIncidentFaqWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    run: { ...run },
    channels: channels.map((channel) => ({ ...channel })),
    faqEntries: faqEntries.map((entry) => ({ ...entry })),
    auditEvents: auditEvents.map((event) => ({ ...event })),
  };
}

function nextAuditEventId(): ReleaseIncidentFaqAuditEventId {
  const eventId =
    `incident-faq-audit-${nextAuditEventNumber}` as ReleaseIncidentFaqAuditEventId;
  nextAuditEventNumber += 1;
  return eventId;
}

function appendAuditEvent(
  action: ReleaseIncidentFaqAuditEvent["action"],
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

function nextQueuedChannel() {
  return channels.find((channel) => channel.status === "queued") ?? null;
}

function allFaqAnswersInvalidated() {
  return faqEntries.every((entry) => entry.status === "invalidated");
}

function allFaqAnswersApproved() {
  return faqEntries.every((entry) => entry.status === "approved");
}

export function resetReleaseIncidentFaqCurationMockState() {
  run = { ...initialRun };
  channels = initialChannels.map((channel) => ({ ...channel }));
  faqEntries = initialFaqEntries.map((entry) => ({ ...entry }));
  auditEvents = initialAuditEvents.map((event) => ({ ...event }));
  nextAuditEventNumber = initialAuditEvents.length + 1;
}

export function isReleaseIncidentFaqAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function fetchReleaseIncidentFaqWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseIncidentFaqWorkspaceResponse> {
  return new Promise<ReleaseIncidentFaqWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve(cloneWorkspace());
    }, releaseIncidentFaqFetchDelayMs);

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

export function startReleaseIncidentFaq(
  input: StartReleaseIncidentFaqInput,
  signal?: AbortSignal,
): Promise<ReleaseIncidentFaqWorkspaceResponse> {
  return new Promise<ReleaseIncidentFaqWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (run.id !== input.runId || run.stage !== "draft") {
        reject(new Error("Incident FAQ curation is no longer ready to start."));
        return;
      }

      channels = channels.map((channel, index) =>
        index === 0
          ? {
              ...channel,
              status: "awaiting-review",
              note: "Awaiting channel review before the next FAQ lane can open.",
            }
          : channel,
      );

      run = {
        ...run,
        stage: "channel-review",
        activeChannelId: "incident-faq-channel-1",
        publishBlockedReason:
          "Each FAQ channel must be reviewed before stale answers can be invalidated safely.",
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Mina - Support content lead",
      };

      appendAuditEvent(
        "initiated",
        "Mina",
        "Started the cross-channel FAQ review with the status page FAQ lane.",
      );
      resolve(cloneWorkspace());
    }, releaseIncidentFaqMutationDelayMs);

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

export function approveReleaseIncidentFaqChannel(
  input: ApproveReleaseIncidentFaqChannelInput,
  signal?: AbortSignal,
): Promise<ReleaseIncidentFaqWorkspaceResponse> {
  return new Promise<ReleaseIncidentFaqWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      const channel =
        channels.find((item) => item.id === input.channelId) ?? null;

      if (!channel || channel.status !== "awaiting-review") {
        reject(new Error("Channel approval is not available."));
        return;
      }

      channels = channels.map((item) =>
        item.id === input.channelId
          ? {
              ...item,
              status: "approved",
              note: `${item.owner} approved ${item.label}.`,
            }
          : item,
      );

      appendAuditEvent(
        "approved",
        channel.owner,
        `${channel.owner} approved ${channel.label}.`,
      );

      const nextChannel = nextQueuedChannel();
      if (nextChannel) {
        channels = channels.map((item) =>
          item.id === nextChannel.id
            ? {
                ...item,
                status: "awaiting-review",
                note: `${item.label} is the next cross-channel FAQ lane awaiting review.`,
              }
            : item,
        );

        run = {
          ...run,
          stage: "channel-review",
          activeChannelId: nextChannel.id,
          publishBlockedReason:
            "Finish cross-channel review before stale answers can be invalidated.",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: channel.owner,
        };
        resolve(cloneWorkspace());
        return;
      }

      faqEntries = faqEntries.map((entry) => ({
        ...entry,
        status: "stale",
      }));

      run = {
        ...run,
        stage: "stale-answer-review",
        activeChannelId: null,
        publishBlockedReason:
          "Stale answers must be invalidated before reviewer sign-off can clear the cross-channel FAQ bundle.",
        updatedAt: formatTimestamp(new Date()),
        updatedBy: channel.owner,
      };
      resolve(cloneWorkspace());
    }, releaseIncidentFaqMutationDelayMs);

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

export function invalidateReleaseIncidentFaqAnswers(
  input: InvalidateReleaseIncidentFaqAnswersInput,
  signal?: AbortSignal,
): Promise<ReleaseIncidentFaqWorkspaceResponse> {
  return new Promise<ReleaseIncidentFaqWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (run.id !== input.runId || run.stage !== "stale-answer-review") {
        reject(new Error("Stale-answer invalidation is not available."));
        return;
      }

      faqEntries = faqEntries.map((entry) => ({
        ...entry,
        status: "invalidated",
      }));

      run = {
        ...run,
        stage: "reviewer-signoff",
        publishBlockedReason:
          "Reviewer sign-off must confirm the refreshed answers before publish can proceed.",
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Mina - Support content lead",
      };

      appendAuditEvent(
        "invalidated",
        "Mina",
        "Invalidated the stale cross-channel FAQ answers so only refreshed guidance remains eligible for publish.",
      );

      resolve(cloneWorkspace());
    }, releaseIncidentFaqMutationDelayMs);

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

export function signOffReleaseIncidentFaq(
  input: SignOffReleaseIncidentFaqInput,
  signal?: AbortSignal,
): Promise<ReleaseIncidentFaqWorkspaceResponse> {
  return new Promise<ReleaseIncidentFaqWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (
        run.id !== input.runId ||
        run.stage !== "reviewer-signoff" ||
        !allFaqAnswersInvalidated()
      ) {
        reject(new Error("Reviewer sign-off is not available."));
        return;
      }

      faqEntries = faqEntries.map((entry) => ({
        ...entry,
        status: "approved",
      }));

      run = {
        ...run,
        stage: "ready-to-publish",
        publishBlockedReason: null,
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Priya - Reviewer",
      };

      appendAuditEvent(
        "signed-off",
        "Priya",
        "Reviewer sign-off recorded for the refreshed cross-channel FAQ answers.",
      );

      resolve(cloneWorkspace());
    }, releaseIncidentFaqMutationDelayMs);

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

export function publishReleaseIncidentFaq(
  input: PublishReleaseIncidentFaqInput,
  signal?: AbortSignal,
): Promise<ReleaseIncidentFaqWorkspaceResponse> {
  return new Promise<ReleaseIncidentFaqWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (
        run.id !== input.runId ||
        run.stage !== "ready-to-publish" ||
        !allFaqAnswersApproved()
      ) {
        reject(new Error("FAQ publish is not available."));
        return;
      }

      channels = channels.map((channel) => ({
        ...channel,
        status: "published",
        note: `${channel.label} published the refreshed FAQ guidance.`,
      }));

      run = {
        ...run,
        stage: "published",
        publishBlockedReason: null,
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Mina - Support content lead",
      };

      appendAuditEvent(
        "published",
        "Mina",
        "Published the synchronized cross-channel FAQ bundle after stale-answer invalidation and reviewer sign-off.",
      );

      resolve(cloneWorkspace());
    }, releaseIncidentFaqMutationDelayMs);

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
