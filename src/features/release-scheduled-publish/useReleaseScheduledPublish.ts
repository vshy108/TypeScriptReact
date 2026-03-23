import { useCallback, useEffect, useMemo, useState } from "react";
import {
  advanceReleaseScheduledClock,
  approveReleaseScheduled,
  fetchReleaseScheduledWorkspace,
  isReleaseScheduledAbortError,
  releaseScheduledTickMs,
  rollbackPublishedRelease,
  scheduleReleasePublish,
} from "./client";
import type { ReleaseScheduleApproval, ReleaseScheduleRecord } from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleaseScheduledPublish() {
  const [record, setRecord] = useState<ReleaseScheduleRecord | null>(null);
  const [approvals, setApprovals] = useState<
    readonly ReleaseScheduleApproval[]
  >([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      advanceReleaseScheduledClock();
      setTick((currentTick) => currentTick + 1);
    }, releaseScheduledTickMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseScheduledWorkspace(controller.signal)
      .then((workspace) => {
        setRecord(workspace.record);
        setApprovals(workspace.approvals);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseScheduledAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the scheduled publish workspace.");
      });

    return () => {
      controller.abort();
    };
  }, [tick]);

  const approvalsReady = useMemo(
    () => approvals.every((approval) => approval.status === "approved"),
    [approvals],
  );
  const canRollback = useMemo(
    () =>
      record?.stage === "published" && (record.rollbackWindowSeconds ?? 0) > 0,
    [record?.rollbackWindowSeconds, record?.stage],
  );

  const approve = useCallback(
    (approvalId: ReleaseScheduleApproval["id"], role: string) => {
      setMutationStatus("working");
      setMessage(null);

      void approveReleaseScheduled({ approvalId })
        .then((workspace) => {
          setRecord(workspace.record);
          setApprovals(workspace.approvals);
          setMutationStatus("saved");
          setMessage(`Approved ${role}.`);
        })
        .catch(() => {
          setMutationStatus("error");
          setMessage("Could not record the approval.");
        });
    },
    [],
  );

  const schedule = useCallback(() => {
    if (!record) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void scheduleReleasePublish({ scheduleId: record.id })
      .then((workspace) => {
        setRecord(workspace.record);
        setApprovals(workspace.approvals);
        setMutationStatus("saved");
        setMessage(
          `Scheduled publish. Countdown started at ${workspace.record.countdownSeconds} seconds.`,
        );
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Approvals must be complete before scheduling publish.");
      });
  }, [record]);

  const rollback = useCallback(() => {
    setMutationStatus("working");
    setMessage(null);

    void rollbackPublishedRelease()
      .then((workspace) => {
        setRecord(workspace.record);
        setApprovals(workspace.approvals);
        setMutationStatus("saved");
        setMessage(
          "Rolled back the published release during the rollback window.",
        );
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Rollback is not currently available.");
      });
  }, []);

  return {
    approvals,
    approvalsReady,
    canRollback,
    message,
    mutationStatus,
    approve,
    record,
    rollback,
    schedule,
    status,
  };
}
