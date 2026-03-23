import { useState } from 'react'

type PluginId = `plugin-${number}`
type PluginCapability = 'rollout' | 'observability' | 'governance'
type PluginHealth = 'ready' | 'review' | 'blocked'

interface PluginRunResult {
  readonly health: PluginHealth
  readonly headline: string
  readonly tasks: readonly string[]
  readonly completionScore: number
}

interface PluginContract {
  readonly id: PluginId
  readonly title: string
  readonly owner: string
  readonly capability: PluginCapability
  run(): PluginRunResult
  describe(): string
}

interface Schedulable {
  readonly cadence: string
  readonly nextWindow: string
}

interface PluginSnapshot {
  readonly id: PluginId
  readonly title: string
  readonly owner: string
  readonly capability: PluginCapability
  readonly summary: string
}

// Intersection types merge independently useful contracts into one render model without inventing another giant interface.
// That keeps runtime classes focused on domain behavior while the UI consumes a smaller composed view model
// instead of depending on every field and method from the concrete plugin objects.
type PluginCardModel = PluginSnapshot &
  Schedulable & {
    readonly riskBand: string
  }

// This abstract class centralizes shared plugin behavior while forcing subclasses to supply cadence, windows, and run logic.
// An abstract class is the right fit here because the sample wants both shared runtime behavior
// (describe, risk-band logic, runbook helpers) and a compile-time contract for subclasses.
abstract class ReleasePlugin implements PluginContract, Schedulable {
  public readonly id: PluginId
  public readonly title: string
  public readonly owner: string
  public readonly capability: PluginCapability
  public abstract readonly cadence: string
  public abstract readonly nextWindow: string
  // runbook is protected because subclasses extend and reuse it when building results.
  protected readonly runbook: readonly string[]
  // baselineRisk stays private because callers and subclasses should use the derived public risk band,
  // not couple themselves to the internal numeric scoring rule.
  private readonly baselineRisk: number

  protected constructor(config: {
    readonly id: PluginId
    readonly title: string
    readonly owner: string
    readonly capability: PluginCapability
    readonly runbook: readonly string[]
    readonly baselineRisk: number
  }) {
    this.id = config.id
    this.title = config.title
    this.owner = config.owner
    this.capability = config.capability
    this.runbook = config.runbook
    this.baselineRisk = config.baselineRisk
  }

  public describe() {
    return `${this.title} covers ${this.capability} work for ${this.owner}.`
  }

  public toCardModel(): PluginCardModel {
    // The UI only needs a render-focused snapshot, not the full class instance. Converting here keeps
    // presentation code decoupled from the plugin internals and makes the sample's class layer reusable.
    return {
      id: this.id,
      title: this.title,
      owner: this.owner,
      capability: this.capability,
      summary: this.describe(),
      cadence: this.cadence,
      nextWindow: this.nextWindow,
      riskBand: this.readRiskBand(),
    }
  }

  public abstract run(): PluginRunResult

  // Protected helpers are reusable by subclasses but hidden from code that only holds the public plugin contract.
  protected buildHeadline(action: string) {
    return `${action} for ${this.capability} owned by ${this.owner}.`
  }

  private readRiskBand() {
    if (this.baselineRisk >= 80) {
      return 'High review load'
    }

    if (this.baselineRisk >= 55) {
      return 'Moderate review load'
    }

    return 'Stable operating range'
  }
}

// "implements" proves this concrete class satisfies both the abstract base API and the scheduling contract.
class RolloutCoordinator extends ReleasePlugin implements Schedulable {
  public readonly cadence = 'Hourly'
  public readonly nextWindow = '09:30 MYT'

  public constructor() {
    super({
      id: 'plugin-1',
      title: 'Rollout coordinator',
      owner: 'Design systems',
      capability: 'rollout',
      runbook: ['Verify beta cohort', 'Confirm rollback toggle', 'Post launch note'],
      baselineRisk: 48,
    })
  }

  public run(): PluginRunResult {
    return {
      health: 'ready',
      headline: this.buildHeadline('Promote the token rollout'),
      tasks: [...this.runbook, 'Check visual regression snapshot'],
      completionScore: 94,
    }
  }
}

