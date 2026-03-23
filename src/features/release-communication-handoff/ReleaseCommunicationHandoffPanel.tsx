import { useReleaseCommunicationHandoff } from "./useReleaseCommunicationHandoff";

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
    | "ready-for-handoff"
    | "publishing"
    | "recovery"
    | "completed",
) {
  if (stage === "draft") {
    return "Draft";
  }

  if (stage === "ready-for-handoff") {
    return "Ready for handoff";
  }

  if (stage === "publishing") {
    return "Publishing";
  }

  if (stage === "recovery") {
    return "Recovery";
  }

  return "Completed";
}

export default function ReleaseCommunicationHandoffPanel() {
  const {
    acknowledge,
    activeChannel,
    allChannelsReady,
    channels,
    confirmRecovery,
    message,
    mutationStatus,
    run,
    startPublish,
    status,
  } = useReleaseCommunicationHandoff();

  const defaultMessage =
    run?.stage === "completed"
      ? "Completed staged handoff across every channel after recovering the email publish step."
      : run?.stage === "recovery"
        ? run.recoveryReason ??
          "One channel needs recovery confirmation before the handoff can continue."
        : "Acknowledge every channel owner, then publish the incident update in stages so the handoff can recover safely if one channel fails.";

  return (
    <div className="release-communication-handoff">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release communication handoff</h3>
      </div>

      <p className="section-copy">
        This sixteenth feature slice models the operational handoff for an incident update. Each channel owner must
        acknowledge their lane before staged publish starts, and a failed email stage forces recovery confirmation
        before the final channel can continue.
      </p>

      <div className="release-communication-handoff__summary">
        <article className="sample-card">
          <p className="eyebrow">Handoff stage</p>
          <h4>{run ? formatStageLabel(run.stage) : "Loading"}</h4>
          <p>{run ? `${run.updatedBy} at ${run.updatedAt}` : "Waiting for communication handoff workspace"}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Active channel</p>
          <h4>{activeChannel?.name ?? "Not started"}</h4>
          <p>{activeChannel ? `${activeChannel.owner} is handling the active publish lane` : "No channel is publishing yet"}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === "loading" ? "Loading communication handoff workspace..." : message ?? defaultMessage}
      </div>

      {run ? (
        <div className="release-communication-handoff__grid">
          <section className="sample-card release-communication-handoff__panel" aria-label="Handoff controls">
            <div className="section-heading">
              <p className="eyebrow">Handoff controls</p>
              <h4>Staged publish</h4>
            </div>

            <p>{run.summary}</p>
            <p>{allChannelsReady ? "All channels are acknowledged and ready for staged publish." : "Some channels still need acknowledgement before staged publish can start."}</p>

            <div className="release-communication-handoff__actions">
              <button
                type="button"
                className="primary-button"
                disabled={run.stage !== "ready-for-handoff"}
                onClick={startPublish}
              >
                {run.stage === "ready-for-handoff" ? "Start staged publish" : "Publish already started"}
              </button>

              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== "recovery"}
                onClick={confirmRecovery}
              >
                Confirm recovery and continue
              </button>
            </div>

            {run.recoveryReason ? (
              <p className="release-communication-handoff__recovery">{run.recoveryReason}</p>
            ) : null}
          </section>

          <section className="sample-card release-communication-handoff__panel" aria-label="Channel handoff">
            <div className="section-heading">
              <p className="eyebrow">Channel handoff</p>
              <h4>Owner acknowledgements</h4>
            </div>

            <div className="release-communication-handoff__channel-list">
              {channels.map((channel) => (
                <article key={channel.id} className="release-communication-handoff__channel-card">
                  <div>
                    <strong>{channel.name}</strong>
                    <p>{channel.note}</p>
                  </div>

                  <div>
                    <span>{channel.status}</span>
                    <p>{channel.owner}</p>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={channel.status !== "awaiting-ack" || run.stage !== "ready-for-handoff"}
                      onClick={() => acknowledge(channel.id, channel.name)}
                    >
                      {channel.status === "awaiting-ack" ? `Acknowledge ${channel.name}` : "Acknowledged"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}