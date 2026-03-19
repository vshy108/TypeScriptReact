import {
  Fragment,
  createContext,
  useContext,
  useId,
  useState,
  type CSSProperties,
  type PropsWithChildren,
} from 'react'

type ThemeName = 'sunrise' | 'midnight' | 'grove'
type FeatureFlag = 'showTexture' | 'showTelemetry'

interface ThemeTokens {
  readonly background: string
  readonly panel: string
  readonly ink: string
  readonly muted: string
  readonly accent: string
  readonly ring: string
}

interface ThemeContextValue {
  readonly theme: ThemeName
  readonly tokens: ThemeTokens
  readonly setTheme: (theme: ThemeName) => void
  readonly cycleTheme: () => void
}

interface FeatureFlagsContextValue {
  readonly showTexture: boolean
  readonly showTelemetry: boolean
  readonly toggleFlag: (flag: FeatureFlag) => void
}

const themeTokens = {
  sunrise: {
    background: '#fff3df',
    panel: '#fffaf3',
    ink: '#2b1d12',
    muted: '#7f6654',
    accent: '#c25e28',
    ring: '#f0c59f',
  },
  midnight: {
    background: '#162133',
    panel: '#1f2c43',
    ink: '#eef5ff',
    muted: '#a4b8d7',
    accent: '#79b8ff',
    ring: '#304a72',
  },
  grove: {
    background: '#e8f3e5',
    panel: '#f6fbf3',
    ink: '#1f301d',
    muted: '#5d7357',
    accent: '#438357',
    ring: '#bfd8bb',
  },
} as const satisfies Record<ThemeName, ThemeTokens>

const themeOrder = ['sunrise', 'midnight', 'grove'] as const satisfies readonly ThemeName[]

const ThemeContext = createContext<ThemeContextValue | null>(null)
const FeatureFlagsContext = createContext<FeatureFlagsContextValue | null>(null)

// React 19 lets the context object itself act as the provider, which keeps setup compact.
function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<ThemeName>('sunrise')

  function cycleTheme() {
    const currentIndex = themeOrder.indexOf(theme)
    const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length] ?? themeOrder[0]
    setTheme(nextTheme)
  }

  return (
    <ThemeContext
      value={{
        theme,
        tokens: themeTokens[theme],
        setTheme,
        cycleTheme,
      }}
    >
      {children}
    </ThemeContext>
  )
}

function FeatureFlagsProvider({ children }: PropsWithChildren) {
  const [flags, setFlags] = useState({
    showTexture: true,
    showTelemetry: true,
  })

  function toggleFlag(flag: FeatureFlag) {
    setFlags((current) => ({
      ...current,
      [flag]: !current[flag],
    }))
  }

  return (
    <FeatureFlagsContext
      value={{
        ...flags,
        toggleFlag,
      }}
    >
      {children}
    </FeatureFlagsContext>
  )
}

function useThemeContext() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useThemeContext must be used inside ThemeProvider.')
  }

  return context
}

function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext)

  if (!context) {
    throw new Error('useFeatureFlags must be used inside FeatureFlagsProvider.')
  }

  return context
}

function ThemeToolbar() {
  const textureId = useId()
  const telemetryId = useId()
  const { theme, setTheme, cycleTheme } = useThemeContext()
  const { showTelemetry, showTexture, toggleFlag } = useFeatureFlags()

  return (
    <div className="context-toolbar">
      <div className="context-toolbar__group">
        <span>Theme</span>
        <div className="filter-row">
          {themeOrder.map((themeOption) => (
            <button
              key={themeOption}
              type="button"
              className={`filter-button ${theme === themeOption ? 'is-selected' : ''}`}
              aria-pressed={theme === themeOption}
              onClick={() => setTheme(themeOption)}
            >
              {themeOption}
            </button>
          ))}
          <button type="button" className="secondary-button" onClick={cycleTheme}>
            Cycle theme
          </button>
        </div>
      </div>

      <div className="context-toolbar__group">
        <span>Feature flags</span>
        <div className="context-flags">
          <label htmlFor={textureId}>
            <input
              id={textureId}
              type="checkbox"
              checked={showTexture}
              onChange={() => toggleFlag('showTexture')}
            />
            Texture overlay
          </label>
          <label htmlFor={telemetryId}>
            <input
              id={telemetryId}
              type="checkbox"
              checked={showTelemetry}
              onChange={() => toggleFlag('showTelemetry')}
            />
            Telemetry card
          </label>
        </div>
      </div>
    </div>
  )
}

function ThemePreviewPanel() {
  const { theme, tokens } = useThemeContext()
  const { showTelemetry, showTexture } = useFeatureFlags()

  return (
    <section
      className={`context-preview ${showTexture ? 'context-preview--textured' : ''}`}
      style={
        {
          '--context-background': tokens.background,
          '--context-panel': tokens.panel,
          '--context-ink': tokens.ink,
          '--context-muted': tokens.muted,
          '--context-accent': tokens.accent,
          '--context-ring': tokens.ring,
        } as CSSProperties
      }
    >
      <div className="context-preview__hero">
        <p className="eyebrow">Provider output</p>
        <h3>{theme} theme</h3>
        <p>
          The preview reads both contexts through custom hooks, so the tree only needs one set of
          provider definitions.
        </p>
      </div>

      <dl className="context-token-grid">
        {Object.entries(tokens).map(([name, value]) => (
          <Fragment key={name}>
            <dt>{name}</dt>
            <dd>
              <span style={{ background: value }} />
              {value}
            </dd>
          </Fragment>
        ))}
      </dl>

      {showTelemetry ? (
        <div className="context-telemetry">
          <article>
            <span>Theme consumers</span>
            <strong>3 active widgets</strong>
          </article>
          <article>
            <span>Provider depth</span>
            <strong>ThemeProvider + FeatureFlagsProvider</strong>
          </article>
        </div>
      ) : null}
    </section>
  )
}

// This sample is intentionally self-contained so context behavior is isolated from the main lab.
export default function ContextThemeSample() {
  return (
    <ThemeProvider>
      <FeatureFlagsProvider>
        <div className="context-sample">
          <div className="section-heading">
            <p className="eyebrow">Implemented sample</p>
            <h3>Context and provider composition</h3>
          </div>

          <p className="section-copy">
            This sample focuses on <code>createContext</code>, <code>useContext</code>, and{' '}
            <code>Fragment</code>. It also shows React 19 provider shorthand, where the context
            object itself is rendered as the provider.
          </p>

          <ThemeToolbar />
          <ThemePreviewPanel />
        </div>
      </FeatureFlagsProvider>
    </ThemeProvider>
  )
}
