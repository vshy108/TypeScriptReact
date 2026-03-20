// Memoization and render-control lab
// -----------------------------------
// This sample demonstrates memo(), useMemo(), useCallback(), Profiler, and useDebugValue.
// It shows which renders are avoided through memoization, where memoization genuinely
// helps (expensive roster derivation), and how useDebugValue surfaces custom labels
// in React DevTools for custom hooks.

import {
  Profiler,
  memo,
  useCallback,
  useDebugValue,
  useMemo,
  useRef,
  useState,
  type ProfilerOnRenderCallback,
} from 'react'

type LabFocus = 'UI Systems' | 'Data Viz' | 'Infra' | 'Operations'
type FocusFilter = LabFocus | 'All'
type SortMode = 'match' | 'alpha'
type LabMemberId = `member-${number}`
type ToneMode = 'calm' | 'signal'
type ProfileEntryId = `profile-${number}`

interface LabMember {
  readonly id: LabMemberId
  readonly name: string
  readonly focus: LabFocus
  readonly region: string
  readonly available: boolean
  readonly score: number
  readonly note: string
}

interface RankedLabMember extends LabMember {
  readonly matchScore: number
}

interface RosterSummary {
  readonly visibleCount: number
  readonly availableCount: number
  readonly averageScore: string
  readonly debugLabel: string
}

interface VisibleRosterResult {
  readonly visibleMembers: readonly RankedLabMember[]
  readonly summary: RosterSummary
}

interface ProfileEntry {
  readonly id: ProfileEntryId
  readonly phase: string
  readonly actualDuration: string
  readonly baseDuration: string
  readonly committedAt: string
}

interface MemoLabStageProps {
  readonly query: string
  readonly focusFilter: FocusFilter
  readonly sortMode: SortMode
  readonly onlyAvailable: boolean
  readonly selectedId: LabMemberId
  readonly roster: VisibleRosterResult
  readonly onQueryChange: (value: string) => void
  readonly onFocusChange: (value: FocusFilter) => void
  readonly onSortChange: (value: SortMode) => void
  readonly onOnlyAvailableChange: (value: boolean) => void
  readonly onSelectMember: (memberId: LabMemberId) => void
}

const focusOptions = ['All', 'UI Systems', 'Data Viz', 'Infra', 'Operations'] as const satisfies readonly FocusFilter[]

const labMembers = [
  {
    id: 'member-1',
    name: 'Lia Chen',
    focus: 'UI Systems',
    region: 'Singapore',
    available: true,
    score: 94,
    note: 'Owns the component library rollout and design-token migration.',
  },
  {
    id: 'member-2',
    name: 'Omar Singh',
    focus: 'Data Viz',
    region: 'Berlin',
    available: false,
    score: 88,
    note: 'Builds charting dashboards and performance budgets for analytics pages.',
  },
  {
    id: 'member-3',
    name: 'Aisha Tan',
    focus: 'Infra',
    region: 'Remote',
    available: true,
    score: 91,
    note: 'Maintains build caching, CI timings, and runtime error budgets.',
  },
  {
    id: 'member-4',
    name: 'Mateo Cruz',
    focus: 'Operations',
    region: 'Austin',
    available: true,
    score: 80,
    note: 'Coordinates releases, checklists, and launch handoffs across teams.',
  },
  {
    id: 'member-5',
    name: 'Priya Raman',
    focus: 'Infra',
    region: 'Kuala Lumpur',
    available: false,
    score: 90,
    note: 'Handles observability tooling and cross-region deployment recovery drills.',
  },
  {
    id: 'member-6',
    name: 'Elena Petrova',
    focus: 'UI Systems',
    region: 'Warsaw',
    available: true,
    score: 86,
    note: 'Drives motion design polish and component ergonomics for dense screens.',
  },
  {
    id: 'member-7',
    name: 'Noah Kim',
    focus: 'Data Viz',
    region: 'Seoul',
    available: true,
    score: 84,
    note: 'Explains experiment data through dashboards and narrative annotation layers.',
  },
  {
    id: 'member-8',
    name: 'Zara Holt',
    focus: 'Operations',
    region: 'Toronto',
    available: false,
    score: 82,
    note: 'Owns launch communications and stakeholder summaries.',
  },
] as const satisfies readonly LabMember[]