class ObservabilityGuardian extends ReleasePlugin implements Schedulable {
  public readonly cadence = 'Every 2 hours'
  public readonly nextWindow = '11:00 MYT'

  public constructor() {
    super({
      id: 'plugin-2',
      title: 'Observability guardian',
      owner: 'Platform core',
      capability: 'observability',
      runbook: ['Tail client traces', 'Compare error budget', 'Review alert routing'],
      baselineRisk: 67,
    })
  }

  public run(): PluginRunResult {
    return {
      health: 'review',
      headline: this.buildHeadline('Inspect telemetry drift before rollout'),
      tasks: [...this.runbook, 'Escalate one noisy dashboard panel'],
      completionScore: 76,
    }
  }
}

class ComplianceGate extends ReleasePlugin implements Schedulable {
  public readonly cadence = 'Daily'
  public readonly nextWindow = '15:30 MYT'

  public constructor() {
    super({
      id: 'plugin-3',
      title: 'Compliance gate',
      owner: 'Developer experience',
      capability: 'governance',
      runbook: ['Review audit checklist', 'Confirm sign-off owner', 'Record retention note'],
      baselineRisk: 88,
    })
  }

  public run(): PluginRunResult {
    return {
      health: 'blocked',
      headline: this.buildHeadline('Hold release until audit artifacts are complete'),
      tasks: [...this.runbook, 'Collect one missing approval'],
      completionScore: 51,
    }
  }
}

const pluginRegistry = [
  new RolloutCoordinator(),
  new ObservabilityGuardian(),
  new ComplianceGate(),
] as const satisfies readonly ReleasePlugin[]

const defaultPlugin = pluginRegistry[0]

const typePatterns = [
  {
    label: 'Classes',
    code: 'class RolloutCoordinator extends ReleasePlugin',
    note: 'Each plugin instance carries behavior and data in one reusable runtime object.',
  },
  {
    label: 'Access modifiers',
    code: 'public / protected / private',
    note: 'The sample exposes a public contract, keeps subclass helpers protected, and hides risk scoring privately.',
  },
  {
    label: 'Abstract classes',
    code: 'abstract class ReleasePlugin',
    note: 'Shared behavior lives in the base class while subclasses provide the concrete schedule and run result.',
  },
  {
    label: 'implements',
    code: 'class RolloutCoordinator implements Schedulable',
    note: 'The concrete classes must satisfy the scheduling interface instead of hoping they match by accident.',
  },
  {
    label: 'Intersection types',
    code: 'type PluginCardModel = PluginSnapshot & Schedulable & { riskBand: string }',
    note: 'The UI model is composed from smaller contracts instead of re-declaring the same fields.',
  },
] as const

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

function buildHealthTone(health: PluginHealth) {
  switch (health) {
    case 'ready':
      return 'Ready'
    case 'review':
      return 'Needs review'
    case 'blocked':
      return 'Blocked'
  }
}

