import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveReleaseIncidentFaqChannel,
  fetchReleaseIncidentFaqWorkspace,
  invalidateReleaseIncidentFaqAnswers,
  isReleaseIncidentFaqAbortError,
  publishReleaseIncidentFaq,
  signOffReleaseIncidentFaq,
  startReleaseIncidentFaq,
} from "./client";
import type {
  ReleaseIncidentFaqAuditEvent,
  ReleaseIncidentFaqChannel,
  ReleaseIncidentFaqEntry,
  ReleaseIncidentFaqRun,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleaseIncidentFaqCuration() {
  const [run, setRun] = useState<ReleaseIncidentFaqRun | null>(null);
  const [channels, setChannels] = useState<
    readonly ReleaseIncidentFaqChannel[]
  >([]);
  const [faqEntries, setFaqEntries] = useState<
    readonly ReleaseIncidentFaqEntry[]
  >([]);
  const [auditEvents, setAuditEvents] = useState<
    readonly ReleaseIncidentFaqAuditEvent[]
  >([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseIncidentFaqWorkspace(controller.signal)
      .then((workspace) => {
        setRun(workspace.run);
        setChannels(workspace.channels);
        setFaqEntries(workspace.faqEntries);
        setAuditEvents(workspace.auditEvents);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseIncidentFaqAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the incident FAQ curation workspace.");
      });

    return () => {
      controller.abort();
    };
  }, []);

  const activeChannel = useMemo(
    () =>
      channels.find((channel) => channel.id === run?.activeChannelId) ?? null,
    [channels, run?.activeChannelId],
  );

  const staleEntries = useMemo(
    () => faqEntries.filter((entry) => entry.status === "stale"),
    [faqEntries],
  );

  const start = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void startReleaseIncidentFaq({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setChannels(workspace.channels);
        setFaqEntries(workspace.faqEntries);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Started cross-channel incident FAQ review.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Incident FAQ curation is no longer ready to start.");
      });
  }, [run]);

  const approveChannel = useCallback(
    (channelId: ReleaseIncidentFaqChannel["id"], label: string) => {
      setMutationStatus("working");
      setMessage(null);

      void approveReleaseIncidentFaqChannel({ channelId })
        .then((workspace) => {
          setRun(workspace.run);
          setChannels(workspace.channels);
          setFaqEntries(workspace.faqEntries);
          setAuditEvents(workspace.auditEvents);
          setMutationStatus("saved");
          setMessage(`Approved ${label} for the FAQ bundle.`);
        })
        .catch(() => {
          setMutationStatus("error");
          setMessage("Channel approval is not available.");
        });
    },
    [],
  );

  const invalidateAnswers = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void invalidateReleaseIncidentFaqAnswers({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setChannels(workspace.channels);
        setFaqEntries(workspace.faqEntries);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Invalidated the stale FAQ answers.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Stale-answer invalidation is not available.");
      });
  }, [run]);

  const signOff = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void signOffReleaseIncidentFaq({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setChannels(workspace.channels);
        setFaqEntries(workspace.faqEntries);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Recorded reviewer sign-off for the refreshed FAQ answers.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Reviewer sign-off is not available.");
      });
  }, [run]);

  const publish = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void publishReleaseIncidentFaq({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setChannels(workspace.channels);
        setFaqEntries(workspace.faqEntries);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Published the cross-channel FAQ bundle.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("FAQ publish is not available.");
      });
  }, [run]);

  return {
    activeChannel,
    approveChannel,
    auditEvents,
    channels,
    faqEntries,
    invalidateAnswers,
    message,
    mutationStatus,
    publish,
    run,
    signOff,
    staleEntries,
    start,
    status,
  };
}
