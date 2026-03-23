import { useReleaseCustomerPromiseReconciliation } from "./useReleaseCustomerPromiseReconciliation";

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
    | "promise-review"
    | "stale-claim-review"
    | "approver-signoff"
    | "ready-to-publish"
    | "published",
) {
  if (stage === "draft") {
    return "Draft";
  }

  if (stage === "promise-review") {
    return "Promise review";
  }

  if (stage === "stale-claim-review") {
    return "Invalidate stale claims";
  }

  if (stage === "approver-signoff") {
    return "Approver sign-off";
  }

  if (stage === "ready-to-publish") {
    return "Ready to publish";
  }

  return "Published";
}

export default function ReleaseCustomerPromiseReconciliationPanel() {
  const {
    activePromise,
    approvePromise,
    auditEvents,
    claims,
    invalidateClaims,
    message,
    mutationStatus,
    promises,
    publish,
    run,
    signOff,
    staleClaims,
    start,
    status,
  } = useReleaseCustomerPromiseReconciliation();

  const defaultMessage =
    run?.stage === "published"
      ? "Published the reconciled customer promises after stale-claim invalidation and approver sign-off completed."
      : run?.stage === "stale-claim-review"
        ? run.publishBlockedReason ??
          "Stale claims must be invalidated before approver sign-off can begin."
        : "Review each customer promise, invalidate stale claims, collect approver sign-off on the revised language, and then publish the reconciled promise set.";

  return (
    <div className="release-customer-promise-reconciliation">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release customer promise reconciliation</h3>
      </div>

      <p className="section-copy">
        This twenty-seventh feature slice models customer promise reconciliation. Owners review each promise lane,
        stale customer claims must be invalidated, and an approver must sign off on the revised wording before the
        reconciled promise set can publish.
      </p>

      <div className="release-customer-promise-reconciliation__summary">
        <article className="sample-card">
          <p className="eyebrow">Promise stage</p>
          <h4>{run ? formatStageLabel(run.stage) : "Loading"}</h4>
          <p>{run ? `${run.updatedBy} at ${run.updatedAt}` : "Waiting for customer promise workspace"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Active promise</p>
          <h4>{activePromise?.label ?? "Not started"}</h4>
          <p>{activePromise ? activePromise.audience : "No customer promise lane is active yet"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Stale claims</p>
          <h4>{staleClaims.length === 0 ? "Cleared" : `${staleClaims.length} stale`}</h4>
          <p>{run?.publishBlockedReason ?? "The reconciled promise set is clear to publish."}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === "loading" ? "Loading customer promise workspace..." : message ?? defaultMessage}
      </div>

      {run ? (
        <div className="release-customer-promise-reconciliation__grid">
          <section className="sample-card release-customer-promise-reconciliation__panel" aria-label="Customer promises">
            <div className="section-heading">
              <p className="eyebrow">Promise lanes</p>
              <h4>Owner review</h4>
            </div>

            <p>{run.summary}</p>

            <div className="release-customer-promise-reconciliation__actions">
              <button
                type="button"
                className="primary-button"
                disabled={run.stage !== "draft"}
                onClick={start}
              >
                {run.stage === "draft" ? "Start promise review" : "Promise review started"}
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "stale-claim-review"}
                onClick={invalidateClaims}
              >
                Invalidate stale claims
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
                Publish reconciled promises
              </button>
            </div>

            <div className="release-customer-promise-reconciliation__promise-list">
              {promises.map((promise) => (
                <article key={promise.id} className="release-customer-promise-reconciliation__promise-card">
                  <div>
                    <strong>{promise.label}</strong>
                    <p>{promise.note}</p>
                    <p>{`${promise.owner} - ${promise.audience}`}</p>
                  </div>

                  <div>
                    <span>{promise.status}</span>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={promise.status !== "awaiting-review"}
                      onClick={() => approvePromise(promise.id, promise.label)}
                    >
                      {promise.status === "awaiting-review" ? `Approve ${promise.label}` : "Approved"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="sample-card release-customer-promise-reconciliation__panel" aria-label="Claims and audit">
            <div className="section-heading">
              <p className="eyebrow">Claim rows</p>
              <h4>Stale vs reconciled promises</h4>
            </div>

            <div className="release-customer-promise-reconciliation__claim-list">
              {claims.map((claim) => (
                <article key={claim.id} className="release-customer-promise-reconciliation__claim-card">
                  <div>
                    <strong>{claim.promise}</strong>
                    <p>{`Stale: ${claim.staleClaim}`}</p>
                    <p>{`Revised: ${claim.revisedClaim}`}</p>
                    <p>{claim.reason}</p>
                  </div>
                  <span>{claim.status}</span>
                </article>
              ))}
            </div>

            <div className="release-customer-promise-reconciliation__audit-list">
              {auditEvents.map((event) => (
                <article key={event.id} className="release-customer-promise-reconciliation__audit-card">
                  <div className="release-customer-promise-reconciliation__audit-meta">
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