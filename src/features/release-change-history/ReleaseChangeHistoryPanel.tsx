import { useReleaseChangeHistory } from './useReleaseChangeHistory'

function getStatusTone(status: 'loading' | 'ready' | 'error', mutationStatus: 'idle' | 'working' | 'saved' | 'error') {
  if (status === 'error' || mutationStatus === 'error') {
    return 'status--error'
  }

  if (status === 'loading' || mutationStatus === 'working') {
    return 'status--idle'
  }

  return mutationStatus === 'saved' ? 'status--success' : 'status--idle'
}

export default function ReleaseChangeHistoryPanel() {
  const {
    auditTrail,
    headlineDraft,
    latestEntry,
    message,
    mutationStatus,
    record,
    saveDraft,
    simulateTeammateChange,
    status,
    summaryDraft,
    undoLatestChange,
    updateHeadlineDraft,
    updateSummaryDraft,
  } = useReleaseChangeHistory()

  return (
    <div className="release-change-history">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release audit history and undo</h3>
      </div>

      <p className="section-copy">
        This tenth feature slice adds attribution and undo support. Every saved change records who made it and why, and
        the latest revision can be rolled back from the audit history instead of forcing the user to reconstruct it by hand.
      </p>

      <div className="release-change-history__summary">
        <article className="sample-card">
          <p className="eyebrow">Current revision</p>
          <h4>{record?.revision ?? 'Loading'}</h4>
          <p>{record ? `${record.updatedBy} at ${record.updatedAt}` : 'Waiting for release history'}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Latest audit entry</p>
          <h4>{latestEntry?.actor ?? 'None yet'}</h4>
          <p>{latestEntry?.reason ?? 'No changes recorded yet'}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === 'loading'
          ? 'Loading release history workspace...'
          : message ?? 'Save a draft, simulate a teammate change, then use undo to roll back the most recent revision.'}
      </div>

      {record ? (
        <div className="release-change-history__grid">
          <section className="sample-card release-change-history__panel" aria-label="Release draft with history">
            <div className="section-heading">
              <p className="eyebrow">Draft editor</p>
              <h4>Release copy</h4>
            </div>

            <label className="field">
              <span>Headline</span>
              <input aria-label="History headline" value={headlineDraft} onChange={(event) => updateHeadlineDraft(event.target.value)} />
            </label>

            <label className="field">
              <span>Summary</span>
              <textarea
                aria-label="History summary"
                rows={7}
                value={summaryDraft}
                onChange={(event) => updateSummaryDraft(event.target.value)}
              />
            </label>

            <div className="release-change-history__actions">
              <button type="button" className="secondary-button" onClick={saveDraft}>
                Save draft
              </button>
              <button type="button" className="secondary-button" onClick={simulateTeammateChange}>
                Simulate teammate change
              </button>
              <button type="button" className="primary-button" disabled={auditTrail.length < 2} onClick={undoLatestChange}>
                Undo latest change
              </button>
            </div>
          </section>

          <section className="sample-card release-change-history__panel" aria-label="Audit trail">
            <div className="section-heading">
              <p className="eyebrow">Audit trail</p>
              <h4>Recent changes</h4>
            </div>

            <div className="release-change-history__audit-list">
              {auditTrail.map((entry) => (
                <article key={entry.id} className="release-change-history__audit-card">
                  <strong>{entry.actor}</strong>
                  <p>{`${entry.reason} - revision ${entry.revision}`}</p>
                  <span>{entry.timestamp}</span>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}
