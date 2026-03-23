import { useReleaseExitReadinessLedgers } from "./useReleaseExitReadinessLedgers";

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
    | "ledger-review"
    | "stale-criterion-review"
    | "approver-signoff"
    | "ready-to-publish"
    | "published",
) {
  if (stage === "draft") {
    return "Draft";
  }

  if (stage === "ledger-review") {
    return "Ledger review";
  }

  if (stage === "stale-criterion-review") {
    return "Invalidate stale criteria";
  }

  if (stage === "approver-signoff") {
    return "Approver sign-off";
  }

  if (stage === "ready-to-publish") {
    return "Ready to publish";
  }

  return "Published";
}

export default function ReleaseExitReadinessLedgersPanel() {
  const {
    activeLedger,
    approveLedger,
    auditEvents,
    criteria,
    invalidateCriteria,
    ledgers,
    message,
    mutationStatus,
    publish,
    run,
    signOff,
    staleCriteria,
    start,
    status,
  } = useReleaseExitReadinessLedgers();

  const defaultMessage =
    run?.stage === "published"
      ? "Published the exit readiness packet after stale-criterion invalidation and approver sign-off completed."
      : run?.stage === "stale-criterion-review"
        ? run.publishBlockedReason ??
          "Stale criteria must be invalidated before approver sign-off can begin."
        : "Review each exit readiness ledger, invalidate stale criteria, collect approver sign-off on the revised packet, and then publish the final exit readiness packet.";

  return (
    <div className="release-exit-readiness-ledgers">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release exit readiness ledgers</h3>
      </div>

      <p className="section-copy">
        This thirty-second feature slice models exit readiness ledgers. Owners review each ledger, stale criteria must
        be invalidated, and an approver must sign off on the revised packet before exit readiness can publish.
      </p>

      <div className="release-exit-readiness-ledgers__summary">
        <article className="sample-card">
          <p className="eyebrow">Exit stage</p>
          <h4>{run ? formatStageLabel(run.stage) : "Loading"}</h4>
          <p>{run ? `${run.updatedBy} at ${run.updatedAt}` : "Waiting for exit readiness workspace"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Active ledger</p>
          <h4>{activeLedger?.label ?? "Not started"}</h4>
          <p>{activeLedger ? activeLedger.audience : "No exit readiness ledger is active yet"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Stale criteria</p>
          <h4>{staleCriteria.length === 0 ? "Cleared" : `${staleCriteria.length} stale`}</h4>
          <p>{run?.publishBlockedReason ?? "The exit readiness packet is clear to publish."}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === "loading" ? "Loading exit readiness workspace..." : message ?? defaultMessage}
      </div>

      {run ? (
        <div className="release-exit-readiness-ledgers__grid">
          <section className="sample-card release-exit-readiness-ledgers__panel" aria-label="Exit readiness ledgers">
            <div className="section-heading">
              <p className="eyebrow">Exit ledgers</p>
              <h4>Owner review</h4>
            </div>

            <p>{run.summary}</p>

            <div className="release-exit-readiness-ledgers__actions">
              <button
                type="button"
                className="primary-button"
                disabled={run.stage !== "draft"}
                onClick={start}
              >
                {run.stage === "draft" ? "Start exit review" : "Exit review started"}
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "stale-criterion-review"}
                onClick={invalidateCriteria}
              >
                Invalidate stale criteria
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
                Publish exit packet
              </button>
            </div>

            <div className="release-exit-readiness-ledgers__ledger-list">
              {ledgers.map((ledger) => (
                <article key={ledger.id} className="release-exit-readiness-ledgers__ledger-card">
                  <div>
                    <strong>{ledger.label}</strong>
                    <p>{ledger.note}</p>
                    <p>{`${ledger.owner} - ${ledger.audience}`}</p>
                  </div>

                  <div>
                    <span>{ledger.status}</span>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={ledger.status !== "awaiting-review"}
                      onClick={() => approveLedger(ledger.id, ledger.label)}
                    >
                      {ledger.status === "awaiting-review"
                        ? `Approve ${ledger.label}`
                        : "Approved"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="sample-card release-exit-readiness-ledgers__panel" aria-label="Exit criteria and audit">
            <div className="section-heading">
              <p className="eyebrow">Criterion rows</p>
              <h4>Stale vs revised criteria</h4>
            </div>

            <div className="release-exit-readiness-ledgers__criterion-list">
              {criteria.map((criterion) => (
                <article key={criterion.id} className="release-exit-readiness-ledgers__criterion-card">
                  <div>
                    <strong>{criterion.ledger}</strong>
                    <p>{`Stale: ${criterion.staleCriterion}`}</p>
                    <p>{`Revised: ${criterion.revisedCriterion}`}</p>
                    <p>{criterion.reason}</p>
                  </div>
                  <span>{criterion.status}</span>
                </article>
              ))}
            </div>

            <div className="release-exit-readiness-ledgers__audit-list">
              {auditEvents.map((event) => (
                <article key={event.id} className="release-exit-readiness-ledgers__audit-card">
                  <div className="release-exit-readiness-ledgers__audit-meta">
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