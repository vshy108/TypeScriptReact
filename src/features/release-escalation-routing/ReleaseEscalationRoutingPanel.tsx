import { useReleaseEscalationRouting } from "./useReleaseEscalationRouting";

function getStatusTone(
  status: "loading" | "ready" | "error",
  mutationStatus: "idle" | "working" | "saved" | "error",
) {
  if (status === "error" || mutationStatus === "error") {
    return "status--error";
  }

  if (status === "loading" || mutationStatus === "working") {
    return "status--idle";
  }

  return mutationStatus === "saved" ? "status--success" : "status--idle";
}

function formatStageLabel(
  stage: "draft" | "routing" | "rerouted" | "completed",
) {
  if (stage === "draft") {
    return "Draft";
  }

  if (stage === "routing") {
    return "Routing";
  }

  if (stage === "rerouted") {
    return "Rerouted";
  }

  return "Completed";
}

export default function ReleaseEscalationRoutingPanel() {
  const { acknowledge, activeRoute, message, mutationStatus, routes, run, start, status } =
    useReleaseEscalationRouting();

  const defaultMessage =
    run?.stage === "completed"
      ? "Completed the escalation queue after rerouting the missed acknowledgement and handing the next route to the correct owner."
      : run?.stage === "rerouted"
        ? run.rerouteReason ??
          "The acknowledgement deadline expired and the escalation was rerouted to a fallback owner."
        : "Start routing, watch the acknowledgement deadline expire, and then confirm how fallback reassignment keeps the escalation queue moving.";

  return (
    <div className="release-escalation-routing">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release escalation routing</h3>
      </div>

      <p className="section-copy">
        This seventeenth feature slice models an escalation queue with acknowledgement deadlines. If the primary owner
        misses the window, the route is reassigned automatically to a fallback owner and the rest of the queue keeps moving.
      </p>

      <div className="release-escalation-routing__summary">
        <article className="sample-card">
          <p className="eyebrow">Routing stage</p>
          <h4>{run ? formatStageLabel(run.stage) : "Loading"}</h4>
          <p>{run ? `${run.updatedBy} at ${run.updatedAt}` : "Waiting for escalation routing workspace"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Active route</p>
          <h4>{activeRoute?.label ?? "Not started"}</h4>
          <p>{activeRoute ? `${activeRoute.currentOwner} is the current owner` : "No route is active yet"}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === "loading" ? "Loading escalation routing workspace..." : message ?? defaultMessage}
      </div>

      {run ? (
        <div className="release-escalation-routing__grid">
          <section className="sample-card release-escalation-routing__panel" aria-label="Escalation controls">
            <div className="section-heading">
              <p className="eyebrow">Escalation controls</p>
              <h4>Routing queue</h4>
            </div>

            <p>{run.summary}</p>
            {run.rerouteReason ? <p className="release-escalation-routing__reroute">{run.rerouteReason}</p> : null}

            <div className="release-escalation-routing__actions">
              <button
                type="button"
                className="primary-button"
                disabled={run.stage !== "draft"}
                onClick={start}
              >
                {run.stage === "draft" ? "Start escalation routing" : "Routing already started"}
              </button>
            </div>
          </section>

          <section className="sample-card release-escalation-routing__panel" aria-label="Escalation routes">
            <div className="section-heading">
              <p className="eyebrow">Escalation routes</p>
              <h4>Owner deadlines</h4>
            </div>

            <div className="release-escalation-routing__route-list">
              {routes.map((route) => (
                <article key={route.id} className="release-escalation-routing__route-card">
                  <div>
                    <strong>{route.label}</strong>
                    <p>{route.note}</p>
                  </div>

                  <div>
                    <span>{route.status}</span>
                    <p>{route.currentOwner}</p>
                    <p>{route.deadlineSeconds === null ? "No active deadline" : `${route.deadlineSeconds}s left`}</p>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={route.status !== "awaiting-ack" && route.status !== "rerouted"}
                      onClick={() => acknowledge(route.id, route.currentOwner)}
                    >
                      {route.status === "queued" || route.status === "completed"
                        ? "Acknowledged"
                        : `Acknowledge ${route.currentOwner}`}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}