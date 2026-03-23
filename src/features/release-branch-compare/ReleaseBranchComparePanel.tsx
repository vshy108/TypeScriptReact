import { useReleaseBranchCompare } from './useReleaseBranchCompare'

function getStatusTone(status: 'loading' | 'ready' | 'error', mutationStatus: 'idle' | 'working' | 'saved' | 'error') {
  if (status === 'error' || mutationStatus === 'error') {
    return 'status--error'
  }

  if (status === 'loading' || mutationStatus === 'working') {
    return 'status--idle'
  }

  return mutationStatus === 'saved' ? 'status--success' : 'status--idle'
}

export default function ReleaseBranchComparePanel() {
  const {
    activeBranch,
    alternateBranches,
    compareRows,
    message,
    mutationStatus,
    primaryBranch,
    promoteBranch,
    selectBranch,
    status,
  } = useReleaseBranchCompare()

  return (
    <div className="release-branch-compare">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release branch compare view</h3>
      </div>

      <p className="section-copy">
        This eleventh feature slice models branching drafts instead of one shared copy. You can compare an alternate
        messaging branch against the current primary draft and promote it when the wording is stronger.
      </p>

      <div className="release-branch-compare__summary">
        <article className="sample-card">
          <p className="eyebrow">Primary branch</p>
          <h4>{primaryBranch?.name ?? 'Loading'}</h4>
          <p>{primaryBranch ? `${primaryBranch.updatedBy} at ${primaryBranch.updatedAt}` : 'Waiting for branch workspace'}</p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Compared branch</p>
          <h4>{activeBranch?.name ?? 'Loading'}</h4>
          <p>{activeBranch ? `Revision ${activeBranch.revision}` : 'No branch selected yet'}</p>
        </article>
      </div>

      <div className={`status ${getStatusTone(status, mutationStatus)}`}>
        {status === 'loading'
          ? 'Loading branch compare workspace...'
          : message ?? 'Switch between branches to compare wording, then promote the stronger branch to primary.'}
      </div>

      {activeBranch && primaryBranch ? (
        <div className="release-branch-compare__grid">
          <section className="sample-card release-branch-compare__panel" aria-label="Branch selector">
            <div className="section-heading">
              <p className="eyebrow">Branch selector</p>
              <h4>Available drafts</h4>
            </div>

            <div className="release-branch-compare__branch-list">
              {[primaryBranch, ...alternateBranches.filter((branch) => branch.id !== primaryBranch.id)].map((branch) => (
                <button
                  key={branch.id}
                  type="button"
                  className={`feature-card ${branch.id === activeBranch.id ? 'is-active' : ''}`}
                  onClick={() => selectBranch(branch.id)}
                >
                  <span className="feature-card__category">{branch.kind}</span>
                  <strong>{branch.name}</strong>
                  <p>{branch.updatedBy}</p>
                </button>
              ))}
            </div>

            <button
              type="button"
              className="primary-button"
              disabled={activeBranch.kind === 'primary'}
              onClick={promoteBranch}
            >
              {activeBranch.kind === 'primary' ? 'Current primary branch' : 'Promote compared branch'}
            </button>
          </section>

          <section className="sample-card release-branch-compare__panel" aria-label="Compare view">
            <div className="section-heading">
              <p className="eyebrow">Compare view</p>
              <h4>Primary vs selected branch</h4>
            </div>

            <div className="release-branch-compare__compare-list">
              {compareRows.map((row) => (
                <article key={row.label} className="release-branch-compare__compare-card">
                  <strong>{row.label}</strong>
                  <p>{`Primary: ${row.primaryValue}`}</p>
                  <p>{`Selected: ${row.activeValue}`}</p>
                  <span>{row.differs ? 'Different wording' : 'Matches primary branch'}</span>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}
