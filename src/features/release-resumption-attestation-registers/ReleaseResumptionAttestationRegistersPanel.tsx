import { useReleaseResumptionAttestationRegisters } from "./useReleaseResumptionAttestationRegisters";

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
    | "stale-check-review"
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

  if (stage === "stale-check-review") {
    return "Invalidate stale checks";
  }

  if (stage === "approver-signoff") {
    return "Approver sign-off";
  }

  if (stage === "ready-to-publish") {
    return "Ready to publish";
  }

  return "Published";
}

export default function ReleaseResumptionAttestationRegistersPanel() {
  const {
    activeRegister,
    approveRegister,
    auditEvents,
    checks,
    invalidateChecks,
    message,
    mutationStatus,
    publish,
    registers,
    run,
    signOff,
    staleChecks,
    start,
    status,
  } = useReleaseResumptionAttestationRegisters();

  const defaultMessage =
    run?.stage === "published"
      ? "Published the resumption attestation packet after stale-check invalidation and approver sign-off completed."
      : run?.stage === "stale-check-review"
        ? run.publishBlockedReason ??
          "Stale checks must be invalidated before approver sign-off can begin."
        : "Review each resumption register, invalidate stale checks, collect approver sign-off on the revised packet, and then publish the final resumption attestation packet.";

  return (
    <div className="release-resumption-attestation-registers">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release resumption attestation registers</h3>
      </div>

      <p className="section-copy">
        This thirty-fourth feature slice models resumption attestation registers. Owners review each register,
        stale checks must be invalidated, and an approver must sign off on the revised packet before the
        resumption attestation can publish.
      </p>

      <div className="release-resumption-attestation-registers__summary">
        <article className="sample-card">
          <p className="eyebrow">Attestation stage</p>
          <h4>{run ? formatStageLabel(run.stage) : "Loading"}</h4>
          <p>{run ? `${run.updatedBy} at ${run.updatedAt}` : "Waiting for resumption attestation workspace"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Active register</p>
          <h4>{activeRegister?.label ?? "Not started"}</h4>
          <p>{activeRegister ? activeRegister.audience : "No resumption register is active yet"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Stale checks</p>
          <h4>{staleChecks.length === 0 ? "Cleared" : `${staleChecks.length} stale`}</h4>
          <p>{run?.publishBlockedReason ?? "The resumption attestation packet is clear to publish."}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === "loading" ? "Loading resumption attestation workspace..." : message ?? defaultMessage}
      </div>

      {run ? (
        <div className="release-resumption-attestation-registers__grid">
          <section className="sample-card release-resumption-attestation-registers__panel" aria-label="Resumption attestation registers">
            <div className="section-heading">
              <p className="eyebrow">Attestation registers</p>
              <h4>Owner review</h4>
            </div>

            <p>{run.summary}</p>

            <div className="release-resumption-attestation-registers__actions">
              <button type="button" className="primary-button" disabled={run.stage !== "draft"} onClick={start}>
                {run.stage === "draft" ? "Start attestation review" : "Attestation review started"}
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "stale-check-review"}
                onClick={invalidateChecks}
              >
                Invalidate stale checks
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

            <div className="release-resumption-attestation-registers__register-list">
              {registers.map((register) => (
                <article key={register.id} className="release-resumption-attestation-registers__register-card">
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
                      {register.status === "awaiting-review"
                        ? `Approve ${register.label}`
                        : "Approved"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="sample-card release-resumption-attestation-registers__panel" aria-label="Resumption checks and audit">
            <div className="section-heading">
              <p className="eyebrow">Check rows</p>
              <h4>Stale vs revised checks</h4>
            </div>

            <div className="release-resumption-attestation-registers__check-list">
              {checks.map((check) => (
                <article key={check.id} className="release-resumption-attestation-registers__check-card">
                  <div>
                    <strong>{check.register}</strong>
                    <p>{`Stale: ${check.staleCheck}`}</p>
                    <p>{`Revised: ${check.revisedCheck}`}</p>
                    <p>{check.reason}</p>
                  </div>
                  <span>{check.status}</span>
                </article>
              ))}
            </div>

            <div className="release-resumption-attestation-registers__audit-list">
              {auditEvents.map((event) => (
                <article key={event.id} className="release-resumption-attestation-registers__audit-card">
                  <div className="release-resumption-attestation-registers__audit-meta">
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