// Measured layout and synchronous effects
// ----------------------------------------
// This sample demonstrates the timing difference between three effect types:
//   useInsertionEffect — runs before DOM measurement, used to inject CSS rules.
//   useLayoutEffect    — runs after DOM mutation but before the browser paints.
//   useEffect          — runs after paint (passive / deferred).
// The visual result: the layout marker snaps into position without flicker
// because useLayoutEffect moves it before paint, while the passive marker
// updates visibly after paint for comparison.

import { useEffect, useInsertionEffect, useLayoutEffect, useRef, useState } from 'react'

type LayoutSignalId = `signal-${number}`
type AccentMode = 'cobalt' | 'copper' | 'grove'
type DensityMode = 'compact' | 'roomy'

interface LayoutSignal {
  readonly id: LayoutSignalId
  readonly label: string
  readonly detail: string
}

interface AccentTokens {
  readonly accent: string
  readonly accentSoft: string
  readonly panel: string
  readonly border: string
}

interface LayoutSnapshot {
  readonly label: string
  readonly width: number
  readonly offset: number
}

const layoutSignals = [
  {
    id: 'signal-1',
    label: 'Release window',
    detail: 'Track the launch window chip and keep the marker aligned before paint.',
  },
  {
    id: 'signal-2',
    label: 'Accessibility review',
    detail: 'Measure the selected chip after density changes without waiting for a passive effect.',
  },
  {
    id: 'signal-3',
    label: 'Perf regression triage',
    detail: 'Use the same DOM snapshot to compare a layout-timed marker against a passive one.',
  },
  {
    id: 'signal-4',
    label: 'API contract freeze',
    detail: 'Inject new palette and spacing rules through useInsertionEffect before measurement runs.',
  },
] as const satisfies readonly LayoutSignal[]

const accentTokens = {
  cobalt: {
    accent: '#1d57c2',
    accentSoft: 'rgba(29, 87, 194, 0.16)',
    panel: 'rgba(239, 244, 255, 0.82)',
    border: 'rgba(109, 145, 214, 0.35)',
  },
  copper: {
    accent: '#b35a26',
    accentSoft: 'rgba(179, 90, 38, 0.16)',
    panel: 'rgba(255, 245, 236, 0.84)',
    border: 'rgba(210, 152, 120, 0.35)',
  },
  grove: {
    accent: '#438357',
    accentSoft: 'rgba(67, 131, 87, 0.16)',
    panel: 'rgba(241, 249, 241, 0.84)',
    border: 'rgba(126, 179, 141, 0.34)',
  },
} as const satisfies Record<AccentMode, AccentTokens>

let nextLayoutScopeNumber = 1

// Build a scoped CSS block for the current accent palette and density mode.
// These rules are injected via useInsertionEffect before any layout measurement,
// so by the time useLayoutEffect reads element sizes the new styles are already active.
function createLayoutStyles(scopeClass: string, accent: AccentMode, density: DensityMode) {
  const tokens = accentTokens[accent]
  const paddingX = density === 'compact' ? '0.85rem' : '1.2rem'
  const paddingY = density === 'compact' ? '0.7rem' : '0.95rem'
  const titleSize = density === 'compact' ? '0.96rem' : '1.04rem'
  const detailSize = density === 'compact' ? '0.8rem' : '0.88rem'

  return `
.${scopeClass} {
  --layout-accent: ${tokens.accent};
  --layout-accent-soft: ${tokens.accentSoft};
  --layout-panel: ${tokens.panel};
  --layout-border: ${tokens.border};
}

.${scopeClass} .layout-effects-control,
.${scopeClass} .layout-effects-panel,
.${scopeClass} .layout-strip {
  background: var(--layout-panel);
  border-color: var(--layout-border);
}

.${scopeClass} .layout-option {
  padding: ${paddingY} ${paddingX};
}

.${scopeClass} .layout-option strong {
  font-size: ${titleSize};
}

.${scopeClass} .layout-option p {
  font-size: ${detailSize};
}

.${scopeClass} .layout-option.is-active {
  border-color: var(--layout-accent);
  box-shadow: 0 0 0 3px var(--layout-accent-soft);
}

.${scopeClass} .layout-marker--layout {
  background: var(--layout-accent);
}

.${scopeClass} .layout-marker--passive {
  border-bottom-color: var(--layout-accent);
}
`
}

