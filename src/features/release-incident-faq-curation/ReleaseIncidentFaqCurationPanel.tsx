import { useReleaseIncidentFaqCuration } from "./useReleaseIncidentFaqCuration";

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
    | "channel-review"
    | "stale-answer-review"
    | "reviewer-signoff"
    | "ready-to-publish"
    | "published",
) {
  if (stage === "draft") {
    return "Draft";
  }

  if (stage === "channel-review") {
    return "Channel review";
  }

  if (stage === "stale-answer-review") {
    return "Invalidate stale answers";
  }

  if (stage === "reviewer-signoff") {
    return "Reviewer sign-off";
  }

  if (stage === "ready-to-publish") {
    return "Ready to publish";
  }

  return "Published";
}

export default function ReleaseIncidentFaqCurationPanel() {
  const {
    activeChannel,
    approveChannel,
    auditEvents,
    channels,
    faqEntries,
    invalidateAnswers,
    message,
    mutationStatus,
    publish,
    run,
    signOff,
    staleEntries,
    start,
    status,
  } = useReleaseIncidentFaqCuration();

  const defaultMessage =
    run?.stage === "published"
      ? "Published the synchronized FAQ bundle after stale-answer invalidation and reviewer sign-off completed."
      : run?.stage === "stale-answer-review"
        ? run.publishBlockedReason ??
          "Stale answers must be invalidated before reviewer sign-off can begin."
        : "Review each FAQ channel, invalidate stale answers, collect reviewer sign-off on the refreshed guidance, and then publish the synchronized bundle.";

  return (
    <div className="release-incident-faq-curation">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release incident FAQ curation</h3>
      </div>

      <p className="section-copy">
        This twenty-fourth feature slice models cross-channel incident FAQ curation. The status page, support macros,
        and social reply guide are reviewed in sequence, stale answers are invalidated, and a reviewer must sign off on
        the refreshed answers before the synchronized FAQ bundle can publish.
      </p>

      <div className="release-incident-faq-curation__summary">
        <article className="sample-card">
          <p className="eyebrow">Curation stage</p>
          <h4>{run ? formatStageLabel(run.stage) : "Loading"}</h4>
          <p>{run ? `${run.updatedBy} at ${run.updatedAt}` : "Waiting for FAQ curation workspace"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Active channel</p>
          <h4>{activeChannel?.label ?? "Not started"}</h4>
          <p>{activeChannel ? activeChannel.audience : "No channel is active yet"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">FAQ drift</p>
          <h4>{staleEntries.length === 0 ? "Cleared" : `${staleEntries.length} stale`}</h4>
          <p>{run?.publishBlockedReason ?? "The FAQ bundle is clear to publish."}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === "loading" ? "Loading incident FAQ curation workspace..." : message ?? defaultMessage}
      </div>

      {run ? (
        <div className="release-incident-faq-curation__grid">
          <section className="sample-card release-incident-faq-curation__panel" aria-label="FAQ channels">
            <div className="section-heading">
              <p className="eyebrow">Channels</p>
              <h4>Cross-channel review</h4>
            </div>

            <p>{run.summary}</p>

            <div className="release-incident-faq-curation__actions">
              <button
                type="button"
                className="primary-button"
                disabled={run.stage !== "draft"}
                onClick={start}
              >
                {run.stage === "draft" ? "Start FAQ review" : "FAQ review started"}
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "stale-answer-review"}
                onClick={invalidateAnswers}
              >
                Invalidate stale answers
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "reviewer-signoff"}
                onClick={signOff}
              >
                Record reviewer sign-off
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "ready-to-publish"}
                onClick={publish}
              >
                Publish FAQ bundle
              </button>
            </div>

            <div className="release-incident-faq-curation__channel-list">
              {channels.map((channel) => (
                <article key={channel.id} className="release-incident-faq-curation__channel-card">
                  <div>
                    <strong>{channel.label}</strong>
                    <p>{channel.note}</p>
                    <p>{`${channel.owner} - ${channel.audience}`}</p>
                  </div>

                  <div>
                    <span>{channel.status}</span>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={channel.status !== "awaiting-review"}
                      onClick={() => approveChannel(channel.id, channel.label)}
                    >
                      {channel.status === "awaiting-review" ? `Approve ${channel.label}` : "Approved"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="sample-card release-incident-faq-curation__panel" aria-label="FAQ answers and audit">
            <div className="section-heading">
              <p className="eyebrow">FAQ answers</p>
              <h4>Stale vs refreshed guidance</h4>
            </div>

            <div className="release-incident-faq-curation__faq-list">
              {faqEntries.map((entry) => (
                <article key={entry.id} className="release-incident-faq-curation__faq-card">
                  <div>
                    <strong>{entry.question}</strong>
                    <p>{`Stale: ${entry.staleAnswer}`}</p>
                    <p>{`Refreshed: ${entry.refreshedAnswer}`}</p>
                    <p>{entry.owner}</p>
                  </div>
                  <span>{entry.status}</span>
                </article>
              ))}
            </div>

            <div className="release-incident-faq-curation__audit-list">
              {auditEvents.map((event) => (
                <article key={event.id} className="release-incident-faq-curation__audit-card">
                  <div className="release-incident-faq-curation__audit-meta">
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