import type {
  AcknowledgeCommunicationChannelInput,
  ConfirmCommunicationRecoveryInput,
  ReleaseCommunicationChannel,
  ReleaseCommunicationRun,
  ReleaseCommunicationWorkspaceResponse,
  StartCommunicationPublishInput,
} from "./types";

const initialRun = {
  id: "handoff-run-1",
  title: "Incident communication handoff and staged publish recovery",
  summary:
    "Hand off the incident update across status page, email, and social channels, require owner acknowledgements, and recover the staged publish when one channel needs a re-send.",
  stage: "ready-for-handoff",
  activeChannelId: null,
  recoveryReason: null,
  updatedAt: "2026-03-24 00:20 UTC",
  updatedBy: "Avery - Incident commander",
} as const satisfies ReleaseCommunicationRun;

const initialChannels = [
  {
    id: "handoff-channel-1",
    name: "Status page",
    owner: "Mina",
    status: "ready",
    note: "Status page draft is approved and ready for publish.",
  },
  {
    id: "handoff-channel-2",
    name: "Email update",
    owner: "Priya",
    status: "awaiting-ack",
    note: "Email copy is ready but still waiting for channel-owner acknowledgement.",
  },
  {
    id: "handoff-channel-3",
    name: "Social update",
    owner: "Jordan",
    status: "awaiting-ack",
    note: "Social copy is queued behind email and still needs owner acknowledgement.",
  },
] as const satisfies readonly ReleaseCommunicationChannel[];

export const releaseCommunicationFetchDelayMs = 180;
export const releaseCommunicationMutationDelayMs = 220;
export const releaseCommunicationTickMs = 1000;

let run: ReleaseCommunicationRun = { ...initialRun };
let channels: ReleaseCommunicationChannel[] = initialChannels.map(
  (channel) => ({
    ...channel,
  }),
);

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

function cloneWorkspace(): ReleaseCommunicationWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    run: { ...run },
    channels: channels.map((channel) => ({ ...channel })),
  };
}

function allChannelsReady() {
  return channels.every(
    (channel) => channel.status === "ready" || channel.status === "published",
  );
}

function nextReadyChannel() {
  return channels.find((channel) => channel.status === "ready") ?? null;
}

export function resetReleaseCommunicationHandoffMockState() {
  run = { ...initialRun };
  channels = initialChannels.map((channel) => ({ ...channel }));
}

export function isReleaseCommunicationAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function advanceReleaseCommunicationClock() {
  if (run.stage !== "publishing") {
    return;
  }

  const activeChannel =
    channels.find((channel) => channel.id === run.activeChannelId) ?? null;

  if (!activeChannel || activeChannel.status !== "publishing") {
    return;
  }

  if (activeChannel.id === "handoff-channel-2") {
    channels = channels.map((channel) =>
      channel.id === activeChannel.id
        ? {
            ...channel,
            status: "recovering",
            note: "Email delivery bounced for the executive list. Recovery confirmation is required before staged publish resumes.",
          }
        : channel,
    );

    run = {
      ...run,
      stage: "recovery",
      activeChannelId: activeChannel.id,
      recoveryReason:
        "Email update needs recovery confirmation after a partial send bounced for the executive list.",
      updatedAt: formatTimestamp(new Date()),
      updatedBy: "Priya - Communications lead",
    };
    return;
  }

  channels = channels.map((channel) =>
    channel.id === activeChannel.id
      ? {
          ...channel,
          status: "published",
          note: `${channel.name} published successfully and the handoff can move to the next channel.`,
        }
      : channel,
  );

  const nextChannel = nextReadyChannel();

  if (nextChannel) {
    channels = channels.map((channel) =>
      channel.id === nextChannel.id
        ? {
            ...channel,
            status: "publishing",
            note: `Publishing ${channel.name} as the next handoff stage.`,
          }
        : channel,
    );
    run = {
      ...run,
      activeChannelId: nextChannel.id,
      updatedAt: formatTimestamp(new Date()),
      updatedBy: "Avery - Incident commander",
    };
    return;
  }

  run = {
    ...run,
    stage: "completed",
    activeChannelId: null,
    recoveryReason: null,
    updatedAt: formatTimestamp(new Date()),
    updatedBy: "Avery - Incident commander",
  };
}

export function fetchReleaseCommunicationWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseCommunicationWorkspaceResponse> {
  return new Promise<ReleaseCommunicationWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);
        resolve(cloneWorkspace());
      }, releaseCommunicationFetchDelayMs);

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

export function acknowledgeCommunicationChannel(
  input: AcknowledgeCommunicationChannelInput,
  signal?: AbortSignal,
): Promise<ReleaseCommunicationWorkspaceResponse> {
  return new Promise<ReleaseCommunicationWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        channels = channels.map((channel) =>
          channel.id === input.channelId
            ? {
                ...channel,
                status: "ready",
                note: `${channel.name} owner acknowledged the handoff and cleared the channel for publish.`,
              }
            : channel,
        );
        resolve(cloneWorkspace());
      }, releaseCommunicationMutationDelayMs);

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

export function startCommunicationPublish(
  input: StartCommunicationPublishInput,
  signal?: AbortSignal,
): Promise<ReleaseCommunicationWorkspaceResponse> {
  return new Promise<ReleaseCommunicationWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (run.id !== input.runId || run.stage !== "ready-for-handoff") {
          reject(
            new Error("Communication handoff is no longer ready to publish."),
          );
          return;
        }

        if (!allChannelsReady()) {
          reject(
            new Error(
              "All channels must be acknowledged before staged publish can start.",
            ),
          );
          return;
        }

        channels = channels.map((channel) =>
          channel.id === "handoff-channel-1"
            ? {
                ...channel,
                status: "publishing",
                note: `Publishing ${channel.name} as the first handoff stage.`,
              }
            : channel,
        );

        run = {
          ...run,
          stage: "publishing",
          activeChannelId: "handoff-channel-1",
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Avery - Incident commander",
        };
        resolve(cloneWorkspace());
      }, releaseCommunicationMutationDelayMs);

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

export function confirmCommunicationRecovery(
  input: ConfirmCommunicationRecoveryInput,
  signal?: AbortSignal,
): Promise<ReleaseCommunicationWorkspaceResponse> {
  return new Promise<ReleaseCommunicationWorkspaceResponse>(
    (resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);

        if (run.id !== input.runId || run.stage !== "recovery") {
          reject(new Error("Recovery confirmation is not available."));
          return;
        }

        channels = channels.map((channel) => {
          if (channel.id === "handoff-channel-2") {
            return {
              ...channel,
              status: "published",
              note: "Email recovery confirmed and the staged publish can continue to the final channel.",
            };
          }

          if (channel.id === "handoff-channel-3") {
            return {
              ...channel,
              status: "publishing",
              note: `Publishing ${channel.name} after email recovery confirmation.`,
            };
          }

          return channel;
        });

        run = {
          ...run,
          stage: "publishing",
          activeChannelId: "handoff-channel-3",
          recoveryReason: null,
          updatedAt: formatTimestamp(new Date()),
          updatedBy: "Priya - Communications lead",
        };
        resolve(cloneWorkspace());
      }, releaseCommunicationMutationDelayMs);

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
