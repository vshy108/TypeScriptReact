import { useReleasePostRollbackSegmentation } from "./useReleasePostRollbackSegmentation";

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
    | "scheduling-segments"
    | "fork-review"
    | "ready-to-publish"
    | "published",
) {
  if (stage === "draft") {
    return "Draft";
  }

  if (stage === "scheduling-segments") {
    return "Scheduling segments";
  }

  if (stage === "fork-review") {
    return "Fork review";
  }

  if (stage === "ready-to-publish") {
    return "Ready to publish";
  }

  return "Published";
}

export default function ReleasePostRollbackSegmentationPanel() {
  const {
    activeSegment,
    approveForks,
    auditEvents,
    message,
    messageForks,
    mutationStatus,
    pendingForks,
    publish,
    run,
    scheduleSegment,
    segments,
    start,
    status,
  } = useReleasePostRollbackSegmentation();

  const defaultMessage =
    run?.stage === "published"
      ? "Published the segmented rollback updates after timing and escalation-safe fork review completed."
      : run?.stage === "fork-review"
        ? run.publishBlockedReason ??
          "Segment timing is complete, but the escalation-safe forks still need approval."
        : "Start the segmentation plan, schedule each region-specific customer wave, approve the escalation-safe message forks, and then publish.";

  return (
    <div className="release-post-rollback-segmentation">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release post-rollback customer segmentation</h3>
      </div>

      <p className="section-copy">
        This twenty-third feature slice models customer messaging after a rollback. Each segment has its own region-specific
        timing, and the escalation-safe message forks must be approved before any segmented update can publish.
      </p>

      <div className="release-post-rollback-segmentation__summary">
        <article className="sample-card">
          <p className="eyebrow">Segmentation stage</p>
          <h4>{run ? formatStageLabel(run.stage) : "Loading"}</h4>
          <p>{run ? `${run.updatedBy} at ${run.updatedAt}` : "Waiting for segmentation workspace"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Active segment</p>
          <h4>{activeSegment?.label ?? "Not started"}</h4>
          <p>{activeSegment ? activeSegment.sendWindow : "No segment timing is active yet"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Message forks</p>
          <h4>{pendingForks.length === 0 ? "Approved" : `${pendingForks.length} pending`}</h4>
          <p>{run?.publishBlockedReason ?? "Escalation-safe forks are clear for publish."}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === "loading" ? "Loading post-rollback segmentation workspace..." : message ?? defaultMessage}
      </div>

      {run ? (
        <div className="release-post-rollback-segmentation__grid">
          <section className="sample-card release-post-rollback-segmentation__panel" aria-label="Segment scheduling">
            <div className="section-heading">
              <p className="eyebrow">Segment scheduling</p>
              <h4>Region-specific timing</h4>
            </div>

            <p>{run.summary}</p>

            <div className="release-post-rollback-segmentation__actions">
              <button
                type="button"
                className="primary-button"
                disabled={run.stage !== "draft"}
                onClick={start}
              >
                {run.stage === "draft" ? "Start segmentation plan" : "Segmentation started"}
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "fork-review"}
                onClick={approveForks}
              >
                Approve message forks
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "ready-to-publish"}
                onClick={publish}
              >
                Publish segmented updates
              </button>
            </div>

            <div className="release-post-rollback-segmentation__segment-list">
              {segments.map((segment) => (
                <article key={segment.id} className="release-post-rollback-segmentation__segment-card">
                  <div>
                    <strong>{segment.label}</strong>
                    <p>{segment.note}</p>
                    <p>{`${segment.region} - ${segment.audience}`}</p>
                  </div>

                  <div>
                    <span>{segment.status}</span>
                    <p>{segment.sendWindow}</p>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={segment.status !== "scheduled" && segment.status !== "queued"}
                      onClick={() => scheduleSegment(segment.id, segment.label)}
                    >
                      {segment.status === "ready" || segment.status === "published"
                        ? "Scheduled"
                        : `Schedule ${segment.label}`}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="sample-card release-post-rollback-segmentation__panel" aria-label="Message forks and audit">
            <div className="section-heading">
              <p className="eyebrow">Message forks</p>
              <h4>Escalation-safe wording</h4>
            </div>

            <div className="release-post-rollback-segmentation__fork-list">
              {messageForks.map((fork) => (
                <article key={fork.id} className="release-post-rollback-segmentation__fork-card">
                  <div>
                    <strong>{fork.label}</strong>
                    <p>{`Baseline: ${fork.baseline}`}</p>
                    <p>{`Escalation-safe: ${fork.escalationSafe}`}</p>
                  </div>
                  <span>{fork.status}</span>
                </article>
              ))}
            </div>

            <div className="release-post-rollback-segmentation__audit-list">
              {auditEvents.map((event) => (
                <article key={event.id} className="release-post-rollback-segmentation__audit-card">
                  <div className="release-post-rollback-segmentation__audit-meta">
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