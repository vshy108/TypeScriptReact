import { useEffect, useState } from 'react'
import {
  findResourceHintPlan,
  hydratedStatus,
  initialHydrationLog,
  initialHydrationStatus,
  resourceHintPlans,
  type ResourceHintId,
} from './hydrationData'

function getNextHintId(currentId: ResourceHintId): ResourceHintId {
  const currentIndex = resourceHintPlans.findIndex((plan) => plan.id === currentId)
  const nextIndex = (currentIndex + 1) % resourceHintPlans.length
  return resourceHintPlans[nextIndex]?.id ?? resourceHintPlans[0].id
}

export default function HydrationHintsApp() {
  const [activeHintId, setActiveHintId] = useState<ResourceHintId>(resourceHintPlans[0].id)
  const [statusMessage, setStatusMessage] = useState(initialHydrationStatus)
  const [activityLog, setActivityLog] = useState<readonly string[]>(initialHydrationLog)

  useEffect(() => {
    const hydrationTick = window.setTimeout(() => {
      setStatusMessage(hydratedStatus)
      setActivityLog((currentLog) => [
        'hydrateRoot() preserved the server shell and attached event handlers.',
        ...currentLog,
      ])
    }, 0)

    return () => {
      window.clearTimeout(hydrationTick)
    }
  }, [])

  const activeHint = findResourceHintPlan(activeHintId)

  function focusNextHint() {
    const nextHintId = getNextHintId(activeHintId)
    const nextHint = findResourceHintPlan(nextHintId)
    setActiveHintId(nextHintId)
    setActivityLog((currentLog) => [`Focused ${nextHint.api} from the hydrated controls.`, ...currentLog].slice(0, 4))
  }

  function resetHintSelection() {
    setActiveHintId(resourceHintPlans[0].id)
    setActivityLog((currentLog) => [
      'Reset the explanation back to the first registered resource hint.',
      ...currentLog,
    ].slice(0, 4))
  }

  return (
    <div className="hydration-page">
      <header className="hydration-hero">
        <p className="eyebrow">Implemented sample</p>
        <h1>Hydration and resource hint APIs</h1>
        <p className="hydration-copy">
          This entry starts with matching HTML already on the page. The client registers network
          hints and then uses <code>hydrateRoot()</code> to attach React behavior without throwing
          the existing shell away.
        </p>

        <div className="hydration-meta">
          <span>Entry: /hydration.html</span>
          <span>Root API: hydrateRoot()</span>
          <span>Shell: static HTML matched to the React tree</span>
        </div>
      </header>

      <main className="hydration-grid">
        <article className="hydration-card">
          <p className="eyebrow">Hydration status</p>
          <h2>Server shell to interactive client</h2>
          <p className="section-copy">{statusMessage}</p>

          <div className="hydration-actions">
            <button type="button" className="primary-button" onClick={focusNextHint}>
              Focus next hint
            </button>
            <button type="button" className="secondary-button" onClick={resetHintSelection}>
              Reset selection
            </button>
          </div>

          <div className="hydration-log">
            {activityLog.map((entry) => (
              <p key={entry}>{entry}</p>
            ))}
          </div>
        </article>

        <article className="hydration-card">
          <p className="eyebrow">Registered hints</p>
          <h2>Network preparation plan</h2>

          <div className="hydration-hint-list">
            {resourceHintPlans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                className={plan.id === activeHintId ? 'hydration-hint-button is-selected' : 'hydration-hint-button'}
                onClick={() => setActiveHintId(plan.id)}
              >
                <strong>{plan.api}</strong>
                <span>{plan.target}</span>
              </button>
            ))}
          </div>

          <section className="hydration-detail" aria-live="polite">
            <span>{activeHint.api}</span>
            <code>{activeHint.target}</code>
            <p>{activeHint.summary}</p>
          </section>
        </article>
      </main>
    </div>
  )
}
