import { useReleaseStabilityAttestationLedgers } from "./useReleaseStabilityAttestationLedgers";

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
    | "stale-signal-review"
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

  if (stage === "stale-signal-review") {
    return "Invalidate stale signals";
  }

  if (stage === "approver-signoff") {
    return "Approver sign-off";
  }

  if (stage === "ready-to-publish") {
    return "Ready to publish";
  }

  return "Published";
}

export default function ReleaseStabilityAttestationLedgersPanel() {
  const {
    activeLedger,
    approveLedger,
    auditEvents,
    invalidateSignals,
    ledgers,
    message,
    mutationStatus,
    publish,
    run,
    signOff,
    signals,
    staleSignals,
    start,
    status,
  } = useReleaseStabilityAttestationLedgers();

  const defaultMessage =
    run?.stage === "published"
      ? "Published the stability attestation packet after stale-signal invalidation and approver sign-off completed."
      : run?.stage === "stale-signal-review"
        ? run.publishBlockedReason ??
          "Stale signals must be invalidated before approver sign-off can begin."
        : "Review each stability attestation ledger, invalidate stale signals, collect approver sign-off on the revised packet, and then publish the final stability attestation packet.";

  return (
    <div className="release-stability-attestation-ledgers">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release stability attestation ledgers</h3>
      </div>

      <p className="section-copy">
        This thirty-third feature slice models stability attestation ledgers. Owners review each ledger, stale signals
        must be invalidated, and an approver must sign off on the revised packet before the attestation can publish.
      </p>

      <div className="release-stability-attestation-ledgers__summary">
        <article className="sample-card">
          <p className="eyebrow">Attestation stage</p>
          <h4>{run ? formatStageLabel(run.stage) : "Loading"}</h4>
          <p>{run ? `${run.updatedBy} at ${run.updatedAt}` : "Waiting for stability attestation workspace"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Active ledger</p>
          <h4>{activeLedger?.label ?? "Not started"}</h4>
          <p>{activeLedger ? activeLedger.audience : "No stability attestation ledger is active yet"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Stale signals</p>
          <h4>{staleSignals.length === 0 ? "Cleared" : `${staleSignals.length} stale`}</h4>
          <p>{run?.publishBlockedReason ?? "The stability attestation packet is clear to publish."}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === "loading" ? "Loading stability attestation workspace..." : message ?? defaultMessage}
      </div>

      {run ? (
        <div className="release-stability-attestation-ledgers__grid">
          <section className="sample-card release-stability-attestation-ledgers__panel" aria-label="Stability attestation ledgers">
            <div className="section-heading">
              <p className="eyebrow">Attestation ledgers</p>
              <h4>Owner review</h4>
            </div>

            <p>{run.summary}</p>

            <div className="release-stability-attestation-ledgers__actions">
              <button
                type="button"
                className="primary-button"
                disabled={run.stage !== "draft"}
                onClick={start}
              >
                {run.stage === "draft"
                  ? "Start attestation review"
                  : "Attestation review started"}
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "stale-signal-review"}
                onClick={invalidateSignals}
              >
                Invalidate stale signals
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
                Publish attestation packet
              </button>
            </div>

            <div className="release-stability-attestation-ledgers__ledger-list">
              {ledgers.map((ledger) => (
                <article key={ledger.id} className="release-stability-attestation-ledgers__ledger-card">
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

          <section className="sample-card release-stability-attestation-ledgers__panel" aria-label="Stability signals and audit">
            <div className="section-heading">
              <p className="eyebrow">Signal rows</p>
              <h4>Stale vs revised signals</h4>
            </div>

            <div className="release-stability-attestation-ledgers__signal-list">
              {signals.map((signal) => (
                <article key={signal.id} className="release-stability-attestation-ledgers__signal-card">
                  <div>
                    <strong>{signal.ledger}</strong>
                    <p>{`Stale: ${signal.staleSignal}`}</p>
                    <p>{`Revised: ${signal.revisedSignal}`}</p>
                    <p>{signal.reason}</p>
                  </div>
                  <span>{signal.status}</span>
                </article>
              ))}
            </div>

            <div className="release-stability-attestation-ledgers__audit-list">
              {auditEvents.map((event) => (
                <article key={event.id} className="release-stability-attestation-ledgers__audit-card">
                  <div className="release-stability-attestation-ledgers__audit-meta">
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