import { Suspense, use, useState } from 'react'

type LaunchBriefId = `brief-${number}`

interface LaunchBriefTemplate {
  readonly id: LaunchBriefId
  readonly title: string
  readonly owner: string
  readonly summary: string
  readonly checklist: readonly string[]
  readonly etaMs: number
}

interface LoadedLaunchBrief extends LaunchBriefTemplate {
  readonly loadedAt: string
  readonly revision: number
}

const launchBriefs = [
  {
    id: 'brief-1',
    title: 'React DOM migration brief',
    owner: 'Platform systems',
    summary: 'Coordinate the rollout plan for new client APIs and update the reference playground.',
    checklist: ['Confirm browser support', 'Record fallback plan', 'Align release notes'],
    etaMs: 900,
  },
  {
    id: 'brief-2',
    title: 'Design token cleanup brief',
    owner: 'Design systems',
    summary: 'Review spacing tokens, collapse duplicates, and capture migration steps for app teams.',
    checklist: ['Export token diff', 'Tag breaking changes', 'Schedule design review'],
    etaMs: 1250,
  },
  {
    id: 'brief-3',
    title: 'Telemetry expansion brief',
    owner: 'Observability guild',
    summary: 'Define the next set of client signals and the dashboards needed for release health.',
    checklist: ['Name event owners', 'Add trace tags', 'Create weekly review cadence'],
    etaMs: 1050,
  },
] as const satisfies readonly LaunchBriefTemplate[]

const resourceCache = new Map<string, Promise<LoadedLaunchBrief>>()

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

function getCacheKey(briefId: LaunchBriefId, revision: number) {
  return `${briefId}:${revision}`
}

function findLaunchBrief(briefId: LaunchBriefId) {
  return launchBriefs.find((brief) => brief.id === briefId) ?? launchBriefs[0]
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

async function fetchLaunchBrief(briefId: LaunchBriefId, revision: number): Promise<LoadedLaunchBrief> {
  const brief = findLaunchBrief(briefId)
  await wait(brief.etaMs)

  return {
    ...brief,
    loadedAt: formatTime(new Date()),
    revision,
  }
}

function readLaunchBrief(briefId: LaunchBriefId, revision: number) {
  const cacheKey = getCacheKey(briefId, revision)
  const cachedPromise = resourceCache.get(cacheKey)

  if (cachedPromise) {
    return cachedPromise
  }

  const nextPromise = fetchLaunchBrief(briefId, revision)
  resourceCache.set(cacheKey, nextPromise)
  return nextPromise
}

function BriefPreview({
  resourcePromise,
}: {
  readonly resourcePromise: Promise<LoadedLaunchBrief>
}) {
  const brief = use(resourcePromise)

  return (
    <article className="resource-card">
      <div className="resource-card__header">
        <div>
          <p className="eyebrow">Resolved resource</p>
          <h4>{brief.title}</h4>
        </div>
        <span className="chip">Revision {brief.revision}</span>
      </div>

      <p className="section-copy">{brief.summary}</p>

      <div className="sample-card__meta">
        <span>{brief.owner}</span>
        <span>Loaded at {brief.loadedAt}</span>
        <span>ETA {brief.etaMs} ms</span>
      </div>

      <ul className="summary-list">
        {brief.checklist.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  )
}

function BriefFallback() {
  return (
    <article className="resource-card resource-card--fallback" aria-busy="true">
      <p className="eyebrow">Suspense fallback</p>
      <h4>Loading resource...</h4>
      <p className="section-copy">
        The preview is suspended on an unresolved promise. There is no manual loading flag in this
        component; <code>use()</code> reads the promise directly.
      </p>
    </article>
  )
}

export default function UseResourceSample() {
  const [activeId, setActiveId] = useState<LaunchBriefId>(launchBriefs[0].id)
  const [revision, setRevision] = useState(1)
  const [activityLog, setActivityLog] = useState<readonly string[]>([
    'Open a brief or warm one in advance to compare the Suspense behavior.',
  ])

  const activeResource = readLaunchBrief(activeId, revision)

  function warmBrief(briefId: LaunchBriefId) {
    void readLaunchBrief(briefId, revision)
    setActivityLog((currentLog) => [
      `${formatTime(new Date())} - Warmed ${briefId} for revision ${revision}.`,
      ...currentLog,
    ].slice(0, 5))
  }

  function refreshActiveBrief() {
    const nextRevision = revision + 1
    setRevision(nextRevision)
    setActivityLog((currentLog) => [
      `${formatTime(new Date())} - Requested fresh data for ${activeId} as revision ${nextRevision}.`,
      ...currentLog,
    ].slice(0, 5))
  }

  return (
    <div className="resource-sample">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Resource loading with use()</h3>
      </div>

      <p className="section-copy">
        This sample focuses on <code>use()</code> and <code>Suspense</code>. The preview component
        reads a cached promise directly from render, so the fallback boundary handles loading
        instead of a local spinner flag.
      </p>

      <div className="resource-toolbar">
        {launchBriefs.map((brief) => (
          <article key={brief.id} className="resource-toolbar__item">
            <button
              type="button"
              className={`filter-button ${activeId === brief.id ? 'is-selected' : ''}`}
              onClick={() => setActiveId(brief.id)}
              onMouseEnter={() => warmBrief(brief.id)}
            >
              {brief.title}
            </button>
            <button type="button" className="secondary-button" onClick={() => warmBrief(brief.id)}>
              Warm cache
            </button>
          </article>
        ))}
      </div>

      <div className="resource-summary">
        <article className="resource-stat">
          <span>Active brief</span>
          <strong>{activeId}</strong>
        </article>
        <article className="resource-stat">
          <span>Revision</span>
          <strong>{revision}</strong>
        </article>
        <article className="resource-stat">
          <span>Cached resources</span>
          <strong>{resourceCache.size}</strong>
        </article>
      </div>

      <div className="resource-grid">
        <Suspense fallback={<BriefFallback />}>
          <BriefPreview resourcePromise={activeResource} />
        </Suspense>

        <article className="resource-card resource-card--aside">
          <div className="resource-card__header">
            <div>
              <p className="eyebrow">Driver controls</p>
              <h4>Resource behavior</h4>
            </div>
            <button type="button" className="secondary-button" onClick={refreshActiveBrief}>
              Refresh active resource
            </button>
          </div>

          <p className="section-copy">
            Warming a brief primes the promise in the cache before it becomes active. Refreshing the
            active brief bumps the revision, which forces a new promise and makes the boundary
            suspend again.
          </p>

          <div className="resource-log">
            {activityLog.map((entry) => (
              <p key={entry}>{entry}</p>
            ))}
          </div>
        </article>
      </div>
    </div>
  )
}
