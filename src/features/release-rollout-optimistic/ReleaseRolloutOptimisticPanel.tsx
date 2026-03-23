import { useRolloutOptimisticWorkflow } from './useRolloutOptimisticWorkflow'
import type { BlockerSeverity } from './types'

const severityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
} as const satisfies Record<BlockerSeverity, string>

function getStatusTone(status: 'loading' | 'ready' | 'error', errorMessage: string | null, successMessage: string | null) {
  if (status === 'error' || errorMessage) {
    return 'status--error'
  }

  if (status === 'loading') {
    return 'status--idle'
  }

  return successMessage ? 'status--success' : 'status--idle'
}

export default function ReleaseRolloutOptimisticPanel() {
  const {
    errorMessage,
    resolvedCount,
    resolutionNotes,
    revision,
    status,
    successMessage,
    updateResolutionNote,
    visibleBlockers,
    resolveOptimistically,
  } = useRolloutOptimisticWorkflow()

  return (
    <div className="release-rollout-optimistic">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release rollout optimistic updates</h3>
      </div>

      <p className="section-copy">
        This third feature slice demonstrates optimistic UI: blockers disappear immediately when you resolve them,
        then either stay gone on success or roll back into the list if the server-side validation rejects the mutation.
      </p>

      <div className="release-rollout-optimistic__summary">
        <article className="sample-card">
          <p className="eyebrow">Open blockers</p>
          <h4>{visibleBlockers.length}</h4>
          <p>{`Resolved this session: ${resolvedCount}`}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Workspace revision</p>
          <h4>{revision ?? 'Loading'}</h4>
          <p>Resolve a blocker to watch the optimistic state diverge from the persisted state.</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, errorMessage, successMessage)}`}>
        {errorMessage
          ? errorMessage
          : status === 'loading'
            ? 'Loading rollout blockers...'
            : successMessage ?? 'Resolve a blocker with a note to see the optimistic update and rollback behavior.'}
      </div>

      <div className="release-rollout-optimistic__list" aria-label="Open rollout blockers">
        {visibleBlockers.map((blocker) => (
          <section key={blocker.id} className="sample-card release-rollout-optimistic__card">
            <div className="release-rollout-optimistic__header">
              <div>
                <strong>{blocker.title}</strong>
                <p>{`${blocker.owner} - ${blocker.affectedSurface}`}</p>
              </div>
              <span className="pill">{severityLabels[blocker.severity]}</span>
            </div>

            <p className="section-copy">{`Updated ${blocker.updatedAt}${blocker.requiresEscalation ? ' - escalation note required' : ''}`}</p>

            <label className="field">
              <span>Resolution note</span>
              <textarea
                aria-label={`Resolution note for ${blocker.title}`}
                rows={4}
                value={resolutionNotes[blocker.id] ?? ''}
                onChange={(event) => updateResolutionNote(blocker.id, event.target.value)}
              />
            </label>

            <div className="release-rollout-optimistic__actions">
              <button type="button" className="primary-button" onClick={() => resolveOptimistically(blocker.id)}>
                Resolve optimistically
              </button>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