// Measure the active chip's position relative to the strip container.
// Returns a snapshot with width and left offset for the marker overlay.
function readSnapshot(
  strip: HTMLDivElement | null,
  activeNode: HTMLButtonElement | null,
  label: string,
): LayoutSnapshot | null {
  if (!strip || !activeNode) {
    return null
  }

  const stripBox = strip.getBoundingClientRect()
  const activeBox = activeNode.getBoundingClientRect()

  return {
    label,
    width: Math.round(activeBox.width),
    offset: Math.round(activeBox.left - stripBox.left),
  }
}

// Position a marker element using CSS transforms to match a measured snapshot.
function applyMarker(marker: HTMLDivElement | null, snapshot: LayoutSnapshot | null) {
  if (!marker || !snapshot) {
    if (marker) {
      marker.style.opacity = '0'
    }
    return
  }

  marker.style.opacity = '1'
  marker.style.width = `${snapshot.width}px`
  marker.style.transform = `translateX(${snapshot.offset}px)`
}

function formatSnapshot(prefix: string, snapshot: LayoutSnapshot | null) {
  if (!snapshot) {
    return `${prefix}: waiting for an active chip.`
  }

  return `${prefix}: ${snapshot.label} measured ${snapshot.width}px wide at ${snapshot.offset}px from the left edge.`
}

function getChipNode(
  refs: Record<LayoutSignalId, HTMLButtonElement | null>,
  signalId: LayoutSignalId,
) {
  return refs[signalId] ?? null
}

