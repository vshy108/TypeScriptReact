import { useReleaseIncidentCommsApprovalPacks } from "./useReleaseIncidentCommsApprovalPacks";

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
    | "ops-review"
    | "legal-review"
    | "override-required"
    | "ready-to-publish"
    | "published",
) {
  if (stage === "draft") {
    return "Draft";
  }

  if (stage === "ops-review") {
    return "Ops review";
  }

  if (stage === "legal-review") {
    return "Legal review";
  }

  if (stage === "override-required") {
    return "Override required";
  }

  if (stage === "ready-to-publish") {
    return "Ready to publish";
  }

  return "Published";
}

export default function ReleaseIncidentCommsApprovalPacksPanel() {
  const {
    activePack,
    applyOverride,
    approvePack,
    auditEvents,
    diffRows,
    hasPendingDiffs,
    message,
    mutationStatus,
    packs,
    publish,
    run,
    start,
    status,
  } = useReleaseIncidentCommsApprovalPacks();

  const defaultMessage =
    run?.stage === "published"
      ? "Published the incident communications pack after staged approvals and the legal wording override completed."
      : run?.stage === "override-required"
        ? run.publishBlockedReason ??
          "Legal approved the pack, but the customer-visible rollback wording still needs the override applied."
        : "Start staged comms approval, move from ops to legal review, apply the legal override to the rollback wording diff, and then publish.";

  return (
    <div className="release-incident-comms-approval-packs">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release incident comms approval packs</h3>
      </div>

      <p className="section-copy">
        This twenty-second feature slice models staged incident communications approvals. Operations clears the factual
        pack first, legal then reviews the customer-visible rollback wording, and publish stays blocked until the legal
        override diff is explicitly applied.
      </p>

      <div className="release-incident-comms-approval-packs__summary">
        <article className="sample-card">
          <p className="eyebrow">Approval stage</p>
          <h4>{run ? formatStageLabel(run.stage) : "Loading"}</h4>
          <p>{run ? `${run.updatedBy} at ${run.updatedAt}` : "Waiting for incident comms workspace"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Active pack</p>
          <h4>{activePack?.label ?? "Not started"}</h4>
          <p>{activePack ? `${activePack.owner} owns the current review pack` : "No approval pack is active yet"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Wording diff</p>
          <h4>{hasPendingDiffs ? "Pending override" : "Approved"}</h4>
          <p>{run?.publishBlockedReason ?? "Customer-visible rollback wording is ready to publish."}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === "loading" ? "Loading incident communications workspace..." : message ?? defaultMessage}
      </div>

      {run ? (
        <div className="release-incident-comms-approval-packs__grid">
          <section className="sample-card release-incident-comms-approval-packs__panel" aria-label="Approval packs">
            <div className="section-heading">
              <p className="eyebrow">Approval packs</p>
              <h4>Staged review</h4>
            </div>

            <p>{run.summary}</p>

            <div className="release-incident-comms-approval-packs__actions">
              <button
                type="button"
                className="primary-button"
                disabled={run.stage !== "draft"}
                onClick={start}
              >
                {run.stage === "draft" ? "Start staged review" : "Review started"}
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "override-required"}
                onClick={applyOverride}
              >
                Apply legal override
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "ready-to-publish"}
                onClick={publish}
              >
                Publish incident comms
              </button>
            </div>

            <div className="release-incident-comms-approval-packs__pack-list">
              {packs.map((pack) => (
                <article key={pack.id} className="release-incident-comms-approval-packs__pack-card">
                  <div>
                    <strong>{pack.label}</strong>
                    <p>{pack.note}</p>
                  </div>

                  <div>
                    <span>{pack.status}</span>
                    <p>{pack.owner}</p>
                    <p>{pack.role}</p>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={pack.status !== "awaiting-approval"}
                      onClick={() => approvePack(pack.id, pack.owner)}
                    >
                      {pack.status === "awaiting-approval"
                        ? `Approve ${pack.label}`
                        : "Approved"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="sample-card release-incident-comms-approval-packs__panel" aria-label="Rollback wording diff and audit">
            <div className="section-heading">
              <p className="eyebrow">Wording diff</p>
              <h4>Baseline vs legal override</h4>
            </div>

            <div className="release-incident-comms-approval-packs__diff-list">
              {diffRows.map((row) => (
                <article key={row.id} className="release-incident-comms-approval-packs__diff-card">
                  <div>
                    <strong>{row.field}</strong>
                    <p>{`Baseline: ${row.baseline}`}</p>
                    <p>{`Override: ${row.override}`}</p>
                  </div>
                  <span>{row.status}</span>
                </article>
              ))}
            </div>

            <div className="release-incident-comms-approval-packs__audit-list">
              {auditEvents.map((event) => (
                <article key={event.id} className="release-incident-comms-approval-packs__audit-card">
                  <div className="release-incident-comms-approval-packs__audit-meta">
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