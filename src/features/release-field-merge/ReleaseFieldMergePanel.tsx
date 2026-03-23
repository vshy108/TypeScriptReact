import { useReleaseFieldMerge } from './useReleaseFieldMerge'

function getStatusTone(status: 'loading' | 'ready' | 'error', saveStatus: 'idle' | 'saving' | 'saved' | 'error', hasConflicts: boolean) {
  if (status === 'error' || saveStatus === 'error' || hasConflicts) {
    return 'status--error'
  }

  if (status === 'loading' || saveStatus === 'saving') {
    return 'status--idle'
  }

  return saveStatus === 'saved' ? 'status--success' : 'status--idle'
}

export default function ReleaseFieldMergePanel() {
  const {
    conflictFields,
    hasConflicts,
    headlineDraft,
    mergePreview,
    message,
    resolveConflict,
    save,
    saveStatus,
    serverRecord,
    status,
    summaryDraft,
    triggerServerUpdate,
    updateHeadlineDraft,
    updateSummaryDraft,
  } = useReleaseFieldMerge()

  return (
    <div className="release-field-merge">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release field-level merge resolution</h3>
      </div>

      <p className="section-copy">
        This ninth feature slice shows side-by-side conflict handling instead of full reload. Untouched fields can merge
        automatically, while overlapping fields stay blocked until you accept the server value or keep your local edit.
      </p>

      <div className="release-field-merge__summary">
        <article className="sample-card">
          <p className="eyebrow">Server revision</p>
          <h4>{mergePreview.revision}</h4>
          <p>{serverRecord ? `${serverRecord.updatedBy} at ${serverRecord.updatedAt}` : 'Waiting for server state'}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Conflicting fields</p>
          <h4>{conflictFields.length}</h4>
          <p>{serverRecord?.title ?? 'Merge workspace not loaded yet'}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, saveStatus, hasConflicts)}`}>
        {status === 'loading'
          ? 'Loading merge workspace...'
          : message ?? 'Edit the draft, simulate a teammate update, then resolve any overlapping fields before saving.'}
      </div>

      {serverRecord ? (
        <div className="release-field-merge__grid">
          <section className="sample-card release-field-merge__panel" aria-label="Merge editor">
            <div className="section-heading">
              <p className="eyebrow">Local draft</p>
              <h4>Merge editor</h4>
            </div>

            <label className="field">
              <span>Headline</span>
              <input aria-label="Headline draft" value={headlineDraft} onChange={(event) => updateHeadlineDraft(event.target.value)} />
            </label>

            <label className="field">
              <span>Summary</span>
              <textarea
                aria-label="Summary draft"
                rows={7}
                value={summaryDraft}
                onChange={(event) => updateSummaryDraft(event.target.value)}
              />
            </label>

            <div className="release-field-merge__actions">
              <button type="button" className="secondary-button" onClick={triggerServerUpdate}>
                Simulate teammate update
              </button>
              <button type="button" className="primary-button" disabled={saveStatus === 'saving' || hasConflicts} onClick={save}>
                {saveStatus === 'saving' ? 'Saving merged draft...' : 'Save merged draft'}
              </button>
            </div>
          </section>

          <section className="sample-card release-field-merge__panel" aria-label="Field conflicts">
            <div className="section-heading">
              <p className="eyebrow">Conflict resolution</p>
              <h4>Field-by-field view</h4>
            </div>

            {conflictFields.length > 0 ? (
              <div className="release-field-merge__conflicts">
                {conflictFields.map((conflict) => (
                  <article key={conflict.field} className="release-field-merge__conflict-card">
                    <strong>{conflict.field}</strong>
                    <p>{`Base: ${conflict.baseValue}`}</p>
                    <p>{`Local: ${conflict.localValue}`}</p>
                    <p>{`Server: ${conflict.serverValue}`}</p>
                    <div className="release-field-merge__actions">
                      <button type="button" className="secondary-button" onClick={() => resolveConflict(conflict.field, 'server')}>
                        Accept server {conflict.field}
                      </button>
                      <button type="button" className="secondary-button" onClick={() => resolveConflict(conflict.field, 'local')}>
                        Keep local {conflict.field}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="detail-panel">
                <div className="detail-panel__body">
                  <strong>No unresolved field conflicts</strong>
                  <p>Untouched fields were merged automatically, so you can save as soon as the draft looks correct.</p>
                </div>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  )
}
