import { useReleaseIncidentTimelineReconstruction } from "./useReleaseIncidentTimelineReconstruction";

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
    | "resolving-conflicts"
    | "summary-blocked"
    | "ready-to-publish"
    | "published",
) {
  if (stage === "draft") {
    return "Draft";
  }

  if (stage === "resolving-conflicts") {
    return "Resolving conflicts";
  }

  if (stage === "summary-blocked") {
    return "Summary blocked";
  }

  if (stage === "ready-to-publish") {
    return "Ready to publish";
  }

  return "Published";
}

export default function ReleaseIncidentTimelineReconstructionPanel() {
  const {
    activeConflict,
    auditEvents,
    conflicts,
    entries,
    executiveSummary,
    generateSummary,
    message,
    mutationStatus,
    publishSummary,
    resolveConflict,
    run,
    start,
    status,
  } = useReleaseIncidentTimelineReconstruction();

  const defaultMessage =
    run?.stage === "published"
      ? "Published the executive summary after the timeline conflicts were reconciled and the summary gate was cleared."
      : run?.stage === "summary-blocked"
        ? run.publishBlockedReason ??
          "The timeline is reconciled, but the executive summary still needs a fresh publish-safe draft."
        : "Start timeline reconstruction, resolve the conflicting witness notes, regenerate the executive summary, and then clear the final publish gate.";

  return (
    <div className="release-incident-timeline-reconstruction">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release incident timeline reconstruction</h3>
      </div>

      <p className="section-copy">
        This twentieth feature slice models timeline reconstruction under pressure. Conflicting witness notes block the
        executive summary until the team chooses a canonical event ordering and regenerates a publish-safe summary.
      </p>

      <div className="release-incident-timeline-reconstruction__summary">
        <article className="sample-card">
          <p className="eyebrow">Timeline stage</p>
          <h4>{run ? formatStageLabel(run.stage) : "Loading"}</h4>
          <p>{run ? `${run.updatedBy} at ${run.updatedAt}` : "Waiting for timeline reconstruction workspace"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Active conflict</p>
          <h4>{activeConflict?.label ?? "None active"}</h4>
          <p>{activeConflict ? activeConflict.note : "No witness conflict is active right now"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Summary gate</p>
          <h4>{run?.publishBlockedReason ? "Blocked" : run ? "Cleared" : "Loading"}</h4>
          <p>{run?.publishBlockedReason ?? executiveSummary?.safetyNote ?? "Summary safety state unavailable."}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === "loading" ? "Loading timeline reconstruction workspace..." : message ?? defaultMessage}
      </div>

      {run && executiveSummary ? (
        <div className="release-incident-timeline-reconstruction__grid">
          <section className="sample-card release-incident-timeline-reconstruction__panel" aria-label="Timeline reconstruction">
            <div className="section-heading">
              <p className="eyebrow">Reconstruction controls</p>
              <h4>Witness timeline</h4>
            </div>

            <p>{run.summary}</p>

            <div className="release-incident-timeline-reconstruction__actions">
              <button
                type="button"
                className="primary-button"
                disabled={run.stage !== "draft"}
                onClick={start}
              >
                {run.stage === "draft" ? "Start timeline reconstruction" : "Reconstruction started"}
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "summary-blocked"}
                onClick={generateSummary}
              >
                Generate executive summary
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "ready-to-publish"}
                onClick={publishSummary}
              >
                Publish executive summary
              </button>
            </div>

            <div className="release-incident-timeline-reconstruction__entry-list">
              {entries.map((entry) => (
                <article key={entry.id} className="release-incident-timeline-reconstruction__entry-card">
                  <div>
                    <strong>{entry.timestampLabel}</strong>
                    <p>{entry.note}</p>
                  </div>
                  <div>
                    <span>{entry.status}</span>
                    <p>{entry.actor}</p>
                    <p>{entry.source}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="sample-card release-incident-timeline-reconstruction__panel" aria-label="Conflict resolution and executive summary">
            <div className="section-heading">
              <p className="eyebrow">Conflict resolution</p>
              <h4>Canonical timeline and summary</h4>
            </div>

            <div className="release-incident-timeline-reconstruction__conflict-list">
              {conflicts.map((conflict) => (
                <article key={conflict.id} className="release-incident-timeline-reconstruction__conflict-card">
                  <div>
                    <strong>{conflict.label}</strong>
                    <p>{conflict.note}</p>
                    <p>{`${conflict.leftEntry.actor}: ${conflict.leftEntry.note}`}</p>
                    <p>{`${conflict.rightEntry.actor}: ${conflict.rightEntry.note}`}</p>
                  </div>
                  <div>
                    <span>{conflict.status}</span>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={conflict.status !== "open"}
                      onClick={() => resolveConflict(conflict.id, "support")}
                    >
                      Choose support note
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={conflict.status !== "open"}
                      onClick={() => resolveConflict(conflict.id, "ops")}
                    >
                      Choose ops note
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <article className="release-incident-timeline-reconstruction__summary-card">
              <strong>{executiveSummary.headline}</strong>
              <p>{executiveSummary.body}</p>
              <p>{executiveSummary.safetyNote}</p>
              <span>{executiveSummary.status}</span>
            </article>

            <div className="release-incident-timeline-reconstruction__audit-list">
              {auditEvents.map((event) => (
                <article key={event.id} className="release-incident-timeline-reconstruction__audit-card">
                  <div className="release-incident-timeline-reconstruction__audit-meta">
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