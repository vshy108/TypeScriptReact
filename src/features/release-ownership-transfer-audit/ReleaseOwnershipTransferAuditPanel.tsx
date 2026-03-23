import { useReleaseOwnershipTransferAudit } from "./useReleaseOwnershipTransferAudit";

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
    | "awaiting-outgoing-ack"
    | "awaiting-incoming-ack"
    | "replaying-context"
    | "completed",
) {
  if (stage === "draft") {
    return "Draft";
  }

  if (stage === "awaiting-outgoing-ack") {
    return "Awaiting outgoing ack";
  }

  if (stage === "awaiting-incoming-ack") {
    return "Awaiting incoming ack";
  }

  if (stage === "replaying-context") {
    return "Replaying context";
  }

  return "Completed";
}

export default function ReleaseOwnershipTransferAuditPanel() {
  const {
    acknowledgeStep,
    activeStep,
    auditEvents,
    message,
    mutationStatus,
    run,
    startTransfer,
    status,
    steps,
  } = useReleaseOwnershipTransferAudit();

  const defaultMessage =
    run?.stage === "completed"
      ? "Completed the ownership transfer after capturing both acknowledgements and replaying the escalation context in the audit history."
      : run?.stage === "replaying-context"
        ? "The incoming owner accepted the transfer. Replay the reroute and acknowledgement context before closing the handoff."
        : "Start the ownership handoff, collect outgoing and incoming acknowledgements, and keep an audit history that proves how the release context changed hands.";

  return (
    <div className="release-ownership-transfer-audit">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release ownership transfer audit</h3>
      </div>

      <p className="section-copy">
        This eighteenth feature slice models a realistic operator handoff. Ownership does not move until the outgoing
        owner signs off, the incoming owner accepts the handoff, and the last escalation reroute history is replayed
        into the audit trail.
      </p>

      <div className="release-ownership-transfer-audit__summary">
        <article className="sample-card">
          <p className="eyebrow">Transfer stage</p>
          <h4>{run ? formatStageLabel(run.stage) : "Loading"}</h4>
          <p>{run ? `${run.updatedBy} at ${run.updatedAt}` : "Waiting for ownership transfer workspace"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Current owner</p>
          <h4>{run?.currentOwner ?? "Loading"}</h4>
          <p>{run?.pendingOwner ? `Pending transfer to ${run.pendingOwner}` : "Ownership transfer is closed"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Active step</p>
          <h4>{activeStep?.label ?? "Not started"}</h4>
          <p>{activeStep ? `${activeStep.owner} is responsible for the next acknowledgement` : "No acknowledgement is active yet"}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === "loading" ? "Loading ownership transfer audit workspace..." : message ?? defaultMessage}
      </div>

      {run ? (
        <div className="release-ownership-transfer-audit__grid">
          <section className="sample-card release-ownership-transfer-audit__panel" aria-label="Ownership transfer steps">
            <div className="section-heading">
              <p className="eyebrow">Transfer steps</p>
              <h4>Ownership handoff</h4>
            </div>

            <p>{run.summary}</p>

            <div className="release-ownership-transfer-audit__actions">
              <button
                type="button"
                className="primary-button"
                disabled={run.stage !== "draft"}
                onClick={startTransfer}
              >
                {run.stage === "draft" ? "Start ownership transfer" : "Transfer already started"}
              </button>
            </div>

            <div className="release-ownership-transfer-audit__step-list">
              {steps.map((step) => (
                <article key={step.id} className="release-ownership-transfer-audit__step-card">
                  <div>
                    <strong>{step.label}</strong>
                    <p>{step.note}</p>
                  </div>

                  <div>
                    <span>{step.status}</span>
                    <p>{step.owner}</p>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={step.status !== "awaiting-ack"}
                      onClick={() => acknowledgeStep(step.id, step.label)}
                    >
                      {step.status === "awaiting-ack" ? `Acknowledge ${step.label}` : "Acknowledged"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="sample-card release-ownership-transfer-audit__panel" aria-label="Ownership transfer audit history">
            <div className="section-heading">
              <p className="eyebrow">Audit history</p>
              <h4>Acknowledgement trail</h4>
            </div>

            <div className="release-ownership-transfer-audit__event-list">
              {auditEvents.map((event) => (
                <article key={event.id} className="release-ownership-transfer-audit__event-card">
                  <div className="release-ownership-transfer-audit__event-meta">
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