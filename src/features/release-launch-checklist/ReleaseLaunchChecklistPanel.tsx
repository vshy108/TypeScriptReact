import { useLaunchChecklistWorkflow } from './useLaunchChecklistWorkflow'
import type { LaunchStepId } from './types'

const stepDescriptions = {
  'freeze-window': 'Lock the release window before any public-facing follow-up actions begin.',
  'announce-status': 'Publish the status update only after the freeze is recorded.',
  'confirm-launch': 'Confirm the handoff only after the earlier steps are complete.',
} as const satisfies Record<LaunchStepId, string>

function getStatusTone(status: 'loading' | 'ready' | 'error', saveStatus: 'idle' | 'saving' | 'saved' | 'error') {
  if (status === 'error' || saveStatus === 'error') {
    return 'status--error'
  }

  if (status === 'loading' || saveStatus === 'saving') {
    return 'status--idle'
  }

  return saveStatus === 'saved' ? 'status--success' : 'status--idle'
}

export default function ReleaseLaunchChecklistPanel() {
  const {
    activeStep,
    canOpenStep,
    completedStepCount,
    draftValues,
    message,
    revision,
    saveStatus,
    saveStep,
    selectStep,
    status,
    steps,
    updateDraft,
  } = useLaunchChecklistWorkflow()

  return (
    <div className="release-launch-checklist">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release launch multi-step workflow</h3>
      </div>

      <p className="section-copy">
        This fourth feature slice demonstrates dependent follow-up actions: one saved mutation unlocks the next step,
        so the workflow models sequencing, validation, and progress across multiple mutations.
      </p>

      <div className="release-launch-checklist__summary">
        <article className="sample-card">
          <p className="eyebrow">Progress</p>
          <h4>{`${completedStepCount}/${steps.length}`}</h4>
          <p>Each completed step unlocks the next operational action.</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Workspace revision</p>
          <h4>{revision ?? 'Loading'}</h4>
          <p>Save a step to advance the mutation chain.</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, saveStatus)}`}>
        {status === 'loading'
          ? 'Loading launch checklist...'
          : message ?? 'Save the active step to unlock the next dependent action.'}
      </div>

      <div className="release-launch-checklist__grid">
        <section className="sample-card release-launch-checklist__steps" aria-label="Launch steps">
          <div className="section-heading">
            <p className="eyebrow">Steps</p>
            <h4>Launch steps</h4>
          </div>
          <div className="release-launch-checklist__step-list">
            {steps.map((step) => (
              <button
                key={step.id}
                type="button"
                className={`filter-button ${activeStep?.id === step.id ? 'is-selected' : ''}`}
                disabled={!canOpenStep(step.id)}
                onClick={() => selectStep(step.id)}
              >
                {`${step.completed ? 'Completed' : 'Open'} - ${step.title}`}
              </button>
            ))}
          </div>
        </section>

        <section className="sample-card release-launch-checklist__editor" aria-label="Active launch step">
          <div className="section-heading">
            <p className="eyebrow">Active step</p>
            <h4>{activeStep?.title ?? 'Waiting for step data'}</h4>
          </div>

          <p className="section-copy">{activeStep ? stepDescriptions[activeStep.id] : 'Select a step to continue.'}</p>

          {activeStep ? (
            <>
              <p>{`Owner: ${activeStep.owner}`}</p>
              <p>{`Saved value: ${activeStep.savedValue ?? 'not saved yet'}`}</p>
              <label className="field">
                <span>Step note</span>
                <textarea
                  aria-label="Step note"
                  rows={5}
                  value={draftValues[activeStep.id] ?? ''}
                  onChange={(event) => updateDraft(activeStep.id, event.target.value)}
                />
              </label>

              <div className="release-launch-checklist__actions">
                <button type="button" className="primary-button" disabled={saveStatus === 'saving'} onClick={saveStep}>
                  {saveStatus === 'saving' ? 'Saving step...' : 'Save step'}
                </button>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </div>
  )
}
