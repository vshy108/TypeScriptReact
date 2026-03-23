import { useReleaseRecoveryCreditLedgers } from "./useReleaseRecoveryCreditLedgers";

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
    | "stale-credit-review"
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

  if (stage === "stale-credit-review") {
    return "Invalidate stale credits";
  }

  if (stage === "approver-signoff") {
    return "Approver sign-off";
  }

  if (stage === "ready-to-publish") {
    return "Ready to publish";
  }

  return "Published";
}

export default function ReleaseRecoveryCreditLedgersPanel() {
  const {
    activeLedger,
    approveLedger,
    auditEvents,
    credits,
    invalidateCredits,
    ledgers,
    message,
    mutationStatus,
    publish,
    run,
    signOff,
    staleCredits,
    start,
    status,
  } = useReleaseRecoveryCreditLedgers();

  const defaultMessage =
    run?.stage === "published"
      ? "Published the recovery credit ledger after stale-credit invalidation and approver sign-off completed."
      : run?.stage === "stale-credit-review"
        ? run.publishBlockedReason ??
          "Stale credits must be invalidated before approver sign-off can begin."
        : "Review each recovery credit ledger, invalidate stale credits, collect approver sign-off on the revised credit policy, and then publish the reconciled credit plan.";

  return (
    <div className="release-recovery-credit-ledgers">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release recovery credit ledgers</h3>
      </div>

      <p className="section-copy">
        This twenty-ninth feature slice models recovery credit ledgers. Owners review each credit lane, stale credits
        must be invalidated, and an approver must sign off on the revised policy before the reconciled credit ledger
        can publish.
      </p>

      <div className="release-recovery-credit-ledgers__summary">
        <article className="sample-card">
          <p className="eyebrow">Credit stage</p>
          <h4>{run ? formatStageLabel(run.stage) : "Loading"}</h4>
          <p>{run ? `${run.updatedBy} at ${run.updatedAt}` : "Waiting for recovery credit workspace"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Active ledger</p>
          <h4>{activeLedger?.label ?? "Not started"}</h4>
          <p>{activeLedger ? activeLedger.audience : "No recovery credit ledger is active yet"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Stale credits</p>
          <h4>{staleCredits.length === 0 ? "Cleared" : `${staleCredits.length} stale`}</h4>
          <p>{run?.publishBlockedReason ?? "The recovery credit ledger is clear to publish."}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === "loading" ? "Loading recovery credit workspace..." : message ?? defaultMessage}
      </div>

      {run ? (
        <div className="release-recovery-credit-ledgers__grid">
          <section className="sample-card release-recovery-credit-ledgers__panel" aria-label="Recovery credit ledgers">
            <div className="section-heading">
              <p className="eyebrow">Credit ledgers</p>
              <h4>Owner review</h4>
            </div>

            <p>{run.summary}</p>

            <div className="release-recovery-credit-ledgers__actions">
              <button
                type="button"
                className="primary-button"
                disabled={run.stage !== "draft"}
                onClick={start}
              >
                {run.stage === "draft" ? "Start credit review" : "Credit review started"}
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "stale-credit-review"}
                onClick={invalidateCredits}
              >
                Invalidate stale credits
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
                Publish credit ledger
              </button>
            </div>

            <div className="release-recovery-credit-ledgers__ledger-list">
              {ledgers.map((ledger) => (
                <article key={ledger.id} className="release-recovery-credit-ledgers__ledger-card">
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
                      {ledger.status === "awaiting-review" ? `Approve ${ledger.label}` : "Approved"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="sample-card release-recovery-credit-ledgers__panel" aria-label="Credits and audit">
            <div className="section-heading">
              <p className="eyebrow">Credit rows</p>
              <h4>Stale vs revised credits</h4>
            </div>

            <div className="release-recovery-credit-ledgers__credit-list">
              {credits.map((credit) => (
                <article key={credit.id} className="release-recovery-credit-ledgers__credit-card">
                  <div>
                    <strong>{credit.ledger}</strong>
                    <p>{`Stale: ${credit.staleCredit}`}</p>
                    <p>{`Revised: ${credit.revisedCredit}`}</p>
                    <p>{credit.reason}</p>
                  </div>
                  <span>{credit.status}</span>
                </article>
              ))}
            </div>

            <div className="release-recovery-credit-ledgers__audit-list">
              {auditEvents.map((event) => (
                <article key={event.id} className="release-recovery-credit-ledgers__audit-card">
                  <div className="release-recovery-credit-ledgers__audit-meta">
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