let nextProfileEntryNumber = 1

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

function createProfileEntry(
  phase: string,
  actualDuration: number,
  baseDuration: number,
): ProfileEntry {
  return {
    id: `profile-${nextProfileEntryNumber++}` as ProfileEntryId,
    phase,
    actualDuration: `${actualDuration.toFixed(1)} ms`,
    baseDuration: `${baseDuration.toFixed(1)} ms`,
    committedAt: formatTime(new Date()),
  }
}

// Simple additive scoring heuristic for roster ranking.
// Base score comes from the member's competency rating, availability adds a small
// bonus (+6), and each matching search term adds a larger boost (+12) so keyword
// relevance dominates the sort order over static attributes.
function buildMatchScore(member: LabMember, normalizedQuery: string) {
  const haystack = `${member.name} ${member.focus} ${member.region} ${member.note}`.toLowerCase()
  const terms = normalizedQuery.split(/\s+/).filter(Boolean)
  let score = member.score + (member.available ? 6 : 0)

  for (const term of terms) {
    if (haystack.includes(term)) {
      score += 12
    }
  }

  return score
}

// useMemo caches the expensive roster derivation, and useDebugValue adds a compact summary for React DevTools.
function useVisibleRoster(
  query: string,
  focusFilter: FocusFilter,
  onlyAvailable: boolean,
  sortMode: SortMode,
) {
  const normalizedQuery = query.trim().toLowerCase()

  const roster = useMemo<VisibleRosterResult>(() => {
    const visibleMembers = labMembers
      .filter((member) => (focusFilter === 'All' ? true : member.focus === focusFilter))
      .filter((member) => (onlyAvailable ? member.available : true))
      .filter((member) => {
        if (!normalizedQuery) {
          return true
        }

        const haystack = `${member.name} ${member.focus} ${member.region} ${member.note}`.toLowerCase()
        return haystack.includes(normalizedQuery)
      })
      .map((member) => ({
        ...member,
        matchScore: buildMatchScore(member, normalizedQuery),
      }))
      .sort((left, right) => {
        if (sortMode === 'alpha') {
          return left.name.localeCompare(right.name)
        }

        return right.matchScore - left.matchScore || left.name.localeCompare(right.name)
      })

    const availableCount = visibleMembers.filter((member) => member.available).length
    const totalScore = visibleMembers.reduce((sum, member) => sum + member.matchScore, 0)
    const debugLabel = `${visibleMembers.length} visible | focus=${focusFilter} | query=${normalizedQuery || 'all'}`

    return {
      visibleMembers,
      summary: {
        visibleCount: visibleMembers.length,
        availableCount,
        averageScore: visibleMembers.length ? (totalScore / visibleMembers.length).toFixed(1) : '0.0',
        debugLabel,
      },
    }
  }, [focusFilter, normalizedQuery, onlyAvailable, sortMode])

  // useDebugValue's second argument is a formatter function. React DevTools
  // only calls it when the hook panel is open, so the formatting work is
  // deferred until someone actually inspects the component.
  useDebugValue(
    {
      visibleCount: roster.summary.visibleCount,
      focusFilter,
      normalizedQuery: normalizedQuery || 'all',
      sortMode,
    },
    (value) =>
      `${value.visibleCount} visible | focus=${value.focusFilter} | query=${value.normalizedQuery} | sort=${value.sortMode}`,
  )

  return roster
}

