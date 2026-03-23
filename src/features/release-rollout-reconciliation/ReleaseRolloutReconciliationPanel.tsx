import { useReleaseRolloutReconciliation } from './useReleaseRolloutReconciliation'

export default function ReleaseRolloutReconciliationPanel() {
  const { displayedSegments, message, promoteToFullRollout, status } = useReleaseRolloutReconciliation()

  return (
    <div className="release-rollout-reconciliation">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release rollout reconciliation</h3>
      </div>

      <p className="section-copy">
        This sixth feature slice keeps the fast optimistic UI from the earlier rollout sample, but now a background
        refetch can correct that optimistic guess when the server settles on a different final state.
      </p>

      <div className={`status ${status === 'error' ? 'status--error' : 'status--idle'}`}>
        {status === 'loading'
          ? 'Refreshing rollout workspace...'
          : message ?? 'Promote a segment to 100% and wait for the next server refresh to reconcile the result.'}
      </div>

      <div className="release-rollout-reconciliation__grid">
        {displayedSegments.map((segment) => {
          const isOptimistic = segment.displayStatus === 'optimistic'
          return (
            <article key={segment.id} className="sample-card release-rollout-reconciliation__card">
              <div className="section-heading">
                <p className="eyebrow">Audience segment</p>
                <h4>{segment.audience}</h4>
              </div>

              <div className="release-rollout-reconciliation__metrics">
                <div>
                  <span className="eyebrow">Displayed rollout</span>
                  <strong>{segment.displayPercent}%</strong>
                </div>
                <div>
                  <span className="eyebrow">Server rollout</span>
                  <strong>{segment.actualRolloutPercent}%</strong>
                </div>
              </div>

              <p>
                {isOptimistic
                  ? `Optimistic client state. Server revision ${segment.revision} is still reconciling.`
                  : `Server is ${segment.status} at revision ${segment.revision}.`}
              </p>

              <button
                type="button"
                className="primary-button"
                disabled={isOptimistic || segment.actualRolloutPercent === 100}
                onClick={() => promoteToFullRollout(segment)}
              >
                {isOptimistic ? 'Waiting for reconciliation...' : 'Promote to 100%'}
              </button>
            </article>
          )
        })}
      </div>
    </div>
  )
}
