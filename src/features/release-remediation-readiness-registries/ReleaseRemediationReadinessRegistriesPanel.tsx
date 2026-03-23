import { useReleaseRemediationReadinessRegistries } from "./useReleaseRemediationReadinessRegistries";

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
    | "registry-review"
    | "stale-evidence-review"
    | "approver-signoff"
    | "ready-to-publish"
    | "published",
) {
  if (stage === "draft") {
    return "Draft";
  }

  if (stage === "registry-review") {
    return "Registry review";
  }

  if (stage === "stale-evidence-review") {
    return "Invalidate stale evidence";
  }

  if (stage === "approver-signoff") {
    return "Approver sign-off";
  }

  if (stage === "ready-to-publish") {
    return "Ready to publish";
  }

  return "Published";
}

export default function ReleaseRemediationReadinessRegistriesPanel() {
  const {
    activeRegistry,
    approveRegistry,
    auditEvents,
    evidenceRows,
    invalidateEvidence,
    message,
    mutationStatus,
    publish,
    registries,
    run,
    signOff,
    staleEvidenceRows,
    start,
    status,
  } = useReleaseRemediationReadinessRegistries();

  const defaultMessage =
    run?.stage === "published"
      ? "Published the remediation readiness packet after stale-evidence invalidation and approver sign-off completed."
      : run?.stage === "stale-evidence-review"
        ? run.publishBlockedReason ??
          "Stale evidence must be invalidated before approver sign-off can begin."
        : "Review each remediation readiness registry, invalidate stale evidence, collect approver sign-off on the revised packet, and then publish the reconciled readiness packet.";

  return (
    <div className="release-remediation-readiness-registries">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release remediation readiness registries</h3>
      </div>

      <p className="section-copy">
        This thirty-first feature slice models remediation readiness registries. Owners review each registry, stale
        evidence must be invalidated, and an approver must sign off on the revised packet before the readiness update
        can publish.
      </p>

      <div className="release-remediation-readiness-registries__summary">
        <article className="sample-card">
          <p className="eyebrow">Readiness stage</p>
          <h4>{run ? formatStageLabel(run.stage) : "Loading"}</h4>
          <p>{run ? `${run.updatedBy} at ${run.updatedAt}` : "Waiting for remediation readiness workspace"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Active registry</p>
          <h4>{activeRegistry?.label ?? "Not started"}</h4>
          <p>{activeRegistry ? activeRegistry.lane : "No remediation readiness registry is active yet"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Stale evidence</p>
          <h4>{staleEvidenceRows.length === 0 ? "Cleared" : `${staleEvidenceRows.length} stale`}</h4>
          <p>{run?.publishBlockedReason ?? "The remediation readiness packet is clear to publish."}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === "loading" ? "Loading remediation readiness workspace..." : message ?? defaultMessage}
      </div>

      {run ? (
        <div className="release-remediation-readiness-registries__grid">
          <section
            className="sample-card release-remediation-readiness-registries__panel"
            aria-label="Remediation readiness registries"
          >
            <div className="section-heading">
              <p className="eyebrow">Readiness registries</p>
              <h4>Owner review</h4>
            </div>

            <p>{run.summary}</p>

            <div className="release-remediation-readiness-registries__actions">
              <button
                type="button"
                className="primary-button"
                disabled={run.stage !== "draft"}
                onClick={start}
              >
                {run.stage === "draft" ? "Start readiness review" : "Readiness review started"}
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "stale-evidence-review"}
                onClick={invalidateEvidence}
              >
                Invalidate stale evidence
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
                Publish readiness packet
              </button>
            </div>

            <div className="release-remediation-readiness-registries__registry-list">
              {registries.map((registry) => (
                <article
                  key={registry.id}
                  className="release-remediation-readiness-registries__registry-card"
                >
                  <div>
                    <strong>{registry.label}</strong>
                    <p>{registry.note}</p>
                    <p>{`${registry.owner} - ${registry.lane}`}</p>
                  </div>

                  <div>
                    <span>{registry.status}</span>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={registry.status !== "awaiting-review"}
                      onClick={() => approveRegistry(registry.id, registry.label)}
                    >
                      {registry.status === "awaiting-review"
                        ? `Approve ${registry.label}`
                        : "Approved"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section
            className="sample-card release-remediation-readiness-registries__panel"
            aria-label="Readiness evidence and audit"
          >
            <div className="section-heading">
              <p className="eyebrow">Evidence rows</p>
              <h4>Stale vs revised evidence</h4>
            </div>

            <div className="release-remediation-readiness-registries__evidence-list">
              {evidenceRows.map((item) => (
                <article
                  key={item.id}
                  className="release-remediation-readiness-registries__evidence-card"
                >
                  <div>
                    <strong>{item.registry}</strong>
                    <p>{`Stale: ${item.staleEvidence}`}</p>
                    <p>{`Revised: ${item.revisedEvidence}`}</p>
                    <p>{item.reason}</p>
                  </div>
                  <span>{item.status}</span>
                </article>
              ))}
            </div>

            <div className="release-remediation-readiness-registries__audit-list">
              {auditEvents.map((event) => (
                <article
                  key={event.id}
                  className="release-remediation-readiness-registries__audit-card"
                >
                  <div className="release-remediation-readiness-registries__audit-meta">
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