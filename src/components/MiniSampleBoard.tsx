import { useState } from 'react'
import {
  miniSampleCatalog,
  sampleStatusMeta,
  sampleSurfaceLabels,
  sampleTopics,
} from '../sampleCatalog'
import { toSampleHash } from '../sampleRuntime'

function countByStatus(status: keyof typeof sampleStatusMeta) {
  // Summary counts are derived from the catalog at render time so the board cannot drift out of sync
  // with the actual sample registry when statuses change.
  return miniSampleCatalog.filter((sample) => sample.status === status).length
}

export default function MiniSampleBoard() {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <section className="surface surface--compact">
      <div className="sample-board__header">
        <div className="section-heading">
          <p className="eyebrow">Isolated mini-samples</p>
          <h2>Backlog split into focused implementation slices</h2>
        </div>

        <button
          type="button"
          className="secondary-button sample-board__toggle"
          aria-expanded={isExpanded}
          aria-controls="sample-board-content"
          onClick={() => {
            setIsExpanded((current) => !current)
          }}
        >
          {isExpanded ? 'Hide samples' : 'Show samples'}
        </button>
      </div>

      <p className="section-copy">
        The current lab keeps related client-side APIs together. Everything else is grouped into
        isolated mini-samples so portals, hydration, SSR, and declaration authoring can be built
        without polluting the main example.
      </p>

      {isExpanded ? (
        <div id="sample-board-content">
          <div className="sample-summary">
            <article className="sample-stat">
              <span>Implemented</span>
              <strong>{countByStatus('implemented')}</strong>
            </article>
            <article className="sample-stat">
              <span>Planned next</span>
              <strong>{countByStatus('planned')}</strong>
            </article>
            <article className="sample-stat">
              <span>Deferred</span>
              <strong>{countByStatus('deferred')}</strong>
            </article>
          </div>

          <div className="sample-topic-list">
            {sampleTopics.map((topic) => {
              // Grouping by topic first keeps the board readable as a learning map. A flat list would mix
              // React DOM, SSR, and TypeScript samples together and make implementation progress harder to scan.
              const samples = miniSampleCatalog.filter((sample) => sample.topic === topic)

              return (
                <section key={topic} className="sample-topic">
                  <header className="sample-topic__header">
                    <h3>{topic}</h3>
                    <span>{samples.length} samples</span>
                  </header>

                  <div className="sample-cards">
                    {samples.map((sample) => {
                      const statusMeta = sampleStatusMeta[sample.status]

                      return (
                        <article key={sample.id} className="sample-card">
                          <div className="sample-card__header">
                            <div>
                              <strong>{sample.title}</strong>
                              <code>{sample.id}</code>
                            </div>
                            <span className={`sample-badge sample-badge--${statusMeta.tone}`}>
                              {statusMeta.label}
                            </span>
                          </div>

                          <p>{sample.summary}</p>

                          <div className="sample-card__meta">
                            <span>{sampleSurfaceLabels[sample.surface]}</span>
                            <span>{sample.apis.length} APIs/topics</span>
                          </div>

                          <div className="sample-card__apis">
                            {sample.apis.map((api) => (
                              <span key={api} className="chip">
                                {api}
                              </span>
                            ))}
                          </div>

                          <p className="sample-card__why">{sample.whyIsolated}</p>

                          <div className="sample-card__actions">
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() => {
                                window.location.hash = toSampleHash(sample.id)
                                setIsExpanded(false)
                              }}
                            >
                              {sample.status === 'implemented' ? 'Open sample' : 'Open slot'}
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      ) : (
        <p className="sample-board__collapsed-note">
          Sample board hidden so the stage stays in view. Use “Show samples” to browse again.
        </p>
      )}
    </section>
  )
}