export default function LayoutEffectsSample() {
  const [accent, setAccent] = useState<AccentMode>('cobalt')
  const [density, setDensity] = useState<DensityMode>('roomy')
  const [activeId, setActiveId] = useState<LayoutSignalId>(layoutSignals[1].id)
  const [scopeClass] = useState(() => `layout-scope-${nextLayoutScopeNumber++}`)
  const [styleElement] = useState<HTMLStyleElement | null>(() => {
    if (typeof document === 'undefined') {
      return null
    }

    return document.createElement('style')
  })
  const stripRef = useRef<HTMLDivElement>(null)
  const layoutMarkerRef = useRef<HTMLDivElement>(null)
  const passiveMarkerRef = useRef<HTMLDivElement>(null)
  const layoutNoteRef = useRef<HTMLParagraphElement>(null)
  const passiveNoteRef = useRef<HTMLParagraphElement>(null)
  const chipRefs = useRef<Record<LayoutSignalId, HTMLButtonElement | null>>({
    'signal-1': null,
    'signal-2': null,
    'signal-3': null,
    'signal-4': null,
  })

  const activeSignal = layoutSignals.find((signal) => signal.id === activeId) ?? layoutSignals[0]

  // CSS-in-JS libraries use useInsertionEffect for this exact phase: inject styles
  // before layout reads. The style element is appended to <head> and updated whenever
  // the accent or density changes, then removed on cleanup.
  useInsertionEffect(() => {
    if (!styleElement) {
      return
    }

    styleElement.textContent = createLayoutStyles(scopeClass, accent, density)
    document.head.appendChild(styleElement)

    return () => {
      styleElement.remove()
    }
  }, [accent, density, scopeClass, styleElement])

  // Measure the selected chip and move the primary marker before the browser paints.
  // Because this runs synchronously after DOM mutation, the marker never flickers.
  useLayoutEffect(() => {
    const snapshot = readSnapshot(stripRef.current, getChipNode(chipRefs.current, activeId), activeSignal.label)

    applyMarker(layoutMarkerRef.current, snapshot)

    if (layoutNoteRef.current) {
      layoutNoteRef.current.textContent = formatSnapshot('useLayoutEffect', snapshot)
    }
  }, [activeId, activeSignal.label, density])

  // A passive effect runs after paint, so this secondary marker updates with a visible
  // delay on fast machines. Compare the layout note vs passive note timestamps to see
  // the timing difference.
  useEffect(() => {
    const snapshot = readSnapshot(stripRef.current, getChipNode(chipRefs.current, activeId), activeSignal.label)

    applyMarker(passiveMarkerRef.current, snapshot)

    if (passiveNoteRef.current) {
      passiveNoteRef.current.textContent = formatSnapshot('useEffect', snapshot)
    }
  }, [activeId, activeSignal.label, density])

  useEffect(() => {
    function handleResize() {
      const snapshot = readSnapshot(stripRef.current, getChipNode(chipRefs.current, activeId), activeSignal.label)

      applyMarker(layoutMarkerRef.current, snapshot)
      applyMarker(passiveMarkerRef.current, snapshot)

      if (layoutNoteRef.current) {
        layoutNoteRef.current.textContent = formatSnapshot('useLayoutEffect', snapshot)
      }

      if (passiveNoteRef.current) {
        passiveNoteRef.current.textContent = formatSnapshot('useEffect', snapshot)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [activeId, activeSignal.label, density])

  return (
    <div className={`layout-effects-sample ${scopeClass}`}>
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Measured layout and synchronous effects</h3>
      </div>

      <p className="section-copy">
        This sample focuses on <code>useLayoutEffect</code> and <code>useInsertionEffect</code>.
        The selected chip is measured before paint, while a second marker intentionally waits for a
        passive effect so the timing difference is visible.
      </p>

      <div className="layout-effects-toolbar">
        <article className="layout-effects-control">
          <span>Accent palette</span>
          <div className="filter-row">
            {(['cobalt', 'copper', 'grove'] as const).map((accentOption) => (
              <button
                key={accentOption}
                type="button"
                className={`filter-button ${accent === accentOption ? 'is-selected' : ''}`}
                onClick={() => setAccent(accentOption)}
              >
                {accentOption}
              </button>
            ))}
          </div>
        </article>

        <article className="layout-effects-control">
          <span>Density</span>
          <div className="filter-row">
            {(['compact', 'roomy'] as const).map((densityOption) => (
              <button
                key={densityOption}
                type="button"
                className={`filter-button ${density === densityOption ? 'is-selected' : ''}`}
                onClick={() => setDensity(densityOption)}
              >
                {densityOption}
              </button>
            ))}
          </div>
        </article>
      </div>

      <div ref={stripRef} className="layout-strip">
        {layoutSignals.map((signal) => (
          <button
            key={signal.id}
            ref={(node) => {
              chipRefs.current[signal.id] = node
            }}
            type="button"
            className={`layout-option ${activeId === signal.id ? 'is-active' : ''}`}
            onClick={() => setActiveId(signal.id)}
          >
            <strong>{signal.label}</strong>
            <p>{signal.detail}</p>
          </button>
        ))}

        <div ref={layoutMarkerRef} className="layout-marker layout-marker--layout" aria-hidden="true" />
        <div ref={passiveMarkerRef} className="layout-marker layout-marker--passive" aria-hidden="true" />
      </div>

      <div className="layout-effects-grid">
        <article className="layout-effects-panel">
          <span className="eyebrow">Active chip</span>
          <h4>{activeSignal.label}</h4>
          <p>{activeSignal.detail}</p>
          <p>
            <code>useInsertionEffect</code> is currently injecting the <strong>{accent}</strong>{' '}
            palette with <strong>{density}</strong> spacing before the measurement step runs.
          </p>
        </article>

        <article className="layout-effects-panel">
          <span className="eyebrow">Timing contrast</span>
          <p ref={layoutNoteRef} className="layout-effects-observation">
            useLayoutEffect: waiting for measurement.
          </p>
          <p ref={passiveNoteRef} className="layout-effects-observation">
            useEffect: waiting for measurement.
          </p>
          <div className="layout-effects-legend">
            <span>
              <i className="layout-legend-swatch layout-legend-swatch--layout" />
              Layout-timed marker
            </span>
            <span>
              <i className="layout-legend-swatch layout-legend-swatch--passive" />
              Passive-effect marker
            </span>
          </div>
        </article>
      </div>
    </div>
  )
}
