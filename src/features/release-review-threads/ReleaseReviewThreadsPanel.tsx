import { useReleaseReviewThreads } from './useReleaseReviewThreads'

function getStatusTone(status: 'loading' | 'ready' | 'error', mutationStatus: 'idle' | 'working' | 'saved' | 'error') {
  if (status === 'error' || mutationStatus === 'error') {
    return 'status--error'
  }

  if (status === 'loading' || mutationStatus === 'working') {
    return 'status--idle'
  }

  return mutationStatus === 'saved' ? 'status--success' : 'status--idle'
}

export default function ReleaseReviewThreadsPanel() {
  const {
    approvedCount,
    approvals,
    canPublish,
    draftSummary,
    message,
    mutationStatus,
    openThreads,
    publish,
    record,
    requestReviewerFeedback,
    resolveFirstThread,
    saveDraft,
    status,
    threads,
    updateDraftSummary,
    approveReviewer,
  } = useReleaseReviewThreads()

  return (
    <div className="release-review-threads">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release review threads and approvals</h3>
      </div>

      <p className="section-copy">
        This eighth feature slice models collaborative review after the draft itself exists: reviewers leave blocking
        comment threads, approvals can move backwards when feedback arrives, and publish stays blocked until the review
        lane is clear.
      </p>

      <div className="release-review-threads__summary">
        <article className="sample-card">
          <p className="eyebrow">Open threads</p>
          <h4>{openThreads.length}</h4>
          <p>{record?.title ?? 'Waiting for review workspace'}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Approvals</p>
          <h4>{`${approvedCount}/${approvals.length}`}</h4>
          <p>{record ? `${record.stage} revision ${record.revision}` : 'No revision loaded yet'}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === 'loading'
          ? 'Loading review workspace...'
          : message ?? 'Save the draft, simulate reviewer feedback, then resolve threads and approvals before publishing.'}
      </div>

      {record ? (
        <div className="release-review-threads__grid">
          <section className="sample-card release-review-threads__panel" aria-label="Review draft">
            <div className="section-heading">
              <p className="eyebrow">Draft under review</p>
              <h4>Customer update draft</h4>
            </div>

            <p>{`${record.audience} - ${record.updatedBy}`}</p>

            <label className="field">
              <span>Draft summary</span>
              <textarea
                aria-label="Draft summary"
                rows={7}
                value={draftSummary}
                onChange={(event) => updateDraftSummary(event.target.value)}
              />
            </label>

            <div className="release-review-threads__actions">
              <button type="button" className="secondary-button" onClick={saveDraft}>
                Save draft
              </button>
              <button type="button" className="secondary-button" onClick={requestReviewerFeedback}>
                Simulate legal review
              </button>
              <button type="button" className="secondary-button" disabled={openThreads.length === 0} onClick={resolveFirstThread}>
                Resolve first thread
              </button>
              <button type="button" className="primary-button" disabled={!canPublish} onClick={publish}>
                Publish candidate
              </button>
            </div>
          </section>

          <section className="sample-card release-review-threads__panel" aria-label="Review workflow">
            <div className="section-heading">
              <p className="eyebrow">Threads and approvals</p>
              <h4>Reviewer workflow</h4>
            </div>

            <div className="release-review-threads__thread-list">
              {threads.length > 0 ? (
                threads.map((thread) => (
                  <article key={thread.id} className="release-review-threads__thread-card">
                    <strong>{thread.author}</strong>
                    <p>{`${thread.role} - ${thread.status}`}</p>
                    <span>{thread.comment}</span>
                  </article>
                ))
              ) : (
                <div className="empty-state">No review threads yet.</div>
              )}
            </div>

            <div className="release-review-threads__approval-list">
              {approvals.map((approval) => (
                <article key={approval.id} className="release-review-threads__approval-card">
                  <div>
                    <strong>{approval.name}</strong>
                    <p>{`${approval.role} - ${approval.status}`}</p>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={approval.status === 'approved'}
                    onClick={() => approveReviewer(approval.id, approval.role)}
                  >
                    {approval.status === 'approved' ? 'Approved' : `Approve ${approval.role}`}
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}