import { useMemo } from 'react'
import { useReleaseApprovalWorkflow } from './useReleaseApprovalWorkflow'
import type { ApprovalDecision, WorkflowStage } from './types'

const decisionLabels = {
  approve: 'Approve',
  hold: 'Hold',
  rollback: 'Rollback',
} as const satisfies Record<ApprovalDecision, string>

const stageLabels = {
  review: 'Review',
  ready: 'Ready',
  blocked: 'Blocked',
  paused: 'Paused',
} as const satisfies Record<WorkflowStage, string>

function getStatusTone(status: 'loading' | 'ready' | 'error', submitStatus: 'idle' | 'saving' | 'saved' | 'error') {
  if (status === 'error' || submitStatus === 'error') {
    return 'status--error'
  }

  if (status === 'loading' || submitStatus === 'saving') {
    return 'status--idle'
  }

  return submitStatus === 'saved' ? 'status--success' : 'status--idle'
}

export default function ReleaseApprovalWorkflowPanel() {
  const {
    draft,
    errorMessage,
    isDirty,
    releaseOptions,
    resetDraft,
    revision,
    selectedRelease,
    selectRelease,
    status,
    submit,
    submitMessage,
    submitStatus,
    updateDecision,
    updateNote,
    updateRolloutPercent,
  } = useReleaseApprovalWorkflow()

  const latestHistory = useMemo(() => selectedRelease?.history[0] ?? null, [selectedRelease])

  return (
    <div className="release-approval-workflow">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release approval mutation workflow</h3>
      </div>

      <p className="section-copy">
        This second feature slice focuses on mutation flow: load persisted workflow state, edit a typed draft,
        submit it through a client mutation, handle validation errors, and render the updated stored result.
      </p>

      <div className="release-approval-workflow__toolbar surface surface--compact">
        <label className="field">
          <span>Release for review</span>
          <select
            aria-label="Release for review"
            disabled={!releaseOptions.length || status === 'loading'}
            value={selectedRelease?.id ?? ''}
            onChange={(event) => selectRelease(event.target.value as (typeof releaseOptions)[number]['id'])}
          >
            {releaseOptions.map((release) => (
              <option key={release.id} value={release.id}>
                {`${release.name} - ${release.owner} - ${stageLabels[release.stage]}`}
              </option>
            ))}
          </select>
        </label>

        <div className="release-approval-workflow__summary">
          <article className="sample-card">
            <p className="eyebrow">Current state</p>
            <h4>{selectedRelease ? stageLabels[selectedRelease.stage] : 'Waiting for data'}</h4>
            <p>{selectedRelease ? `${decisionLabels[selectedRelease.currentDecision]} at ${selectedRelease.rolloutPercent}% rollout` : 'No release selected'}</p>
          </article>

          <article className="sample-card">
            <p className="eyebrow">Workspace revision</p>
            <h4>{revision ?? 'Loading'}</h4>
            <p>{selectedRelease?.owner ?? 'Owner not loaded yet'}</p>
          </article>
        </div>
      </div>

      <div className={`status ${getStatusTone(status, submitStatus)}`}>
        {errorMessage
          ? errorMessage
          : status === 'loading'
            ? 'Loading release approval workspace...'
            : submitMessage ?? 'Edit the draft and submit a mutation to update the persisted workflow state.'}
      </div>

      {selectedRelease ? (
        <div className="release-approval-workflow__grid">
          <section className="sample-card release-approval-workflow__form" aria-label="Approval form">
            <div className="section-heading">
              <p className="eyebrow">Draft</p>
              <h4>Approval form</h4>
            </div>

            <label className="field">
              <span>Decision</span>
              <select
                aria-label="Decision"
                value={draft.decision}
                onChange={(event) => updateDecision(event.target.value as ApprovalDecision)}
              >
                {Object.entries(decisionLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Rollout percent</span>
              <input
                aria-label="Rollout percent"
                type="number"
                min="0"
                max="100"
                value={draft.rolloutPercent}
                onChange={(event) => updateRolloutPercent(Number(event.target.value))}
              />
            </label>

            <label className="field">
              <span>Decision note</span>
              <textarea
                aria-label="Decision note"
                value={draft.note}
                rows={5}
                onChange={(event) => updateNote(event.target.value)}
              />
            </label>

            <div className="release-approval-workflow__actions">
              <button type="button" className="secondary-button" disabled={!isDirty || submitStatus === 'saving'} onClick={resetDraft}>
                Reset draft
              </button>
              <button type="button" className="primary-button" disabled={!isDirty || submitStatus === 'saving'} onClick={submit}>
                {submitStatus === 'saving' ? 'Saving decision...' : 'Save decision'}
              </button>
            </div>
          </section>

          <section className="sample-card release-approval-workflow__form" aria-label="Persisted workflow state">
            <div className="section-heading">
              <p className="eyebrow">Persisted state</p>
              <h4>Latest stored decision</h4>
            </div>

            <ul className="release-approval-workflow__facts">
              <li>
                <strong>Decision</strong>
                <span>{decisionLabels[selectedRelease.currentDecision]}</span>
              </li>
              <li>
                <strong>Rollout</strong>
                <span>{selectedRelease.rolloutPercent}%</span>
              </li>
              <li>
                <strong>Runbook required</strong>
                <span>{selectedRelease.requiresRunbook ? 'Yes' : 'No'}</span>
              </li>
              <li>
                <strong>Updated</strong>
                <span>{selectedRelease.updatedAt}</span>
              </li>
            </ul>

            {latestHistory ? (
              <div className="detail-panel">
                <div className="detail-panel__body">
                  <strong>{latestHistory.actor}</strong>
                  <p>{latestHistory.note}</p>
                  <p>{`${decisionLabels[latestHistory.decision]} at ${latestHistory.rolloutPercent}% rollout on ${latestHistory.recordedAt}`}</p>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}

      {selectedRelease ? (
        <section className="sample-card release-approval-workflow__history" aria-label="Approval history">
          <div className="section-heading">
            <p className="eyebrow">History</p>
            <h4>Approval history</h4>
          </div>

          <ul className="release-approval-workflow__timeline">
            {selectedRelease.history.map((entry) => (
              <li key={entry.id} className="release-approval-workflow__timeline-item">
                <div>
                  <strong>{entry.actor}</strong>
                  <p>{entry.note}</p>
                </div>
                <span className="pill">{`${decisionLabels[entry.decision]} - ${entry.rolloutPercent}%`}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}