// memo() wraps a function component with a shallow prop comparison.
// When the parent re-renders but this card's props haven't changed
// (same member ref, same isSelected, same onSelectMember callback),
// React skips rendering this subtree entirely.
// memo() is the modern replacement for PureComponent, which was a class-based component that
// implemented shouldComponentUpdate with a shallow prop comparison. memo() provides the same
// optimization for function components without requiring a class.
const MemoMemberCard = memo(function MemoMemberCard({
  member,
  isSelected,
  onSelectMember,
}: {
  readonly member: RankedLabMember
  readonly isSelected: boolean
  readonly onSelectMember: (memberId: LabMemberId) => void
}) {
  return (
    <article className={`memo-card ${isSelected ? 'is-selected' : ''}`}>
      <div className="memo-card__header">
        <div>
          <strong>{member.name}</strong>
          <p>{member.focus}</p>
        </div>
        <span className="chip">{member.matchScore}</span>
      </div>

      <p className="memo-card__note">{member.note}</p>

      <div className="sample-card__meta">
        <span>{member.region}</span>
        <span>{member.available ? 'Available' : 'Booked'}</span>
        <span>Base score {member.score}</span>
      </div>

      <button type="button" className="secondary-button" onClick={() => onSelectMember(member.id)}>
        {isSelected ? 'Selected' : 'Inspect member'}
      </button>
    </article>
  )
})

