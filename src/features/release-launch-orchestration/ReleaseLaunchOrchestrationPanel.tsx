import { useReleaseLaunchOrchestration } from './useReleaseLaunchOrchestration'

function getStatusTone(status: 'loading' | 'ready' | 'error', mutationStatus: 'idle' | 'working' | 'saved' | 'error') {
  if (status === 'error' || mutationStatus === 'error') {
    return 'status--error'
  }

  if (status === 'loading' || mutationStatus === 'working') {
    return 'status--idle'
  }

  return mutationStatus === 'saved' ? 'status--success' : 'status--idle'
}

function formatStageLabel(stage: 'draft' | 'launching' | 'completed' | 'aborted') {
  if (stage === 'draft') {
    return 'Draft'
  }

  if (stage === 'launching') {
    return 'Launching'
  }

  if (stage === 'completed') {
    return 'Completed'
  }

  return 'Aborted'
}

export default function ReleaseLaunchOrchestrationPanel() {
  const {
    abortArmed,
    activeCheckpoint,
    armAbort,
    checkpoints,
    guardrails,
    message,
    mutationStatus,
    run,
    startLaunch,
    status,
  } = useReleaseLaunchOrchestration()

  const defaultMessage = run?.stage === 'completed'
    ? 'Completed progressive rollout through all checkpoints.'
    : run?.stage === 'aborted'
      ? run.abortReason ?? 'The rollout was automatically aborted by a guardrail.'
      : 'Start the rollout, then watch each checkpoint either advance or stop when a guardrail trips.'

  return (
    <div className="release-launch-orchestration">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release launch orchestration</h3>
      </div>

      <p className="section-copy">
        This thirteenth feature slice models a progressive rollout run. It promotes through checkpoint traffic bands in
        the background while live guardrails can automatically abort the launch if the rollout turns unhealthy.
      </p>

      <div className="release-launch-orchestration__summary">
        <article className="sample-card">
          <p className="eyebrow">Run stage</p>
          <h4>{run ? formatStageLabel(run.stage) : 'Loading'}</h4>
          <p>{run ? `${run.updatedBy} at ${run.updatedAt}` : 'Waiting for orchestration workspace'}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Active checkpoint</p>
          <h4>{activeCheckpoint?.name ?? 'Not started'}</h4>
          <p>{activeCheckpoint ? `${activeCheckpoint.trafficPercent}% traffic under watch` : 'Launch has not started yet'}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === 'loading' ? 'Loading launch orchestration workspace...' : message ?? defaultMessage}
      </div>

      {run ? (
        <div className="release-launch-orchestration__grid">
          <section className="sample-card release-launch-orchestration__panel" aria-label="Launch controls">
            <div className="section-heading">
              <p className="eyebrow">Launch controls</p>
              <h4>Checkpoint commands</h4>
            </div>

            <p>{run.summary}</p>
            <p>{abortArmed ? 'Abort is armed for the next checkpoint tick.' : 'Guardrails are observing live telemetry.'}</p>

            <div className="release-launch-orchestration__actions">
              <button
                type="button"
                className="primary-button"
                disabled={run.stage !== 'draft'}
                onClick={startLaunch}
              >
                {run.stage === 'draft' ? 'Start progressive rollout' : 'Launch already started'}
              </button>

              <button
                type="button"
                className="secondary-button"
                disabled={run.stage !== 'launching' || abortArmed}
                onClick={armAbort}
              >
                {abortArmed ? 'Abort armed for next tick' : 'Arm abort condition'}
              </button>
            </div>

            {run.abortReason ? <p className="release-launch-orchestration__abort">{run.abortReason}</p> : null}
          </section>

          <section className="sample-card release-launch-orchestration__panel" aria-label="Checkpoint timeline">
            <div className="section-heading">
              <p className="eyebrow">Checkpoint timeline</p>
              <h4>Progressive rollout</h4>
            </div>

            <div className="release-launch-orchestration__checkpoint-list">
              {checkpoints.map((checkpoint) => (
                <article key={checkpoint.id} className="release-launch-orchestration__checkpoint-card">
                  <div>
                    <strong>{checkpoint.name}</strong>
                    <p>{checkpoint.note}</p>
                  </div>
                  <span>{checkpoint.status}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="sample-card release-launch-orchestration__panel" aria-label="Guardrail monitors">
            <div className="section-heading">
              <p className="eyebrow">Guardrail monitors</p>
              <h4>Automatic abort rules</h4>
            </div>

            <div className="release-launch-orchestration__guardrail-list">
              {guardrails.map((guardrail) => (
                <article key={guardrail.id} className="release-launch-orchestration__guardrail-card">
                  <div>
                    <strong>{guardrail.name}</strong>
                    <p>{guardrail.effect}</p>
                  </div>
                  <div>
                    <span>{guardrail.currentValue}</span>
                    <p>{guardrail.threshold}</p>
                    <strong>{guardrail.status}</strong>
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