export default function ClassesModelsSample() {
  const [activeId, setActiveId] = useState<PluginId>(defaultPlugin.id)
  const [lastRun, setLastRun] = useState<{
    readonly pluginId: PluginId
    readonly ranAt: string
    readonly result: PluginRunResult
  } | null>(null)
  const [activityLog, setActivityLog] = useState<readonly string[]>([
    'Run one of the concrete plugins to inspect the abstract base class behavior.',
  ])

  const activePlugin = pluginRegistry.find((plugin) => plugin.id === activeId) ?? defaultPlugin
  const activeCard = activePlugin.toCardModel()
  const lastRunForActive = lastRun?.pluginId === activePlugin.id ? lastRun : null

  function runActivePlugin() {
    const result = activePlugin.run()
    const ranAt = formatTime(new Date())

    setLastRun({
      pluginId: activePlugin.id,
      ranAt,
      result,
    })
    setActivityLog((currentLog) => [
      `${ranAt} - ${activePlugin.title}: ${result.headline}`,
      ...currentLog,
    ].slice(0, 5))
  }

  return (
    <div className="classes-sample">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Classes and object-oriented modeling</h3>
      </div>

      <p className="section-copy">
        This sample keeps the runtime UI small and makes the class model the main subject. One
        abstract plugin base class feeds several concrete implementations, and the rendered view
        combines class snapshots with intersection-typed scheduling data.
      </p>

      <div className="classes-toolbar">
        <div className="classes-toolbar__buttons">
          {pluginRegistry.map((plugin) => (
            <button
              key={plugin.id}
              type="button"
              className={`filter-button ${activeId === plugin.id ? 'is-selected' : ''}`}
              onClick={() => setActiveId(plugin.id)}
            >
              {plugin.title}
            </button>
          ))}
        </div>

        <button type="button" className="primary-button" onClick={runActivePlugin}>
          Run active plugin
        </button>
      </div>

      <div className="sample-summary">
        <article className="sample-stat">
          <span>Concrete classes</span>
          <strong>{pluginRegistry.length}</strong>
        </article>
        <article className="sample-stat">
          <span>Cadence</span>
          <strong>{activeCard.cadence}</strong>
        </article>
        <article className="sample-stat">
          <span>Last health</span>
          <strong>{lastRunForActive ? buildHealthTone(lastRunForActive.result.health) : 'Not run yet'}</strong>
        </article>
      </div>

      <div className="classes-grid">
        <article className="classes-card">
          <div className="resource-card__header">
            <div>
              <p className="eyebrow">Selected plugin</p>
              <h4>{activeCard.title}</h4>
            </div>
            <span className="chip">{activeCard.capability}</span>
          </div>

          <div className="classes-list">
            <p>
              <span>Owner</span>
              <strong>{activeCard.owner}</strong>
            </p>
            <p>
              <span>Next window</span>
              <strong>{activeCard.nextWindow}</strong>
            </p>
            <p>
              <span>Risk band</span>
              <strong>{activeCard.riskBand}</strong>
            </p>
          </div>

          <p className="section-copy">{activeCard.summary}</p>
        </article>

        <article className="classes-card">
          <div className="resource-card__header">
            <div>
              <p className="eyebrow">Latest run</p>
              <h4>{lastRunForActive ? lastRunForActive.result.headline : 'Run the active class'}</h4>
            </div>
            <span className="chip">
              {lastRunForActive ? `${lastRunForActive.result.completionScore}%` : 'Idle'}
            </span>
          </div>

          {lastRunForActive ? (
            <>
              <div className="classes-list">
                <p>
                  <span>Ran at</span>
                  <strong>{lastRunForActive.ranAt}</strong>
                </p>
                <p>
                  <span>Health</span>
                  <strong>{buildHealthTone(lastRunForActive.result.health)}</strong>
                </p>
                <p>
                  <span>Task count</span>
                  <strong>{lastRunForActive.result.tasks.length}</strong>
                </p>
              </div>

              <ul className="summary-list">
                {lastRunForActive.result.tasks.map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="section-copy">
              The concrete subclass decides the result, but the shared base class still provides the
              common summary and risk behavior.
            </p>
          )}
        </article>

        <article className="classes-card">
          <div className="resource-card__header">
            <div>
              <p className="eyebrow">Registry snapshot</p>
              <h4>Class hierarchy in one list</h4>
            </div>
            <code>abstract + concrete</code>
          </div>

          <div className="classes-registry">
            {pluginRegistry.map((plugin) => {
              const card = plugin.toCardModel()

              return (
                <article key={plugin.id} className="classes-registry__item">
                  <strong>{card.title}</strong>
                  <p>{card.summary}</p>
                  <div className="sample-card__meta">
                    <span>{card.cadence}</span>
                    <span>{card.nextWindow}</span>
                    <span>{card.riskBand}</span>
                  </div>
                </article>
              )
            })}
          </div>
        </article>

        <article className="classes-card">
          <div className="resource-card__header">
            <div>
              <p className="eyebrow">Activity log</p>
              <h4>Recent dispatches</h4>
            </div>
            <code>{activePlugin.id}</code>
          </div>

          <div className="resource-log">
            {activityLog.map((entry) => (
              <p key={entry}>{entry}</p>
            ))}
          </div>
        </article>
      </div>

      <div className="type-grid">
        {typePatterns.map((pattern) => (
          <article key={pattern.label} className="type-card sample-card">
            <h3>{pattern.label}</h3>
            <code>{pattern.code}</code>
            <p>{pattern.note}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
