import { useReleaseFollowUpCommitments } from "./useReleaseFollowUpCommitments";

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
    | "owner-review"
    | "eta-drift-review"
    | "approver-signoff"
    | "ready-to-publish"
    | "published",
) {
  if (stage === "draft") {
    return "Draft";
  }

  if (stage === "owner-review") {
    return "Owner review";
  }

  if (stage === "eta-drift-review") {
    return "Invalidate ETA drift";
  }

  if (stage === "approver-signoff") {
    return "Approver sign-off";
  }

  if (stage === "ready-to-publish") {
    return "Ready to publish";
  }

  return "Published";
}

export default function ReleaseFollowUpCommitmentsPanel() {
  const {
    activeCommitment,
    approveCommitment,
    auditEvents,
    commitments,
    driftedEtas,
    etaDrifts,
    invalidateEtaDrifts,
    message,
    mutationStatus,
    publish,
    run,
    signOff,
    start,
    status,
  } = useReleaseFollowUpCommitments();

  const defaultMessage =
    run?.stage === "published"
      ? "Published the follow-up commitments after ETA drift invalidation and approver sign-off completed."
      : run?.stage === "eta-drift-review"
        ? run.publishBlockedReason ??
          "Drifted ETAs must be invalidated before approver sign-off can begin."
        : "Review each follow-up commitment, invalidate ETA drift, collect approver sign-off on the revised commitments, and then publish the final bundle.";

  return (
    <div className="release-follow-up-commitments">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release follow-up commitments</h3>
      </div>

      <p className="section-copy">
        This twenty-fifth feature slice models post-incident follow-up commitments. Owners review each follow-up lane,
        any ETA drift must be invalidated, and an approver must sign off on the revised commitments before the bundle
        can publish.
      </p>

      <div className="release-follow-up-commitments__summary">
        <article className="sample-card">
          <p className="eyebrow">Commitment stage</p>
          <h4>{run ? formatStageLabel(run.stage) : "Loading"}</h4>
          <p>{run ? `${run.updatedBy} at ${run.updatedAt}` : "Waiting for follow-up workspace"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Active commitment</p>
          <h4>{activeCommitment?.label ?? "Not started"}</h4>
          <p>{activeCommitment ? activeCommitment.audience : "No follow-up lane is active yet"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">ETA drift</p>
          <h4>{driftedEtas.length === 0 ? "Cleared" : `${driftedEtas.length} drifted`}</h4>
          <p>{run?.publishBlockedReason ?? "The follow-up bundle is clear to publish."}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === "loading" ? "Loading follow-up commitments workspace..." : message ?? defaultMessage}
      </div>

      {run ? (
        <div className="release-follow-up-commitments__grid">
          <section className="sample-card release-follow-up-commitments__panel" aria-label="Follow-up commitments">
            <div className="section-heading">
              <p className="eyebrow">Commitments</p>
              <h4>Owner review</h4>
            </div>

            <p>{run.summary}</p>

            <div className="release-follow-up-commitments__actions">
              <button
                type="button"
                className="primary-button"
                disabled={run.stage !== "draft"}
                onClick={start}
              >
                {run.stage === "draft" ? "Start follow-up review" : "Follow-up review started"}
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "eta-drift-review"}
                onClick={invalidateEtaDrifts}
              >
                Invalidate ETA drift
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "approver-signoff"}
                onClick={signOff}
              >
                Record approver sign-off
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "ready-to-publish"}
                onClick={publish}
              >
                Publish follow-up bundle
              </button>
            </div>

            <div className="release-follow-up-commitments__commitment-list">
              {commitments.map((commitment) => (
                <article key={commitment.id} className="release-follow-up-commitments__commitment-card">
                  <div>
                    <strong>{commitment.label}</strong>
                    <p>{commitment.note}</p>
                    <p>{`${commitment.owner} - ${commitment.audience}`}</p>
                  </div>

                  <div>
                    <span>{commitment.status}</span>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={commitment.status !== "awaiting-review"}
                      onClick={() => approveCommitment(commitment.id, commitment.label)}
                    >
                      {commitment.status === "awaiting-review" ? `Approve ${commitment.label}` : "Approved"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="sample-card release-follow-up-commitments__panel" aria-label="ETA drift and audit">
            <div className="section-heading">
              <p className="eyebrow">ETA drift</p>
              <h4>Baseline vs revised commitments</h4>
            </div>

            <div className="release-follow-up-commitments__eta-list">
              {etaDrifts.map((item) => (
                <article key={item.id} className="release-follow-up-commitments__eta-card">
                  <div>
                    <strong>{item.commitment}</strong>
                    <p>{`Baseline ETA: ${item.baselineEta}`}</p>
                    <p>{`Revised ETA: ${item.revisedEta}`}</p>
                    <p>{item.reason}</p>
                  </div>
                  <span>{item.status}</span>
                </article>
              ))}
            </div>

            <div className="release-follow-up-commitments__audit-list">
              {auditEvents.map((event) => (
                <article key={event.id} className="release-follow-up-commitments__audit-card">
                  <div className="release-follow-up-commitments__audit-meta">
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