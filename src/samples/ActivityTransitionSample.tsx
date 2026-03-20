import { Activity, startTransition, useCallback, useDeferredValue, useState } from 'react'

type RegionId = `region-${number}`
type PriorityTier = 'critical' | 'standard' | 'background'
type ViewMode = 'dashboard' | 'detail'
type PanelVisibility = 'visible' | 'hidden'

interface OperatorRegion {
  readonly id: RegionId
  readonly name: string
  readonly tier: PriorityTier
  readonly activeIncidents: number
  readonly note: string
}

interface RegionDetail extends OperatorRegion {
  readonly inspectedAt: string
  readonly checklist: readonly string[]
}

// The tier determines which regions get <Activity mode="visible"> and which get mode="hidden".
// Hidden activities keep their state alive without rendering to the DOM, saving layout and paint cost.
const tierLabels = {
  critical: 'Critical',
  standard: 'Standard',
  background: 'Background',
} as const satisfies Record<PriorityTier, string>

const tierDescriptions = {
  critical: 'Always visible — these regions are never suspended by Activity.',
  standard: 'Visible by default, but hidden when the focus filter excludes them.',
  background: 'Hidden by default — Activity preserves React state while the subtree is off-screen.',
} as const satisfies Record<PriorityTier, string>

const operatorRegions = [
  {
    id: 'region-1',
    name: 'US-East production cluster',
    tier: 'critical',
    activeIncidents: 2,
    note: 'Primary customer-facing cluster. Always visible to the operator.',
  },
  {
    id: 'region-2',
    name: 'EU-West staging environment',
    tier: 'standard',
    activeIncidents: 0,
    note: 'Pre-release validation. Shown when the standard tier is included.',
  },
  {
    id: 'region-3',
    name: 'AP-South canary ring',
    tier: 'standard',
    activeIncidents: 1,
    note: 'Gradual rollout target. Tracks early-warning signals for the region.',
  },
  {
    id: 'region-4',
    name: 'Internal dev sandbox',
    tier: 'background',
    activeIncidents: 0,
    note: 'Developer playground. Hidden until explicitly requested by the operator.',
  },
  {
    id: 'region-5',
    name: 'Disaster recovery standby',
    tier: 'background',
    activeIncidents: 0,
    note: 'Cold standby site. Rarely inspected but keeps its last-known state in the background.',
  },
] as const satisfies readonly OperatorRegion[]

const regionDetails = new Map<RegionId, RegionDetail>(
  operatorRegions.map((region) => [
    region.id,
    {
      ...region,
      inspectedAt: '—',
      checklist: buildChecklist(region.tier),
    },
  ]),
)

function buildChecklist(tier: PriorityTier): readonly string[] {
  switch (tier) {
    case 'critical':
      return ['Verify uptime SLA', 'Confirm failover path', 'Review incident timeline']
    case 'standard':
      return ['Run smoke tests', 'Compare deploy diff', 'Check rollout percentage']
    case 'background':
      return ['Ping endpoint health', 'Validate backup snapshot']
  }
}

function formatNow() {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date())
}

function getRegionDetail(regionId: RegionId): RegionDetail {
  return regionDetails.get(regionId) ?? { ...operatorRegions[0], inspectedAt: '—', checklist: [] }
}

function resolvePanelVisibility(tier: PriorityTier, filter: PriorityTier | 'all'): PanelVisibility {
  // Critical regions are always visible regardless of the filter.
  if (tier === 'critical') return 'visible'

  // When the filter shows all tiers, everything is visible.
  if (filter === 'all') return 'visible'

  // Otherwise, only the selected tier is visible; the rest stay hidden.
  return tier === filter ? 'visible' : 'hidden'
}

function IncidentBadge({ count }: { readonly count: number }) {
  if (count === 0) return <span className="chip">Clear</span>
  return <span className="chip chip--warning">{count} active</span>
}

// This component renders inside an <Activity> boundary.
// When Activity mode is "hidden", React skips rendering but preserves state and refs.
// When it becomes "visible" again, React re-renders only the previously-hidden subtree.
function RegionCard({
  region,
  isSelected,
  onSelect,
}: {
  readonly region: OperatorRegion
  readonly isSelected: boolean
  readonly onSelect: (id: RegionId) => void
}) {
  return (
    <button
      type="button"
      className={`sample-card activity-region-card ${isSelected ? 'is-active' : ''}`}
      onClick={() => { onSelect(region.id) }}
      aria-pressed={isSelected}
    >
      <div className="activity-region-card__header">
        <strong>{region.name}</strong>
        <IncidentBadge count={region.activeIncidents} />
      </div>
      <p className="section-copy">{region.note}</p>
      <div className="sample-card__meta">
        <span>{tierLabels[region.tier]}</span>
        <span>{region.id}</span>
      </div>
    </button>
  )
}

