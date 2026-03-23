import { useCallback, useEffect, useMemo, useState } from "react";
import {
  acknowledgeCommunicationChannel,
  advanceReleaseCommunicationClock,
  confirmCommunicationRecovery,
  fetchReleaseCommunicationWorkspace,
  isReleaseCommunicationAbortError,
  releaseCommunicationTickMs,
  startCommunicationPublish,
} from "./client";
import type {
  ReleaseCommunicationChannel,
  ReleaseCommunicationRun,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleaseCommunicationHandoff() {
  const [run, setRun] = useState<ReleaseCommunicationRun | null>(null);
  const [channels, setChannels] = useState<
    readonly ReleaseCommunicationChannel[]
  >([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      advanceReleaseCommunicationClock();
      setTick((currentTick) => currentTick + 1);
    }, releaseCommunicationTickMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseCommunicationWorkspace(controller.signal)
      .then((workspace) => {
        setRun(workspace.run);
        setChannels(workspace.channels);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseCommunicationAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the communication handoff workspace.");
      });

    return () => {
      controller.abort();
    };
  }, [tick]);

  const activeChannel = useMemo(
    () =>
      channels.find((channel) => channel.id === run?.activeChannelId) ?? null,
    [channels, run?.activeChannelId],
  );

  const allChannelsReady = useMemo(
    () =>
      channels.every(
        (channel) =>
          channel.status === "ready" || channel.status === "published",
      ),
    [channels],
  );

  const acknowledge = useCallback(
    (channelId: ReleaseCommunicationChannel["id"], channelName: string) => {
      setMutationStatus("working");
      setMessage(null);

      void acknowledgeCommunicationChannel({ channelId })
        .then((workspace) => {
          setRun(workspace.run);
          setChannels(workspace.channels);
          setMutationStatus("saved");
          setMessage(`Acknowledged ${channelName} for the handoff.`);
        })
        .catch(() => {
          setMutationStatus("error");
          setMessage("Could not capture the channel acknowledgement.");
        });
    },
    [],
  );

  const startPublish = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void startCommunicationPublish({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setChannels(workspace.channels);
        setMutationStatus("saved");
        setMessage("Started staged publish with the status page handoff.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage(
          "All channels must be acknowledged before staged publish can start.",
        );
      });
  }, [run]);

  const confirmRecovery = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void confirmCommunicationRecovery({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setChannels(workspace.channels);
        setMutationStatus("saved");
        setMessage(
          "Confirmed email recovery and resumed the final channel publish.",
        );
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Recovery confirmation is not available.");
      });
  }, [run]);

  return {
    acknowledge,
    activeChannel,
    allChannelsReady,
    channels,
    confirmRecovery,
    message,
    mutationStatus,
    run,
    startPublish,
    status,
  };
}
