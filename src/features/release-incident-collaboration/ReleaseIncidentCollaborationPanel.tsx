import { useReleaseIncidentCollaboration } from './useReleaseIncidentCollaboration'

function getStatusTone(status: 'loading' | 'ready' | 'error', saveStatus: 'idle' | 'saving' | 'saved' | 'error', hasConflict: boolean) {
  if (status === 'error' || saveStatus === 'error' || hasConflict) {
    return 'status--error'
  }

  if (status === 'loading' || saveStatus === 'saving') {
    return 'status--idle'
  }

  return saveStatus === 'saved' ? 'status--success' : 'status--idle'
}

export default function ReleaseIncidentCollaborationPanel() {
  const {
    activeEditors,
    collaborators,
    draftSummary,
    hasConflict,
    message,
    reloadFromServer,
    save,
    saveStatus,
    serverRecord,
    simulateTeammateEdit,
    status,
    updateDraftSummary,
  } = useReleaseIncidentCollaboration()

  return (
    <div className="release-incident-collaboration">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release incident collaborative editing</h3>
      </div>

      <p className="section-copy">
        This seventh feature slice adds multi-actor presence to the earlier conflict flows. The shared draft shows who
        else is in the document, and saves stay conflict-aware when a teammate edits the incident update first.
      </p>

      <div className="release-incident-collaboration__summary">
        <article className="sample-card">
          <p className="eyebrow">Shared draft</p>
          <h4>{serverRecord?.revision ?? 'Loading'}</h4>
          <p>{serverRecord ? `${serverRecord.updatedBy} at ${serverRecord.updatedAt}` : 'Waiting for server data'}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Active editors</p>
          <h4>{activeEditors.length}</h4>
          <p>{serverRecord?.title ?? 'Collaborative incident workspace not loaded yet'}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, saveStatus, hasConflict)}`}>
        {status === 'loading'
          ? 'Loading collaborative incident workspace...'
          : message ??
            (hasConflict
              ? 'A teammate changed the shared incident draft while you were editing. Reload the latest version before saving again.'
              : 'Edit the shared draft, then simulate a teammate edit to see presence and conflict handling together.')}
      </div>

      {serverRecord ? (
        <div className="release-incident-collaboration__grid">
          <section className="sample-card release-incident-collaboration__panel" aria-label="Collaborative editor">
            <div className="section-heading">
              <p className="eyebrow">Collaborative editor</p>
              <h4>Incident update draft</h4>
            </div>

            <p>{`${serverRecord.audience} - revision ${serverRecord.revision}`}</p>

            <label className="field">
              <span>Shared incident summary</span>
              <textarea
                aria-label="Shared incident summary"
                rows={7}
                value={draftSummary}
                onChange={(event) => updateDraftSummary(event.target.value)}
              />
            </label>

            <div className="release-incident-collaboration__actions">
              <button type="button" className="secondary-button" onClick={simulateTeammateEdit}>
                Simulate teammate edit
              </button>
              <button type="button" className="secondary-button" disabled={!hasConflict} onClick={reloadFromServer}>
                Reload latest draft
              </button>
              <button type="button" className="primary-button" disabled={saveStatus === 'saving' || hasConflict} onClick={save}>
                {saveStatus === 'saving' ? 'Saving shared draft...' : 'Save shared draft'}
              </button>
            </div>
          </section>

          <section className="sample-card release-incident-collaboration__panel" aria-label="Collaborator presence">
            <div className="section-heading">
              <p className="eyebrow">Collaborator presence</p>
              <h4>Who else is here</h4>
            </div>

            <div className="release-incident-collaboration__presence-list">
              {collaborators.map((collaborator) => (
                <article key={collaborator.id} className="release-incident-collaboration__presence-card">
                  <strong>{collaborator.name}</strong>
                  <p>{collaborator.role}</p>
                  <span>{`${collaborator.status} - ${collaborator.lastSeen}`}</span>
                </article>
              ))}
            </div>

            <div className="detail-panel">
              <div className="detail-panel__body">
                <strong>{serverRecord.updatedBy}</strong>
                <p>{serverRecord.summary}</p>
                <p>{`Server revision ${serverRecord.revision} updated at ${serverRecord.updatedAt}`}</p>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}