import { useReleaseRemediationEvidenceBundles } from "./useReleaseRemediationEvidenceBundles";

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
    | "bundle-review"
    | "stale-proof-review"
    | "approver-signoff"
    | "ready-to-publish"
    | "published",
) {
  if (stage === "draft") {
    return "Draft";
  }

  if (stage === "bundle-review") {
    return "Bundle review";
  }

  if (stage === "stale-proof-review") {
    return "Invalidate stale proof";
  }

  if (stage === "approver-signoff") {
    return "Approver sign-off";
  }

  if (stage === "ready-to-publish") {
    return "Ready to publish";
  }

  return "Published";
}

export default function ReleaseRemediationEvidenceBundlesPanel() {
  const {
    activeBundle,
    approveBundle,
    auditEvents,
    bundles,
    invalidateProofs,
    message,
    mutationStatus,
    proofs,
    publish,
    run,
    signOff,
    staleProofs,
    start,
    status,
  } = useReleaseRemediationEvidenceBundles();

  const defaultMessage =
    run?.stage === "published"
      ? "Published the remediation evidence packet after stale-proof invalidation and approver sign-off completed."
      : run?.stage === "stale-proof-review"
        ? run.publishBlockedReason ??
          "Stale proof must be invalidated before approver sign-off can begin."
        : "Review each remediation evidence bundle, invalidate stale proof, collect approver sign-off on the revised evidence, and then publish the final packet.";

  return (
    <div className="release-remediation-evidence-bundles">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release remediation evidence bundles</h3>
      </div>

      <p className="section-copy">
        This twenty-sixth feature slice models remediation evidence bundles. Owners review each evidence bundle, stale
        proof must be invalidated, and an approver must sign off on the revised evidence before the packet can publish.
      </p>

      <div className="release-remediation-evidence-bundles__summary">
        <article className="sample-card">
          <p className="eyebrow">Evidence stage</p>
          <h4>{run ? formatStageLabel(run.stage) : "Loading"}</h4>
          <p>{run ? `${run.updatedBy} at ${run.updatedAt}` : "Waiting for remediation evidence workspace"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Active bundle</p>
          <h4>{activeBundle?.label ?? "Not started"}</h4>
          <p>{activeBundle ? activeBundle.area : "No remediation bundle is active yet"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Stale proof</p>
          <h4>{staleProofs.length === 0 ? "Cleared" : `${staleProofs.length} stale`}</h4>
          <p>{run?.publishBlockedReason ?? "The remediation evidence packet is clear to publish."}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === "loading" ? "Loading remediation evidence workspace..." : message ?? defaultMessage}
      </div>

      {run ? (
        <div className="release-remediation-evidence-bundles__grid">
          <section className="sample-card release-remediation-evidence-bundles__panel" aria-label="Evidence bundles">
            <div className="section-heading">
              <p className="eyebrow">Evidence bundles</p>
              <h4>Owner review</h4>
            </div>

            <p>{run.summary}</p>

            <div className="release-remediation-evidence-bundles__actions">
              <button
                type="button"
                className="primary-button"
                disabled={run.stage !== "draft"}
                onClick={start}
              >
                {run.stage === "draft" ? "Start evidence review" : "Evidence review started"}
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "stale-proof-review"}
                onClick={invalidateProofs}
              >
                Invalidate stale proof
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
                Publish evidence packet
              </button>
            </div>

            <div className="release-remediation-evidence-bundles__bundle-list">
              {bundles.map((bundle) => (
                <article key={bundle.id} className="release-remediation-evidence-bundles__bundle-card">
                  <div>
                    <strong>{bundle.label}</strong>
                    <p>{bundle.note}</p>
                    <p>{`${bundle.owner} - ${bundle.area}`}</p>
                  </div>

                  <div>
                    <span>{bundle.status}</span>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={bundle.status !== "awaiting-review"}
                      onClick={() => approveBundle(bundle.id, bundle.label)}
                    >
                      {bundle.status === "awaiting-review" ? `Approve ${bundle.label}` : "Approved"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="sample-card release-remediation-evidence-bundles__panel" aria-label="Proofs and audit">
            <div className="section-heading">
              <p className="eyebrow">Proof rows</p>
              <h4>Baseline vs revised proof</h4>
            </div>

            <div className="release-remediation-evidence-bundles__proof-list">
              {proofs.map((proof) => (
                <article key={proof.id} className="release-remediation-evidence-bundles__proof-card">
                  <div>
                    <strong>{proof.bundle}</strong>
                    <p>{`Baseline: ${proof.baselineProof}`}</p>
                    <p>{`Revised: ${proof.revisedProof}`}</p>
                    <p>{proof.reason}</p>
                  </div>
                  <span>{proof.status}</span>
                </article>
              ))}
            </div>

            <div className="release-remediation-evidence-bundles__audit-list">
              {auditEvents.map((event) => (
                <article key={event.id} className="release-remediation-evidence-bundles__audit-card">
                  <div className="release-remediation-evidence-bundles__audit-meta">
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