import { useReleaseDelegatedApprovalBundles } from "./useReleaseDelegatedApprovalBundles";

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
    | "collecting-approvals"
    | "replaying-evidence"
    | "ready-to-publish"
    | "published",
) {
  if (stage === "draft") {
    return "Draft";
  }

  if (stage === "collecting-approvals") {
    return "Collecting approvals";
  }

  if (stage === "replaying-evidence") {
    return "Replaying evidence";
  }

  if (stage === "ready-to-publish") {
    return "Ready to publish";
  }

  return "Published";
}

export default function ReleaseDelegatedApprovalBundlesPanel() {
  const {
    activeBundle,
    approveBundle,
    auditEvents,
    bundles,
    evidence,
    message,
    mutationStatus,
    publish,
    replayEvidence,
    run,
    start,
    status,
  } = useReleaseDelegatedApprovalBundles();

  const defaultMessage =
    run?.stage === "published"
      ? "Published after delegated approval bundles cleared their expiry windows and the audit evidence was replayed."
      : run?.stage === "replaying-evidence"
        ? run.publishBlockedReason ??
          "Approvals are complete, but the replayable audit evidence still blocks publish."
        : "Start approval collection, let expiry windows trigger delegation when necessary, replay the audit evidence, and then clear the final publish gate.";

  return (
    <div className="release-delegated-approval-bundles">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release delegated approval bundles</h3>
      </div>

      <p className="section-copy">
        This nineteenth feature slice models delegated approval windows before publish. A primary approver can miss the
        expiry window, a delegate inherits the approval bundle, and the final publish stays blocked until audit evidence
        is replayed for the release coordinator.
      </p>

      <div className="release-delegated-approval-bundles__summary">
        <article className="sample-card">
          <p className="eyebrow">Approval stage</p>
          <h4>{run ? formatStageLabel(run.stage) : "Loading"}</h4>
          <p>{run ? `${run.updatedBy} at ${run.updatedAt}` : "Waiting for delegated approval workspace"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Active bundle</p>
          <h4>{activeBundle?.label ?? "Not started"}</h4>
          <p>
            {activeBundle
              ? `${activeBundle.currentApprover} is handling the live approval window`
              : "No approval bundle is active yet"}
          </p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Publish gate</p>
          <h4>{run?.publishBlockedReason ? "Blocked" : run ? "Cleared" : "Loading"}</h4>
          <p>{run?.publishBlockedReason ?? "All delegated approvals and evidence replay are complete."}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === "loading" ? "Loading delegated approval workspace..." : message ?? defaultMessage}
      </div>

      {run ? (
        <div className="release-delegated-approval-bundles__grid">
          <section className="sample-card release-delegated-approval-bundles__panel" aria-label="Delegated approval controls">
            <div className="section-heading">
              <p className="eyebrow">Approval controls</p>
              <h4>Delegated bundle flow</h4>
            </div>

            <p>{run.summary}</p>

            <div className="release-delegated-approval-bundles__actions">
              <button
                type="button"
                className="primary-button"
                disabled={run.stage !== "draft"}
                onClick={start}
              >
                {run.stage === "draft" ? "Start delegated approvals" : "Approvals already started"}
              </button>

              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "replaying-evidence"}
                onClick={replayEvidence}
              >
                Replay audit evidence
              </button>

              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "ready-to-publish"}
                onClick={publish}
              >
                Publish release
              </button>
            </div>

            <div className="release-delegated-approval-bundles__bundle-list">
              {bundles.map((bundle) => (
                <article key={bundle.id} className="release-delegated-approval-bundles__bundle-card">
                  <div>
                    <strong>{bundle.label}</strong>
                    <p>{bundle.note}</p>
                  </div>

                  <div>
                    <span>{bundle.status}</span>
                    <p>{bundle.currentApprover}</p>
                    <p>
                      {bundle.expiresInSeconds === null
                        ? "No active expiry"
                        : `${bundle.expiresInSeconds}s left`}
                    </p>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={
                        bundle.status !== "awaiting-approval" &&
                        bundle.status !== "delegated"
                      }
                      onClick={() => approveBundle(bundle.id, bundle.currentApprover)}
                    >
                      {bundle.status === "queued" || bundle.status === "approved"
                        ? "Approved"
                        : `Approve as ${bundle.currentApprover}`}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="sample-card release-delegated-approval-bundles__panel" aria-label="Delegated approval evidence">
            <div className="section-heading">
              <p className="eyebrow">Audit evidence</p>
              <h4>Replay and history</h4>
            </div>

            <div className="release-delegated-approval-bundles__evidence-list">
              {evidence.map((item) => (
                <article key={item.id} className="release-delegated-approval-bundles__evidence-card">
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.note}</p>
                  </div>
                  <span>{item.status}</span>
                </article>
              ))}
            </div>

            <div className="release-delegated-approval-bundles__audit-list">
              {auditEvents.map((event) => (
                <article key={event.id} className="release-delegated-approval-bundles__audit-card">
                  <div className="release-delegated-approval-bundles__audit-meta">
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