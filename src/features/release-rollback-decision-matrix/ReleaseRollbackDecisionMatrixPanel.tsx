import { useReleaseRollbackDecisionMatrix } from "./useReleaseRollbackDecisionMatrix";

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
  stage:
    | "draft"
    | "resolving-matrix"
    | "awaiting-quorum"
    | "ready-to-execute"
    | "executed",
) {
  if (stage === "draft") {
    return "Draft";
  }

  if (stage === "resolving-matrix") {
    return "Resolving matrix";
  }

  if (stage === "awaiting-quorum") {
    return "Awaiting quorum";
  }

  if (stage === "ready-to-execute") {
    return "Ready to execute";
  }

  return "Executed";
}

export default function ReleaseRollbackDecisionMatrixPanel() {
  const {
    approvedCount,
    approve,
    auditEvents,
    conflictingMetrics,
    execute,
    message,
    metrics,
    mutationStatus,
    resolveMetric,
    run,
    signoffs,
    start,
    status,
  } = useReleaseRollbackDecisionMatrix();

  const defaultMessage =
    run?.stage === "executed"
      ? `Executed the ${run.recommendedAction} path after the matrix converged and quorum signed off.`
      : run?.stage === "awaiting-quorum"
        ? run.publishBlockedReason ??
          "The matrix is resolved, but quorum approval still blocks execution."
        : "Start the rollback review, resolve the conflicting signals in the matrix, collect quorum sign-off, and then execute the final decision.";

  return (
    <div className="release-rollback-decision-matrix">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release rollback decision matrix</h3>
      </div>

      <p className="section-copy">
        This twenty-first feature slice models rollback governance under ambiguity. Conflicting signals must be resolved
        into one canonical decision, and at least two operators must approve before the rollback call can execute.
      </p>

      <div className="release-rollback-decision-matrix__summary">
        <article className="sample-card">
          <p className="eyebrow">Decision stage</p>
          <h4>{run ? formatStageLabel(run.stage) : "Loading"}</h4>
          <p>{run ? `${run.updatedBy} at ${run.updatedAt}` : "Waiting for rollback decision workspace"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Recommended action</p>
          <h4>{run ? run.recommendedAction : "Loading"}</h4>
          <p>{run?.publishBlockedReason ?? "The decision gate is currently clear."}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Quorum</p>
          <h4>{`${approvedCount}/2`}</h4>
          <p>{conflictingMetrics.length > 0 ? `${conflictingMetrics.length} conflicting metric remains` : "Matrix conflicts are cleared"}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === "loading" ? "Loading rollback decision workspace..." : message ?? defaultMessage}
      </div>

      {run ? (
        <div className="release-rollback-decision-matrix__grid">
          <section className="sample-card release-rollback-decision-matrix__panel" aria-label="Rollback decision matrix">
            <div className="section-heading">
              <p className="eyebrow">Decision matrix</p>
              <h4>Conflicting signals</h4>
            </div>

            <p>{run.summary}</p>

            <div className="release-rollback-decision-matrix__actions">
              <button
                type="button"
                className="primary-button"
                disabled={run.stage !== "draft"}
                onClick={start}
              >
                {run.stage === "draft" ? "Start decision review" : "Decision review started"}
              </button>

              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "ready-to-execute"}
                onClick={execute}
              >
                Execute decision
              </button>
            </div>

            <div className="release-rollback-decision-matrix__metric-list">
              {metrics.map((metric) => (
                <article key={metric.id} className="release-rollback-decision-matrix__metric-card">
                  <div>
                    <strong>{metric.label}</strong>
                    <p>{metric.note}</p>
                    <p>{`${metric.currentValue} against ${metric.threshold}`}</p>
                  </div>

                  <div>
                    <span>{metric.status}</span>
                    <p>{metric.source}</p>
                    <p>{metric.recommendation}</p>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={metric.status !== "conflicting"}
                      onClick={() => resolveMetric(metric.id, "rollback")}
                    >
                      {`Resolve ${metric.label} as rollback`}
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={metric.status !== "conflicting"}
                      onClick={() => resolveMetric(metric.id, "hold")}
                    >
                      {`Resolve ${metric.label} as hold`}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="sample-card release-rollback-decision-matrix__panel" aria-label="Quorum sign-off and audit">
            <div className="section-heading">
              <p className="eyebrow">Quorum sign-off</p>
              <h4>Operator approvals</h4>
            </div>

            <div className="release-rollback-decision-matrix__signoff-list">
              {signoffs.map((signoff) => (
                <article key={signoff.id} className="release-rollback-decision-matrix__signoff-card">
                  <div>
                    <strong>{signoff.owner}</strong>
                    <p>{signoff.note}</p>
                  </div>

                  <div>
                    <span>{signoff.status}</span>
                    <p>{signoff.role}</p>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={run.stage === "draft" || signoff.status !== "pending" || conflictingMetrics.length > 0}
                      onClick={() => approve(signoff.id, signoff.owner)}
                    >
                      {signoff.status === "approved" ? "Approved" : `Approve as ${signoff.owner}`}
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="release-rollback-decision-matrix__audit-list">
              {auditEvents.map((event) => (
                <article key={event.id} className="release-rollback-decision-matrix__audit-card">
                  <div className="release-rollback-decision-matrix__audit-meta">
                    <strong>{event.actor}</strong>
                    <span>{event.action}</span>
                  </div>
                  <p>{event.detail}</p>
                  <p>{event.timestamp}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}