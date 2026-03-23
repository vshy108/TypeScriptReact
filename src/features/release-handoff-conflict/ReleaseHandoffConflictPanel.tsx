import { useReleaseHandoffConflict } from './useReleaseHandoffConflict'

function getStatusTone(status: 'loading' | 'ready' | 'error', saveStatus: 'idle' | 'saving' | 'saved' | 'error', hasConflict: boolean) {
  if (status === 'error' || saveStatus === 'error' || hasConflict) {
    return 'status--error'
  }

  if (status === 'loading' || saveStatus === 'saving') {
    return 'status--idle'
  }

  return saveStatus === 'saved' ? 'status--success' : 'status--idle'
}

export default function ReleaseHandoffConflictPanel() {
  const {
    draftNote,
    hasConflict,
    message,
    reloadFromServer,
    save,
    saveStatus,
    serverRecord,
    status,
    triggerExternalUpdate,
    updateDraftNote,
  } = useReleaseHandoffConflict()

  return (
    <div className="release-handoff-conflict">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release handoff conflict resolution</h3>
      </div>

      <p className="section-copy">
        This fifth feature slice combines mutations with background refetching. The draft can drift from the polled
        server version, so the UI has to detect conflicts and let the user reload before saving again.
      </p>

      <div className="release-handoff-conflict__summary">
        <article className="sample-card">
          <p className="eyebrow">Server revision</p>
          <h4>{serverRecord?.revision ?? 'Loading'}</h4>
          <p>{serverRecord ? `${serverRecord.updatedBy} at ${serverRecord.updatedAt}` : 'Waiting for server data'}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Conflict state</p>
          <h4>{hasConflict ? 'Conflict detected' : 'No conflict'}</h4>
          <p>{serverRecord?.title ?? 'Handoff record not loaded yet'}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, saveStatus, hasConflict)}`}>
        {status === 'loading'
          ? 'Loading handoff workspace...'
          : message ??
            (hasConflict
              ? 'The server version changed while you were editing. Reload the latest version before saving again.'
              : 'Edit the draft, then simulate a server update to see the conflict flow.')}
      </div>

      {serverRecord ? (
        <div className="release-handoff-conflict__grid">
          <section className="sample-card release-handoff-conflict__editor" aria-label="Handoff editor">
            <div className="section-heading">
              <p className="eyebrow">Draft editor</p>
              <h4>Handoff editor</h4>
            </div>

            <p>{`${serverRecord.owner} - ${serverRecord.rolloutPercent}% rollout`}</p>

            <label className="field">
              <span>Draft handoff note</span>
              <textarea
                aria-label="Draft handoff note"
                rows={6}
                value={draftNote}
                onChange={(event) => updateDraftNote(event.target.value)}
              />
            </label>

            <div className="release-handoff-conflict__actions">
              <button type="button" className="secondary-button" onClick={triggerExternalUpdate}>
                Simulate external update
              </button>
              <button type="button" className="secondary-button" disabled={!hasConflict} onClick={reloadFromServer}>
                Reload server version
              </button>
              <button type="button" className="primary-button" disabled={saveStatus === 'saving' || hasConflict} onClick={save}>
                {saveStatus === 'saving' ? 'Saving handoff...' : 'Save handoff'}
              </button>
            </div>
          </section>

          <section className="sample-card release-handoff-conflict__editor" aria-label="Server version">
            <div className="section-heading">
              <p className="eyebrow">Server version</p>
              <h4>Latest polled note</h4>
            </div>

            <div className="detail-panel">
              <div className="detail-panel__body">
                <strong>{serverRecord.updatedBy}</strong>
                <p>{serverRecord.handoffNote}</p>
                <p>{`Revision ${serverRecord.revision} updated at ${serverRecord.updatedAt}`}</p>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}
