import { useCallback, useEffect, useMemo, useState } from "react";
import {
  acknowledgeReleaseEscalation,
  advanceReleaseEscalationClock,
  fetchReleaseEscalationWorkspace,
  isReleaseEscalationAbortError,
  releaseEscalationTickMs,
  startReleaseEscalation,
} from "./client";
import type { ReleaseEscalationRoute, ReleaseEscalationRun } from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleaseEscalationRouting() {
  const [run, setRun] = useState<ReleaseEscalationRun | null>(null);
  const [routes, setRoutes] = useState<readonly ReleaseEscalationRoute[]>([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      advanceReleaseEscalationClock();
      setTick((currentTick) => currentTick + 1);
    }, releaseEscalationTickMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseEscalationWorkspace(controller.signal)
      .then((workspace) => {
        setRun(workspace.run);
        setRoutes(workspace.routes);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseEscalationAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the escalation routing workspace.");
      });

    return () => {
      controller.abort();
    };
  }, [tick]);

  const activeRoute = useMemo(
    () => routes.find((route) => route.id === run?.activeRouteId) ?? null,
    [routes, run?.activeRouteId],
  );

  const start = useCallback(() => {
    if (!run) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void startReleaseEscalation({ runId: run.id })
      .then((workspace) => {
        setRun(workspace.run);
        setRoutes(workspace.routes);
        setMutationStatus("saved");
        setMessage(
          "Started escalation routing with the primary database page owner.",
        );
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Escalation routing is no longer ready to start.");
      });
  }, [run]);

  const acknowledge = useCallback(
    (routeId: ReleaseEscalationRoute["id"], owner: string) => {
      setMutationStatus("working");
      setMessage(null);

      void acknowledgeReleaseEscalation({ routeId })
        .then((workspace) => {
          setRun(workspace.run);
          setRoutes(workspace.routes);
          setMutationStatus("saved");
          setMessage(`Acknowledged escalation route from ${owner}.`);
        })
        .catch(() => {
          setMutationStatus("error");
          setMessage("Acknowledgement is not available.");
        });
    },
    [],
  );

  return {
    acknowledge,
    activeRoute,
    message,
    mutationStatus,
    routes,
    run,
    start,
    status,
  };
}
