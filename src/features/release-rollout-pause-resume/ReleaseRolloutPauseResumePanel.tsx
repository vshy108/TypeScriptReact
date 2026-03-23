import { useReleaseRolloutPauseResume } from './useReleaseRolloutPauseResume'

function getStatusTone(status: 'loading' | 'ready' | 'error', mutationStatus: 'idle' | 'working' | 'saved' | 'error') {
  if (status === 'error' || mutationStatus === 'error') {
    return 'status--error'
  }

  if (status === 'loading' || mutationStatus === 'working') {
    return 'status--idle'
  }

  return mutationStatus === 'saved' ? 'status--success' : 'status--idle'
}

function formatStageLabel(stage: 'draft' | 'launching' | 'paused' | 'completed') {
  if (stage === 'draft') {
    return 'Draft'
  }

  if (stage === 'launching') {
    return 'Launching'
  }

  if (stage === 'paused') {
    return 'Paused'
  }

  return 'Completed'
}

export default function ReleaseRolloutPauseResumePanel() {
  const {
    acknowledgements,
    acknowledgementsReady,
    acknowledge,
    activeCheckpoint,
    checkpoints,
    message,
    mutationStatus,
    pause,
    resume,
    run,
    start,
    status,
  } = useReleaseRolloutPauseResume()

  const defaultMessage = run?.stage === 'completed'
    ? 'Completed rollout after a paused checkpoint and manual override recovery.'
    : run?.stage === 'paused'
      ? run.pauseReason ?? 'The rollout is paused pending operator acknowledgement.'
      : 'Start the rollout, pause at a checkpoint, then gather acknowledgements before resuming with manual override.'

  return (
    <div className="release-rollout-pause-resume">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release rollout pause and resume</h3>
      </div>

      <p className="section-copy">
        This fourteenth feature slice models a rollout that pauses mid-flight when operators want to inspect a signal.
        Resuming requires explicit acknowledgements from the right owners and records that a manual override was used.
      </p>

      <div className="release-rollout-pause-resume__summary">
        <article className="sample-card">
          <p className="eyebrow">Run stage</p>
          <h4>{run ? formatStageLabel(run.stage) : 'Loading'}</h4>
          <p>{run ? `${run.updatedBy} at ${run.updatedAt}` : 'Waiting for pause-and-resume workspace'}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Active checkpoint</p>
          <h4>{activeCheckpoint?.name ?? 'Not started'}</h4>
          <p>{run?.manualOverrideUsed ? 'Manual override recorded on the current run.' : 'No manual override has been used yet.'}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === 'loading' ? 'Loading rollout pause-and-resume workspace...' : message ?? defaultMessage}
      </div>

      {run ? (
        <div className="release-rollout-pause-resume__grid">
          <section className="sample-card release-rollout-pause-resume__panel" aria-label="Run controls">
            <div className="section-heading">
              <p className="eyebrow">Run controls</p>
              <h4>Pause and resume</h4>
            </div>

            <p>
              Use pause when a checkpoint needs operator review. Resume is allowed only after both acknowledgements are
              recorded.
            </p>

            <div className="release-rollout-pause-resume__actions">
              <button
                type="button"
                className="primary-button"
                disabled={run.stage !== 'draft'}
                onClick={start}
              >
                {run.stage === 'draft' ? 'Start rollout' : 'Rollout already started'}
              </button>

              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== 'launching'}
                onClick={pause}
              >
                Pause at active checkpoint
              </button>

              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== 'paused'}
                onClick={resume}
              >
                Resume with manual override
              </button>
            </div>

            {run.pauseReason ? <p className="release-rollout-pause-resume__reason">{run.pauseReason}</p> : null}
            <p>{acknowledgementsReady ? 'All acknowledgements are complete.' : 'Acknowledgements are still pending.'}</p>
          </section>

          <section className="sample-card release-rollout-pause-resume__panel" aria-label="Checkpoint timeline">
            <div className="section-heading">
              <p className="eyebrow">Checkpoint timeline</p>
              <h4>Traffic promotion</h4>
            </div>

            <div className="release-rollout-pause-resume__checkpoint-list">
              {checkpoints.map((checkpoint) => (
                <article key={checkpoint.id} className="release-rollout-pause-resume__checkpoint-card">
                  <div>
                    <strong>{checkpoint.name}</strong>
                    <p>{checkpoint.note}</p>
                  </div>
                  <span>{checkpoint.status}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="sample-card release-rollout-pause-resume__panel" aria-label="Acknowledgement gate">
            <div className="section-heading">
              <p className="eyebrow">Acknowledgement gate</p>
              <h4>Required owners</h4>
            </div>

            <div className="release-rollout-pause-resume__acknowledgement-list">
              {acknowledgements.map((acknowledgement) => (
                <article key={acknowledgement.id} className="release-rollout-pause-resume__acknowledgement-card">
                  <div>
                    <strong>{acknowledgement.owner}</strong>
                    <p>{acknowledgement.role}</p>
                  </div>

                  <div>
                    <span>{acknowledgement.status}</span>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={acknowledgement.status === 'acknowledged' || run.stage !== 'paused'}
                      onClick={() => acknowledge(acknowledgement.id, acknowledgement.role)}
                    >
                      {acknowledgement.status === 'acknowledged' ? 'Acknowledged' : `Acknowledge ${acknowledgement.role}`}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}