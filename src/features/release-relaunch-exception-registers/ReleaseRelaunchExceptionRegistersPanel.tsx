import { useReleaseRelaunchExceptionRegisters } from "./useReleaseRelaunchExceptionRegisters";

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
    | "register-review"
    | "stale-threshold-review"
    | "approver-signoff"
    | "ready-to-publish"
    | "published",
) {
  if (stage === "draft") {
    return "Draft";
  }

  if (stage === "register-review") {
    return "Register review";
  }

  if (stage === "stale-threshold-review") {
    return "Invalidate stale thresholds";
  }

  if (stage === "approver-signoff") {
    return "Approver sign-off";
  }

  if (stage === "ready-to-publish") {
    return "Ready to publish";
  }

  return "Published";
}

export default function ReleaseRelaunchExceptionRegistersPanel() {
  const {
    activeRegister,
    approveRegister,
    auditEvents,
    invalidateThresholds,
    message,
    mutationStatus,
    publish,
    registers,
    run,
    signOff,
    staleThresholds,
    start,
    status,
    thresholds,
  } = useReleaseRelaunchExceptionRegisters();

  const defaultMessage =
    run?.stage === "published"
      ? "Published the relaunch exception register after stale-threshold invalidation and approver sign-off completed."
      : run?.stage === "stale-threshold-review"
        ? run.publishBlockedReason ??
          "Stale thresholds must be invalidated before approver sign-off can begin."
        : "Review each relaunch exception register, invalidate stale thresholds, collect approver sign-off on the revised thresholds, and then publish the reconciled register set.";

  return (
    <div className="release-relaunch-exception-registers">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release relaunch exception registers</h3>
      </div>

      <p className="section-copy">
        This thirtieth feature slice models relaunch exception registers. Owners review each relaunch lane, stale
        thresholds must be invalidated, and an approver must sign off on the revised thresholds before the reconciled
        register can publish.
      </p>

      <div className="release-relaunch-exception-registers__summary">
        <article className="sample-card">
          <p className="eyebrow">Relaunch stage</p>
          <h4>{run ? formatStageLabel(run.stage) : "Loading"}</h4>
          <p>{run ? `${run.updatedBy} at ${run.updatedAt}` : "Waiting for relaunch exception workspace"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Active register</p>
          <h4>{activeRegister?.label ?? "Not started"}</h4>
          <p>{activeRegister ? activeRegister.audience : "No relaunch register is active yet"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Stale thresholds</p>
          <h4>{staleThresholds.length === 0 ? "Cleared" : `${staleThresholds.length} stale`}</h4>
          <p>{run?.publishBlockedReason ?? "The relaunch exception register is clear to publish."}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === "loading" ? "Loading relaunch exception workspace..." : message ?? defaultMessage}
      </div>

      {run ? (
        <div className="release-relaunch-exception-registers__grid">
          <section className="sample-card release-relaunch-exception-registers__panel" aria-label="Relaunch registers">
            <div className="section-heading">
              <p className="eyebrow">Relaunch registers</p>
              <h4>Owner review</h4>
            </div>

            <p>{run.summary}</p>

            <div className="release-relaunch-exception-registers__actions">
              <button
                type="button"
                className="primary-button"
                disabled={run.stage !== "draft"}
                onClick={start}
              >
                {run.stage === "draft" ? "Start relaunch review" : "Relaunch review started"}
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "stale-threshold-review"}
                onClick={invalidateThresholds}
              >
                Invalidate stale thresholds
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
                Publish relaunch register
              </button>
            </div>

            <div className="release-relaunch-exception-registers__register-list">
              {registers.map((register) => (
                <article key={register.id} className="release-relaunch-exception-registers__register-card">
                  <div>
                    <strong>{register.label}</strong>
                    <p>{register.note}</p>
                    <p>{`${register.owner} - ${register.audience}`}</p>
                  </div>

                  <div>
                    <span>{register.status}</span>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={register.status !== "awaiting-review"}
                      onClick={() => approveRegister(register.id, register.label)}
                    >
                      {register.status === "awaiting-review" ? `Approve ${register.label}` : "Approved"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="sample-card release-relaunch-exception-registers__panel" aria-label="Thresholds and audit">
            <div className="section-heading">
              <p className="eyebrow">Threshold rows</p>
              <h4>Stale vs revised thresholds</h4>
            </div>

            <div className="release-relaunch-exception-registers__threshold-list">
              {thresholds.map((threshold) => (
                <article key={threshold.id} className="release-relaunch-exception-registers__threshold-card">
                  <div>
                    <strong>{threshold.register}</strong>
                    <p>{`Stale: ${threshold.staleThreshold}`}</p>
                    <p>{`Revised: ${threshold.revisedThreshold}`}</p>
                    <p>{threshold.reason}</p>
                  </div>
                  <span>{threshold.status}</span>
                </article>
              ))}
            </div>

            <div className="release-relaunch-exception-registers__audit-list">
              {auditEvents.map((event) => (
                <article key={event.id} className="release-relaunch-exception-registers__audit-card">
                  <div className="release-relaunch-exception-registers__audit-meta">
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