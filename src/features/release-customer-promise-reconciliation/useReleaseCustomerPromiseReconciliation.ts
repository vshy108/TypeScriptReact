import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveReleaseCustomerPromise,
  fetchReleaseCustomerPromiseWorkspace,
  invalidateReleaseCustomerClaims,
  isReleaseCustomerPromiseAbortError,
  publishReleaseCustomerPromises,
  signOffReleaseCustomerPromises,
  startReleaseCustomerPromise,
} from "./client";
import type {
  ReleaseCustomerClaim,
  ReleaseCustomerPromise,
  ReleaseCustomerPromiseAuditEvent,
  ReleaseCustomerPromiseRun,
} from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleaseCustomerPromiseReconciliation() {
  const [run, setRun] = useState<ReleaseCustomerPromiseRun | null>(null);
  const [promises, setPromises] = useState<readonly ReleaseCustomerPromise[]>(
    [],
  );
  const [claims, setClaims] = useState<readonly ReleaseCustomerClaim[]>([]);
  const [auditEvents, setAuditEvents] = useState<
    readonly ReleaseCustomerPromiseAuditEvent[]
  >([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseCustomerPromiseWorkspace(controller.signal)
      .then((workspace) => {
        setRun(workspace.run);
        setPromises(workspace.promises);
        setClaims(workspace.claims);
        setAuditEvents(workspace.auditEvents);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseCustomerPromiseAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the customer promise workspace.");
      });

    return () => {
      controller.abort();
    };
  }, []);

  const activePromise = useMemo(
    () => promises.find((item) => item.id === run?.activePromiseId) ?? null,
    [promises, run?.activePromiseId],
  );

  const staleClaims = useMemo(
    () => claims.filter((item) => item.status === "stale"),
    [claims],
  );

  const start = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void startReleaseCustomerPromise({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setPromises(workspace.promises);
        setClaims(workspace.claims);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Started customer promise reconciliation.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage(
          "Customer promise reconciliation is no longer ready to start.",
        );
      });
  }, [run]);

  const approvePromise = useCallback(
    (promiseId: ReleaseCustomerPromise["id"], label: string) => {
      setMutationStatus("working");
      setMessage(null);

      void approveReleaseCustomerPromise({ promiseId })
        .then((workspace) => {
          setRun(workspace.run);
          setPromises(workspace.promises);
          setClaims(workspace.claims);
          setAuditEvents(workspace.auditEvents);
          setMutationStatus("saved");
          setMessage(`Approved ${label} for the reconciled customer promises.`);
        })
        .catch(() => {
          setMutationStatus("error");
          setMessage("Promise approval is not available.");
        });
    },
    [],
  );

  const invalidateClaims = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void invalidateReleaseCustomerClaims({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setPromises(workspace.promises);
        setClaims(workspace.claims);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Invalidated the stale customer claims.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Stale-claim invalidation is not available.");
      });
  }, [run]);

  const signOff = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void signOffReleaseCustomerPromises({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setPromises(workspace.promises);
        setClaims(workspace.claims);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage(
          "Recorded approver sign-off for the reconciled customer promises.",
        );
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Approver sign-off is not available.");
      });
  }, [run]);

  const publish = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void publishReleaseCustomerPromises({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setPromises(workspace.promises);
        setClaims(workspace.claims);
        setAuditEvents(workspace.auditEvents);
        setMutationStatus("saved");
        setMessage("Published the reconciled customer promises.");
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Customer promise publish is not available.");
      });
  }, [run]);

  return {
    activePromise,
    approvePromise,
    auditEvents,
    claims,
    invalidateClaims,
    message,
    mutationStatus,
    promises,
    publish,
    run,
    signOff,
    staleClaims,
    start,
    status,
  };
}
