import { useReleaseScheduledPublish } from './useReleaseScheduledPublish'

function getStatusTone(status: 'loading' | 'ready' | 'error', mutationStatus: 'idle' | 'working' | 'saved' | 'error') {
  if (status === 'error' || mutationStatus === 'error') {
    return 'status--error'
  }

  if (status === 'loading' || mutationStatus === 'working') {
    return 'status--idle'
  }

  return mutationStatus === 'saved' ? 'status--success' : 'status--idle'
}

export default function ReleaseScheduledPublishPanel() {
  const { approvals, approvalsReady, canRollback, message, mutationStatus, approve, record, rollback, schedule, status } =
    useReleaseScheduledPublish()

  return (
    <div className="release-scheduled-publish">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release scheduled publish state</h3>
      </div>

      <p className="section-copy">
        This twelfth feature slice shows a release that cannot publish until approvals are complete, then runs a live
        countdown and exposes a short rollback window immediately after publication.
      </p>

      <div className="release-scheduled-publish__summary">
        <article className="sample-card">
          <p className="eyebrow">Stage</p>
          <h4>{record?.stage ?? 'Loading'}</h4>
          <p>{record ? `${record.updatedBy} at ${record.updatedAt}` : 'Waiting for schedule workspace'}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Timing</p>
          <h4>
            {record?.countdownSeconds !== null
              ? `${record?.countdownSeconds}s to publish`
              : record?.rollbackWindowSeconds !== null
                ? `${record?.rollbackWindowSeconds}s rollback window`
                : 'No active timer'}
          </h4>
          <p>{record?.headline ?? 'No headline yet'}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === 'loading'
          ? 'Loading scheduled publish workspace...'
          : message ?? 'Complete approvals, schedule the publish countdown, then use the rollback window if needed.'}
      </div>

      {record ? (
        <div className="release-scheduled-publish__grid">
          <section className="sample-card release-scheduled-publish__panel" aria-label="Approval workflow">
            <div className="section-heading">
              <p className="eyebrow">Approvals</p>
              <h4>Pre-publish gate</h4>
            </div>

            <div className="release-scheduled-publish__approval-list">
              {approvals.map((approval) => (
                <article key={approval.id} className="release-scheduled-publish__approval-card">
                  <div>
                    <strong>{approval.name}</strong>
                    <p>{`${approval.role} - ${approval.status}`}</p>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={approval.status === 'approved'}
                    onClick={() => approve(approval.id, approval.role)}
                  >
                    {approval.status === 'approved' ? 'Approved' : `Approve ${approval.role}`}
                  </button>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="primary-button"
              disabled={!approvalsReady || record.stage !== 'draft'}
              onClick={schedule}
            >
              {record.stage === 'draft' ? 'Schedule publish' : 'Publish already scheduled'}
            </button>
          </section>

          <section className="sample-card release-scheduled-publish__panel" aria-label="Publish timeline">
            <div className="section-heading">
              <p className="eyebrow">Publish timeline</p>
              <h4>Countdown and rollback</h4>
            </div>

            <div className="detail-panel">
              <div className="detail-panel__body">
                <strong>{record.headline}</strong>
                <p>{`Stage: ${record.stage}`}</p>
                <p>
                  {record.countdownSeconds !== null
                    ? `Countdown running: ${record.countdownSeconds} seconds remaining.`
                    : record.rollbackWindowSeconds !== null
                      ? `Rollback window open for ${record.rollbackWindowSeconds} more seconds.`
                      : 'No active countdown.'}
                </p>
              </div>
            </div>

            <button type="button" className="secondary-button" disabled={!canRollback} onClick={rollback}>
              {canRollback ? 'Rollback published release' : 'Rollback unavailable'}
            </button>
          </section>
        </div>
      ) : null}
    </div>
  )
}
