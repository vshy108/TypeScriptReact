import { useEffect, useState } from 'react'
import {
  clientRenderedChecksum,
  hydrationMismatchFixes,
  initialMismatchLog,
  initialMismatchStatus,
  recoveredMismatchStatus,
} from './hydrationMismatchData'

interface HydrationMismatchPageProps {
  readonly renderedChecksum: string
}

export function HydrationMismatchPage({ renderedChecksum }: HydrationMismatchPageProps) {
  const [statusMessage, setStatusMessage] = useState(initialMismatchStatus)
  const [activityLog, setActivityLog] = useState<readonly string[]>(initialMismatchLog)
  const [acknowledged, setAcknowledged] = useState(false)

  useEffect(() => {
    const hydrationTick = window.setTimeout(() => {
      setStatusMessage(recoveredMismatchStatus)
      setActivityLog((currentLog) => [
        'React reported a recoverable hydration mismatch and patched the client text.',
        ...currentLog,
      ].slice(0, 4))
    }, 0)

    return () => {
      window.clearTimeout(hydrationTick)
    }
  }, [])

  function acknowledgeRecovery() {
    setAcknowledged(true)
    setActivityLog((currentLog) => {
      const nextEntry = 'Reviewed the mismatch recovery path from hydrated controls.'

      return currentLog.includes(nextEntry) ? currentLog : [nextEntry, ...currentLog].slice(0, 4)
    })
  }

  return (
    <div className="hydration-page">
      <header className="hydration-hero">
        <p className="eyebrow">Implemented sample</p>
        <h1>Hydration mismatch detection</h1>
        <p className="hydration-copy">
          This entry starts with one server-rendered text value that does not match the client tree.
          React reports the mismatch as recoverable, patches the text, and keeps the rest of the
          shell interactive.
        </p>

        <div className="hydration-meta">
          <span>Entry: /hydration-mismatch.html</span>
          <span>Root API: hydrateRoot()</span>
          <span>Mismatch: text content only</span>
        </div>
      </header>

      <main className="hydration-grid">
        <article className="hydration-card">
          <p className="eyebrow">Intentional mismatch</p>
          <h2>Server and client render different text</h2>
          <p className="section-copy">{statusMessage}</p>

          <div className="sample-card__meta">
            <span>Server shell rendered first</span>
            <span>React compares during hydration</span>
            <span>Recoverable text diff</span>
          </div>

          <section className="hydration-detail" aria-live="polite">
            <span>Render checksum</span>
            <code>{renderedChecksum}</code>
            <p>
              The checked-in HTML starts with a server checksum. The client tree intentionally reads
              a different checksum so the mismatch is easy to detect and verify.
            </p>
          </section>

          <div className="hydration-actions">
            <button type="button" className="primary-button" onClick={acknowledgeRecovery}>
              {acknowledged ? 'Recovery acknowledged' : 'Acknowledge recovery'}
            </button>
          </div>

          <div className="hydration-log">
            {activityLog.map((entry) => (
              <p key={entry}>{entry}</p>
            ))}
          </div>
        </article>

        <article className="hydration-card">
          <p className="eyebrow">Safer patterns</p>
          <h2>How to avoid real mismatches</h2>

          <ul className="summary-list">
            {hydrationMismatchFixes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </main>
    </div>
  )
}

export default function HydrationMismatchApp() {
  return <HydrationMismatchPage renderedChecksum={clientRenderedChecksum} />
}
