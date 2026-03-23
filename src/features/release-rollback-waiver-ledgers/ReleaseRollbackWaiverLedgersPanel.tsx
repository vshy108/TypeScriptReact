import { useReleaseRollbackWaiverLedgers } from "./useReleaseRollbackWaiverLedgers";

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
    | "expired-exception-review"
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

  if (stage === "expired-exception-review") {
    return "Invalidate expired exceptions";
  }

  if (stage === "approver-signoff") {
    return "Approver sign-off";
  }

  if (stage === "ready-to-publish") {
    return "Ready to publish";
  }

  return "Published";
}

export default function ReleaseRollbackWaiverLedgersPanel() {
  const {
    activeLedger,
    approveLedger,
    auditEvents,
    exceptions,
    invalidateExceptions,
    ledgers,
    message,
    mutationStatus,
    publish,
    run,
    signOff,
    staleExceptions,
    start,
    status,
  } = useReleaseRollbackWaiverLedgers();

  const defaultMessage =
    run?.stage === "published"
      ? "Published the rollback waiver ledger after expired-exception invalidation and approver sign-off completed."
      : run?.stage === "expired-exception-review"
        ? run.publishBlockedReason ??
          "Expired exceptions must be invalidated before approver sign-off can begin."
        : "Review each rollback waiver ledger, invalidate expired exceptions, collect approver sign-off on the revised waivers, and then publish the reconciled ledger set.";

  return (
    <div className="release-rollback-waiver-ledgers">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release rollback waiver ledgers</h3>
      </div>

      <p className="section-copy">
        This twenty-eighth feature slice models rollback waiver ledgers. Owners review each waiver lane, expired
        exceptions must be invalidated, and an approver must sign off on the revised waivers before the reconciled
        ledger can publish.
      </p>

      <div className="release-rollback-waiver-ledgers__summary">
        <article className="sample-card">
          <p className="eyebrow">Waiver stage</p>
          <h4>{run ? formatStageLabel(run.stage) : "Loading"}</h4>
          <p>{run ? `${run.updatedBy} at ${run.updatedAt}` : "Waiting for rollback waiver workspace"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Active ledger</p>
          <h4>{activeLedger?.label ?? "Not started"}</h4>
          <p>{activeLedger ? activeLedger.scope : "No waiver ledger is active yet"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Expired exceptions</p>
          <h4>{staleExceptions.length === 0 ? "Cleared" : `${staleExceptions.length} stale`}</h4>
          <p>{run?.publishBlockedReason ?? "The rollback waiver ledger is clear to publish."}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === "loading" ? "Loading rollback waiver workspace..." : message ?? defaultMessage}
      </div>

      {run ? (
        <div className="release-rollback-waiver-ledgers__grid">
          <section className="sample-card release-rollback-waiver-ledgers__panel" aria-label="Waiver ledgers">
            <div className="section-heading">
              <p className="eyebrow">Waiver ledgers</p>
              <h4>Owner review</h4>
            </div>

            <p>{run.summary}</p>

            <div className="release-rollback-waiver-ledgers__actions">
              <button
                type="button"
                className="primary-button"
                disabled={run.stage !== "draft"}
                onClick={start}
              >
                {run.stage === "draft" ? "Start waiver review" : "Waiver review started"}
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "expired-exception-review"}
                onClick={invalidateExceptions}
              >
                Invalidate expired exceptions
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
                Publish waiver ledger
              </button>
            </div>

            <div className="release-rollback-waiver-ledgers__ledger-list">
              {ledgers.map((ledger) => (
                <article key={ledger.id} className="release-rollback-waiver-ledgers__ledger-card">
                  <div>
                    <strong>{ledger.label}</strong>
                    <p>{ledger.note}</p>
                    <p>{`${ledger.owner} - ${ledger.scope}`}</p>
                  </div>

                  <div>
                    <span>{ledger.status}</span>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={ledger.status !== "awaiting-review"}
                      onClick={() => approveLedger(ledger.id, ledger.label)}
                    >
                      {ledger.status === "awaiting-review" ? `Approve ${ledger.label}` : "Approved"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="sample-card release-rollback-waiver-ledgers__panel" aria-label="Exceptions and audit">
            <div className="section-heading">
              <p className="eyebrow">Exception rows</p>
              <h4>Expired vs revised waivers</h4>
            </div>

            <div className="release-rollback-waiver-ledgers__exception-list">
              {exceptions.map((exception) => (
                <article key={exception.id} className="release-rollback-waiver-ledgers__exception-card">
                  <div>
                    <strong>{exception.ledger}</strong>
                    <p>{`Expired: ${exception.staleException}`}</p>
                    <p>{`Revised: ${exception.revisedException}`}</p>
                    <p>{exception.reason}</p>
                  </div>
                  <span>{exception.status}</span>
                </article>
              ))}
            </div>

            <div className="release-rollback-waiver-ledgers__audit-list">
              {auditEvents.map((event) => (
                <article key={event.id} className="release-rollback-waiver-ledgers__audit-card">
                  <div className="release-rollback-waiver-ledgers__audit-meta">
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