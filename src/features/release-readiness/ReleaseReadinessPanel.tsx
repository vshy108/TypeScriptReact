import { useMemo, useState } from 'react'
import { useReleaseReadiness } from './useReleaseReadiness'
import type { ApprovalStatus, RiskSeverity } from './types'

const approvalStatusLabels = {
  approved: 'Approved',
  pending: 'Pending',
  blocked: 'Blocked',
} as const satisfies Record<ApprovalStatus, string>

const riskSeverityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
} as const satisfies Record<RiskSeverity, string>

const stageLabels = {
  qa: 'QA',
  approval: 'Approval',
  'rolling-out': 'Rolling out',
  paused: 'Paused',
} as const

function getStatusTone(status: 'loading' | 'ready' | 'error', isRefreshing: boolean) {
  if (status === 'error') {
    return 'status--error'
  }

  if (status === 'loading' || isRefreshing) {
    return 'status--idle'
  }

  return 'status--success'
}

export default function ReleaseReadinessPanel() {
  const { errorMessage, isRefreshing, lastLoadedAt, refresh, releaseOptions, revision, selectedRelease, selectRelease, status } =
    useReleaseReadiness()
  const [showOnlyOpenRisks, setShowOnlyOpenRisks] = useState(true)

  const visibleRisks = useMemo(() => {
    if (!selectedRelease) {
      return []
    }

    return selectedRelease.risks.filter((risk) => (showOnlyOpenRisks ? risk.open : true))
  }, [selectedRelease, showOnlyOpenRisks])

  const approvedCount = selectedRelease?.approvals.filter((approval) => approval.status === 'approved').length ?? 0
  const openRiskCount = selectedRelease?.risks.filter((risk) => risk.open).length ?? 0
  const buildHealthLabel = selectedRelease
    ? `${selectedRelease.buildHealth.passed}/${selectedRelease.buildHealth.total} checks passing`
    : 'Waiting for data'

  return (
    <div className="release-readiness">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Release readiness feature slice</h3>
      </div>

      <p className="section-copy">
        This is the first small real-world feature slice in the repo: a typed API client feeds a custom hook,
        which drives a focused panel component and an integration test.
      </p>

      <div className="release-readiness__toolbar surface surface--compact">
        <label className="field">
          <span>Active release</span>
          <select
            aria-label="Active release"
            disabled={!releaseOptions.length || status === 'loading'}
            value={selectedRelease?.id ?? ''}
            onChange={(event) => {
              selectRelease(event.target.value as (typeof releaseOptions)[number]['id'])
            }}
          >
            {releaseOptions.map((release) => (
              <option key={release.id} value={release.id}>
                {`${release.name} - ${release.channel} - ${stageLabels[release.stage]}`}
              </option>
            ))}
          </select>
        </label>

        <div className="release-readiness__actions">
          <button type="button" className="secondary-button" onClick={() => setShowOnlyOpenRisks((current) => !current)}>
            {showOnlyOpenRisks ? 'Show all risks' : 'Show open risks'}
          </button>
          <button type="button" className="primary-button" disabled={status === 'loading' || isRefreshing} onClick={refresh}>
            {isRefreshing ? 'Refreshing snapshot...' : 'Refresh snapshot'}
          </button>
        </div>
      </div>

      <div className={`status ${getStatusTone(status, isRefreshing)}`}>
        {errorMessage
          ? errorMessage
          : status === 'loading'
            ? 'Loading release readiness snapshot...'
            : `Snapshot revision: ${revision ?? 'n/a'}${lastLoadedAt ? ` - loaded at ${lastLoadedAt}` : ''}`}
      </div>

      {selectedRelease ? (
        <>
          <div className="release-readiness__summary">
            <article className="sample-card">
              <p className="eyebrow">Owner</p>
              <h4>{selectedRelease.owner}</h4>
              <p>{selectedRelease.name}</p>
            </article>

            <article className="sample-card">
              <p className="eyebrow">Stage</p>
              <h4>{stageLabels[selectedRelease.stage]}</h4>
              <p>{`${selectedRelease.channel} channel at ${selectedRelease.rolloutPercent}% rollout`}</p>
            </article>

            <article className="sample-card">
              <p className="eyebrow">Approvals</p>
              <h4>{approvedCount} approved</h4>
              <p>{`${selectedRelease.approvals.length - approvedCount} still need action`}</p>
            </article>

            <article className="sample-card">
              <p className="eyebrow">Build health</p>
              <h4>{buildHealthLabel}</h4>
              <p>{`${openRiskCount} open risk${openRiskCount === 1 ? '' : 's'} tracked`}</p>
            </article>
          </div>

          <div className="release-readiness__details">
            <section className="sample-card release-readiness__card" aria-label="Approval checklist">
              <div className="section-heading">
                <p className="eyebrow">Approvals</p>
                <h4>Approval checklist</h4>
              </div>
              <ul className="release-readiness__list">
                {selectedRelease.approvals.map((approval) => (
                  <li key={approval.id} className="release-readiness__item">
                    <div>
                      <strong>{approval.label}</strong>
                      <p>{`${approval.owner} - ${approval.note}`}</p>
                    </div>
                    <span className="pill">{approvalStatusLabels[approval.status]}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="sample-card release-readiness__card" aria-label="Release risks">
              <div className="section-heading">
                <p className="eyebrow">Risks</p>
                <h4>Release risks</h4>
              </div>
              <ul className="release-readiness__list">
                {visibleRisks.map((risk) => (
                  <li key={risk.id} className="release-readiness__item">
                    <div>
                      <strong>{risk.summary}</strong>
                      <p>{risk.mitigation}</p>
                    </div>
                    <span className="pill">{riskSeverityLabels[risk.severity]}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="sample-card release-readiness__card">
            <div className="section-heading">
              <p className="eyebrow">Notes</p>
              <h4>Architecture talking points</h4>
            </div>
            <ul className="release-readiness__list">
              <li className="release-readiness__item">
                <div>
                  <strong>Scheduled rollout</strong>
                  <p>{selectedRelease.scheduledAt}</p>
                </div>
              </li>
              {selectedRelease.notes.map((note) => (
                <li key={note} className="release-readiness__item">
                  <div>
                    <strong>Design note</strong>
                    <p>{note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </div>
  )
}