function RegionDetailPanel({ regionId }: { readonly regionId: RegionId }) {
  const detail = getRegionDetail(regionId)

  return (
    <article className="sample-card activity-detail-panel">
      <div className="activity-detail-panel__header">
        <div>
          <p className="eyebrow">Region detail</p>
          <h4>{detail.name}</h4>
        </div>
        <span className="chip">{tierLabels[detail.tier]}</span>
      </div>
      <p className="section-copy">{detail.note}</p>
      <div className="sample-card__meta">
        <span>{detail.id}</span>
        <span>Incidents: {detail.activeIncidents}</span>
      </div>
      <ul className="summary-list">
        {detail.checklist.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  )
}

// The transition log captures how startTransition defers state updates outside of React event handlers.
// Each log entry records which transition fired and when.
type TransitionLogId = `tlog-${number}`

interface TransitionLogEntry {
  readonly id: TransitionLogId
  readonly action: string
  readonly firedAt: string
}

let nextLogNumber = 1

function createLogEntry(action: string): TransitionLogEntry {
  return {
    id: `tlog-${nextLogNumber++}`,
    action,
    firedAt: formatNow(),
  }
}

export default function ActivityTransitionSample() {
  const [tierFilter, setTierFilter] = useState<PriorityTier | 'all'>('all')
  const [view, setView] = useState<ViewMode>('dashboard')
  const [selectedRegionId, setSelectedRegionId] = useState<RegionId>(operatorRegions[0].id)
  const [transitionLog, setTransitionLog] = useState<readonly TransitionLogEntry[]>([])

  // useDeferredValue lets React finish the urgent state update (e.g. the filter chip highlight)
  // before re-rendering the region list with the new filter applied.
  const deferredFilter = useDeferredValue(tierFilter)

  const logTransition = useCallback((action: string) => {
    setTransitionLog((prev) => [createLogEntry(action), ...prev].slice(0, 6))
  }, [])

  // startTransition as a standalone API (not the hook version) allows scheduling low-priority
  // updates from anywhere — event handlers, callbacks, or module-level code — without needing
  // a component-scoped isPending flag. This is the key difference from useTransition.
  function handleFilterChange(nextFilter: PriorityTier | 'all') {
    setTierFilter(nextFilter)

    // The log update is intentionally wrapped in startTransition because it is non-urgent UI feedback.
    // React can batch and defer this update while the filter switch paints immediately.
    startTransition(() => {
      logTransition(`Filter changed → ${nextFilter === 'all' ? 'show all tiers' : tierLabels[nextFilter]}`)
    })
  }

  function handleViewToggle() {
    const nextView: ViewMode = view === 'dashboard' ? 'detail' : 'dashboard'
    setView(nextView)

    startTransition(() => {
      logTransition(`View switched → ${nextView}`)
    })
  }

  function handleRegionSelect(regionId: RegionId) {
    setSelectedRegionId(regionId)
    setView('detail')

    // startTransition wraps the log write so that the region selection and view change
    // commit at normal priority while the log append is deferred.
    startTransition(() => {
      logTransition(`Region selected → ${operatorRegions.find((r) => r.id === regionId)?.name ?? regionId}`)
    })
  }

  return (
    <section className="sample-section activity-transition-sample">
      <h3>Activity boundaries and standalone startTransition</h3>

      {/* Filter controls — selecting a tier determines which <Activity> panels are visible or hidden. */}
      <div className="activity-controls">
        <div className="activity-filter-strip" role="group" aria-label="Tier filter">
          {(['all', 'critical', 'standard', 'background'] as const).map((option) => (
            <button
              key={option}
              type="button"
              className={`chip ${tierFilter === option ? 'chip--active' : ''}`}
              onClick={() => { handleFilterChange(option) }}
              aria-pressed={tierFilter === option}
            >
              {option === 'all' ? 'All tiers' : tierLabels[option]}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={handleViewToggle}
        >
          {view === 'dashboard' ? 'Show detail view' : 'Back to dashboard'}
        </button>
      </div>

      {/* Tier legend — explains what each priority tier means for Activity visibility. */}
      <div className="activity-tier-legend">
        {(['critical', 'standard', 'background'] as const).map((tier) => (
          <div key={tier} className="activity-tier-legend__item">
            <strong>{tierLabels[tier]}</strong>
            <span>{tierDescriptions[tier]}</span>
          </div>
        ))}
      </div>

      {/*
        Each region panel is wrapped in <Activity mode={...}>.
        - mode="visible": the subtree renders normally and participates in layout.
        - mode="hidden": React keeps the component state alive but removes the subtree from
          the DOM, similar to content-visibility: hidden but with full React lifecycle awareness.
        This is useful for tabs, offscreen panels, or low-priority dashboard sections where
        preserving state avoids expensive re-mounts when the user toggles them back on.
      */}
      {view === 'dashboard' ? (
        <div className="activity-region-grid" role="list" aria-label="Operator regions">
          {operatorRegions.map((region) => {
            const panelMode = resolvePanelVisibility(region.tier, deferredFilter)

            return (
              <Activity key={region.id} mode={panelMode}>
                <div role="listitem">
                  <RegionCard
                    region={region}
                    isSelected={selectedRegionId === region.id}
                    onSelect={handleRegionSelect}
                  />
                </div>
              </Activity>
            )
          })}
        </div>
      ) : (
        <RegionDetailPanel regionId={selectedRegionId} />
      )}

      {/* Transition log — shows every startTransition call so the learner can see which updates were deferred. */}
      <div className="activity-log">
        <p className="eyebrow">startTransition log</p>
        {transitionLog.length === 0 ? (
          <p className="section-copy">
            No transitions recorded yet. Use the filter chips or select a region to trigger startTransition.
          </p>
        ) : (
          <ol className="activity-log__list">
            {transitionLog.map((entry) => (
              <li key={entry.id} className="activity-log__entry">
                <span className="activity-log__action">{entry.action}</span>
                <time className="activity-log__time">{entry.firedAt}</time>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}
