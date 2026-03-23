import { useReleaseMultiRegionRollback } from "./useReleaseMultiRegionRollback";

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
  stage: "draft" | "rolling-back" | "partial-recovery" | "completed",
) {
  if (stage === "draft") {
    return "Draft";
  }

  if (stage === "rolling-back") {
    return "Rolling back";
  }

  if (stage === "partial-recovery") {
    return "Partial recovery";
  }

  return "Completed";
}

export default function ReleaseMultiRegionRollbackPanel() {
  const {
    activeRegion,
    acknowledge,
    dependencies,
    dependenciesReady,
    message,
    mutationStatus,
    regions,
    resume,
    run,
    start,
    status,
  } = useReleaseMultiRegionRollback();

  const defaultMessage =
    run?.stage === "completed"
      ? "Completed rollback across the targeted regions after dependency acknowledgements cleared the final recovery step."
      : run?.stage === "partial-recovery"
        ? run.recoverySummary ??
          "Rollback paused in partial recovery while dependencies finish their follow-up work."
        : "Start the targeted rollback, watch one region recover, then clear dependencies before the final region resumes.";

  return (
    <div className="release-multi-region-rollback">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release multi-region rollback</h3>
      </div>

      <p className="section-copy">
        This fifteenth feature slice models a rollback that only targets the affected regions. One region recovers
        first, then the run pauses in partial recovery until the right dependencies acknowledge their follow-up work.
      </p>

      <div className="release-multi-region-rollback__summary">
        <article className="sample-card">
          <p className="eyebrow">Rollback stage</p>
          <h4>{run ? formatStageLabel(run.stage) : "Loading"}</h4>
          <p>{run ? `${run.updatedBy} at ${run.updatedAt}` : "Waiting for rollback workspace"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Active region</p>
          <h4>{activeRegion?.name ?? "Not started"}</h4>
          <p>{activeRegion ? `${activeRegion.trafficPercent}% traffic is currently recovering` : "No targeted region is active yet"}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === "loading" ? "Loading multi-region rollback workspace..." : message ?? defaultMessage}
      </div>

      {run ? (
        <div className="release-multi-region-rollback__grid">
          <section className="sample-card release-multi-region-rollback__panel" aria-label="Rollback controls">
            <div className="section-heading">
              <p className="eyebrow">Rollback controls</p>
              <h4>Targeted recovery</h4>
            </div>

            <p>{run.summary}</p>
            <p>
              {dependenciesReady
                ? "Dependencies are clear for the final recovery step."
                : "Dependencies are still blocking the final targeted region."}
            </p>

            <div className="release-multi-region-rollback__actions">
              <button
                type="button"
                className="primary-button"
                disabled={run.stage !== "draft"}
                onClick={start}
              >
                {run.stage === "draft" ? "Start targeted rollback" : "Rollback already started"}
              </button>

              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "partial-recovery"}
                onClick={resume}
              >
                Resume final region recovery
              </button>
            </div>

            {run.recoverySummary ? (
              <p className="release-multi-region-rollback__summary-text">{run.recoverySummary}</p>
            ) : null}
          </section>

          <section className="sample-card release-multi-region-rollback__panel" aria-label="Region timeline">
            <div className="section-heading">
              <p className="eyebrow">Region timeline</p>
              <h4>Rollback targets</h4>
            </div>

            <div className="release-multi-region-rollback__region-list">
              {regions.map((region) => (
                <article key={region.id} className="release-multi-region-rollback__region-card">
                  <div>
                    <strong>{region.name}</strong>
                    <p>{region.note}</p>
                  </div>
                  <div>
                    <span>{region.status}</span>
                    <p>{region.trafficPercent}% traffic</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="sample-card release-multi-region-rollback__panel" aria-label="Dependency acknowledgements">
            <div className="section-heading">
              <p className="eyebrow">Dependency acknowledgements</p>
              <h4>Recovery blockers</h4>
            </div>

            <div className="release-multi-region-rollback__dependency-list">
              {dependencies.map((dependency) => (
                <article key={dependency.id} className="release-multi-region-rollback__dependency-card">
                  <div>
                    <strong>{dependency.owner}</strong>
                    <p>{dependency.action}</p>
                  </div>

                  <div>
                    <span>{dependency.status}</span>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={dependency.status === "acknowledged" || run.stage !== "partial-recovery"}
                      onClick={() => acknowledge(dependency.id, dependency.owner)}
                    >
                      {dependency.status === "acknowledged" ? "Acknowledged" : `Acknowledge ${dependency.owner}`}
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