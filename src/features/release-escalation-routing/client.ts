import type {
  AcknowledgeReleaseEscalationInput,
  ReleaseEscalationRoute,
  ReleaseEscalationRun,
  ReleaseEscalationWorkspaceResponse,
  StartReleaseEscalationInput,
} from "./types";

const initialRun = {
  id: "escalation-run-1",
  title: "Escalation routing with acknowledgement deadlines",
  summary:
    "Route each escalation to the primary owner first, reroute automatically if the acknowledgement window expires, and keep the queue moving through fallback assignment.",
  stage: "draft",
  activeRouteId: null,
  rerouteReason: null,
  updatedAt: "2026-03-24 00:55 UTC",
  updatedBy: "Taylor - Incident lead",
} as const satisfies ReleaseEscalationRun;

const initialRoutes = [
  {
    id: "escalation-route-1",
    label: "Database saturation page",
    primaryOwner: "Mina",
    fallbackOwner: "Jordan",
    currentOwner: "Mina",
    deadlineSeconds: null,
    status: "queued",
    note: "Primary on-call owns the first acknowledgement window for the database saturation page.",
  },
  {
    id: "escalation-route-2",
    label: "Executive stakeholder update",
    primaryOwner: "Priya",
    fallbackOwner: "Avery",
    currentOwner: "Priya",
    deadlineSeconds: null,
    status: "queued",
    note: "Exec update is queued behind the database page acknowledgement.",
  },
] as const satisfies readonly ReleaseEscalationRoute[];

export const releaseEscalationFetchDelayMs = 180;
export const releaseEscalationMutationDelayMs = 220;
export const releaseEscalationTickMs = 1000;

let run: ReleaseEscalationRun = { ...initialRun };
let routes: ReleaseEscalationRoute[] = initialRoutes.map((route) => ({
  ...route,
}));

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

function cloneWorkspace(): ReleaseEscalationWorkspaceResponse {
  return {
    refreshedAt: formatTimestamp(new Date()),
    run: { ...run },
    routes: routes.map((route) => ({ ...route })),
  };
}

function nextQueuedRoute() {
  return routes.find((route) => route.status === "queued") ?? null;
}

export function resetReleaseEscalationRoutingMockState() {
  run = { ...initialRun };
  routes = initialRoutes.map((route) => ({ ...route }));
}

export function isReleaseEscalationAbortError(
  error: unknown,
): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

export function advanceReleaseEscalationClock() {
  if (run.stage !== "routing" && run.stage !== "rerouted") {
    return;
  }

  const activeRoute =
    routes.find((route) => route.id === run.activeRouteId) ?? null;

  if (!activeRoute || activeRoute.deadlineSeconds === null) {
    return;
  }

  if (activeRoute.status === "awaiting-ack") {
    const nextDeadline = Math.max(0, activeRoute.deadlineSeconds - 1);

    routes = routes.map((route) =>
      route.id === activeRoute.id
        ? { ...route, deadlineSeconds: nextDeadline }
        : route,
    );

    if (nextDeadline === 0) {
      routes = routes.map((route) =>
        route.id === activeRoute.id
          ? {
              ...route,
              status: "rerouted",
              currentOwner: route.fallbackOwner,
              deadlineSeconds: 2,
              note: `Acknowledgement deadline missed by ${route.primaryOwner}. Escalation rerouted to ${route.fallbackOwner}.`,
            }
          : route,
      );

      run = {
        ...run,
        stage: "rerouted",
        rerouteReason: `${activeRoute.label} missed its acknowledgement deadline and was rerouted to ${activeRoute.fallbackOwner}.`,
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Sentinel - escalation router",
      };
    }
    return;
  }

  if (activeRoute.status === "rerouted") {
    const nextDeadline = Math.max(0, activeRoute.deadlineSeconds - 1);
    routes = routes.map((route) =>
      route.id === activeRoute.id
        ? { ...route, deadlineSeconds: nextDeadline }
        : route,
    );
  }
}

export function fetchReleaseEscalationWorkspace(
  signal?: AbortSignal,
): Promise<ReleaseEscalationWorkspaceResponse> {
  return new Promise<ReleaseEscalationWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve(cloneWorkspace());
    }, releaseEscalationFetchDelayMs);

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

export function startReleaseEscalation(
  input: StartReleaseEscalationInput,
  signal?: AbortSignal,
): Promise<ReleaseEscalationWorkspaceResponse> {
  return new Promise<ReleaseEscalationWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (run.id !== input.runId || run.stage !== "draft") {
        reject(new Error("Escalation routing is no longer ready to start."));
        return;
      }

      routes = routes.map((route, index) =>
        index === 0
          ? {
              ...route,
              status: "awaiting-ack",
              deadlineSeconds: 2,
              note: `Awaiting acknowledgement from ${route.primaryOwner} before the deadline expires.`,
            }
          : route,
      );

      run = {
        ...run,
        stage: "routing",
        activeRouteId: "escalation-route-1",
        updatedAt: formatTimestamp(new Date()),
        updatedBy: "Taylor - Incident lead",
      };
      resolve(cloneWorkspace());
    }, releaseEscalationMutationDelayMs);

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

export function acknowledgeReleaseEscalation(
  input: AcknowledgeReleaseEscalationInput,
  signal?: AbortSignal,
): Promise<ReleaseEscalationWorkspaceResponse> {
  return new Promise<ReleaseEscalationWorkspaceResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      const activeRoute =
        routes.find((route) => route.id === input.routeId) ?? null;

      if (
        !activeRoute ||
        (activeRoute.status !== "awaiting-ack" &&
          activeRoute.status !== "rerouted")
      ) {
        reject(new Error("Acknowledgement is not available."));
        return;
      }

      routes = routes.map((route) =>
        route.id === input.routeId
          ? {
              ...route,
              status: "completed",
              deadlineSeconds: null,
              note: `${route.currentOwner} acknowledged ${route.label} and closed this escalation route.`,
            }
          : route,
      );

      const nextRoute = nextQueuedRoute();

      if (nextRoute) {
        routes = routes.map((route) =>
          route.id === nextRoute.id
            ? {
                ...route,
                status: "awaiting-ack",
                deadlineSeconds: 2,
                note: `Awaiting acknowledgement from ${route.primaryOwner} before the deadline expires.`,
              }
            : route,
        );
        run = {
          ...run,
          stage: "routing",
          activeRouteId: nextRoute.id,
          rerouteReason: null,
          updatedAt: formatTimestamp(new Date()),
          updatedBy: activeRoute.currentOwner,
        };
        resolve(cloneWorkspace());
        return;
      }

      run = {
        ...run,
        stage: "completed",
        activeRouteId: null,
        rerouteReason: null,
        updatedAt: formatTimestamp(new Date()),
        updatedBy: activeRoute.currentOwner,
      };
      resolve(cloneWorkspace());
    }, releaseEscalationMutationDelayMs);

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