// memo also protects the larger stage shell so unrelated outer state can rerender without repainting the full lab.
const MemoLabStage = memo(function MemoLabStage({
  query,
  focusFilter,
  sortMode,
  onlyAvailable,
  selectedId,
  roster,
  onQueryChange,
  onFocusChange,
  onSortChange,
  onOnlyAvailableChange,
  onSelectMember,
}: MemoLabStageProps) {
  const selectedMember =
    roster.visibleMembers.find((member) => member.id === selectedId) ?? roster.visibleMembers[0] ?? null

  return (
    <div className="memo-shell">
      <div className="memo-toolbar">
        <div className="field">
          <label htmlFor="memo-query">Search roster</label>
          <input
            id="memo-query"
            type="text"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Filter by name, focus, region, or note"
          />
        </div>

        <div className="field">
          <label htmlFor="memo-focus">Focus</label>
          <select
            id="memo-focus"
            value={focusFilter}
            onChange={(event) => onFocusChange(event.target.value as FocusFilter)}
          >
            {focusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="memo-sort">Sort</label>
          <select id="memo-sort" value={sortMode} onChange={(event) => onSortChange(event.target.value as SortMode)}>
            <option value="match">Match score</option>
            <option value="alpha">Alphabetical</option>
          </select>
        </div>
      </div>

      <label className="memo-toggle">
        <input
          type="checkbox"
          checked={onlyAvailable}
          onChange={(event) => onOnlyAvailableChange(event.target.checked)}
        />
        Show only currently available teammates
      </label>

      <div className="memo-stats">
        <article className="memo-stat">
          <span>Visible members</span>
          <strong>{roster.summary.visibleCount}</strong>
        </article>
        <article className="memo-stat">
          <span>Available now</span>
          <strong>{roster.summary.availableCount}</strong>
        </article>
        <article className="memo-stat">
          <span>Average match</span>
          <strong>{roster.summary.averageScore}</strong>
        </article>
      </div>

      <div className="memo-layout">
        <div className="memo-grid">
          {roster.visibleMembers.length ? (
            roster.visibleMembers.map((member) => (
              <MemoMemberCard
                key={member.id}
                member={member}
                isSelected={selectedMember?.id === member.id}
                onSelectMember={onSelectMember}
              />
            ))
          ) : (
            <div className="empty-state">
              <strong>No members match the current filters.</strong>
              <p>Change the query, focus, or availability filter.</p>
            </div>
          )}
        </div>

        <aside className="memo-inspector">
          <div className="memo-inspector__section">
            <span className="eyebrow">Selected card</span>
            {selectedMember ? (
              <>
                <h4>{selectedMember.name}</h4>
                <p>{selectedMember.note}</p>
                <div className="sample-card__meta">
                  <span>{selectedMember.focus}</span>
                  <span>{selectedMember.region}</span>
                  <span>{selectedMember.available ? 'Available' : 'Booked'}</span>
                </div>
              </>
            ) : (
              <>
                <h4>No selection</h4>
                <p>Adjust the filters to bring at least one teammate back into the visible list.</p>
              </>
            )}
          </div>

          <div className="memo-inspector__section">
            <span className="eyebrow">DevTools label</span>
            <p>{roster.summary.debugLabel}</p>
            <p>
              <code>useDebugValue</code> exposes this same summary in React DevTools without adding
              more props to the component tree.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
})

export default function MemoLabSample() {
  const [query, setQuery] = useState('')
  const [focusFilter, setFocusFilter] = useState<FocusFilter>('All')
  const [sortMode, setSortMode] = useState<SortMode>('match')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [selectedId, setSelectedId] = useState<LabMemberId>(labMembers[0].id)
  const [toneMode, setToneMode] = useState<ToneMode>('calm')
  const [profileEntries, setProfileEntries] = useState<readonly ProfileEntry[]>([])
  const skipProfilerFeedbackRef = useRef(false)
  const roster = useVisibleRoster(query, focusFilter, onlyAvailable, sortMode)

  // useCallback keeps handler identities stable, which is what makes memoized children and Profiler output meaningful here.
  const handleSelectMember = useCallback((memberId: LabMemberId) => {
    setSelectedId(memberId)
  }, [])

  const handleProfilerRender = useCallback<ProfilerOnRenderCallback>(
    (_id, phase, actualDuration, baseDuration) => {
      // Ignore the commit caused by updating the profiler feed itself, or the callback would recurse into another log update.
      if (skipProfilerFeedbackRef.current) {
        skipProfilerFeedbackRef.current = false
        return
      }

      skipProfilerFeedbackRef.current = true
      setProfileEntries((currentEntries) => [
        createProfileEntry(phase, actualDuration, baseDuration),
        ...currentEntries,
      ].slice(0, 5))
    },
    [],
  )

  return (
    <div className="memo-sample">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Memoization and render-control lab</h3>
      </div>

      <p className="section-copy">
        This sample isolates <code>memo</code>, <code>useMemo</code>, <code>useCallback</code>,
        <code>Profiler</code>, and <code>useDebugValue</code>. The roster only recomputes when its
        real inputs change, and the profiler log makes those commits visible.
      </p>

      <div className={`memo-chrome memo-chrome--${toneMode}`}>
        <div>
          <span className="eyebrow">Outer shell</span>
          <strong>{toneMode === 'calm' ? 'Calm chrome' : 'Signal chrome'}</strong>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={() => setToneMode((currentTone) => (currentTone === 'calm' ? 'signal' : 'calm'))}
        >
          Toggle shell tone
        </button>
      </div>

      <p className="explorer-note">
        Toggling the shell tone rerenders this parent wrapper, but the profiled lab stage keeps the
        same props and can be skipped.
      </p>

      {/* Profiler measures commit timing for the subtree below so the sample can show which interactions actually rerender it. */}
      <Profiler id="memo-stage" onRender={handleProfilerRender}>
        <MemoLabStage
          query={query}
          focusFilter={focusFilter}
          sortMode={sortMode}
          onlyAvailable={onlyAvailable}
          selectedId={selectedId}
          roster={roster}
          onQueryChange={setQuery}
          onFocusChange={setFocusFilter}
          onSortChange={setSortMode}
          onOnlyAvailableChange={setOnlyAvailable}
          onSelectMember={handleSelectMember}
        />
      </Profiler>

      <div className="memo-feed">
        <article className="memo-feed__summary">
          <span>Recent profiler commits</span>
          <strong>{profileEntries.length}</strong>
          <p>These entries come from the nearest React <code>Profiler</code> boundary.</p>
        </article>

        <div className="memo-feed__list">
          {profileEntries.length ? (
            profileEntries.map((entry) => (
              <article key={entry.id} className="memo-feed__entry">
                <strong>{entry.phase}</strong>
                <div className="sample-card__meta">
                  <span>Actual {entry.actualDuration}</span>
                  <span>Base {entry.baseDuration}</span>
                  <span>{entry.committedAt}</span>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <strong>No profiler commits yet.</strong>
              <p>Type in the filters or select a card to generate profiler data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
