import { useState } from 'react'

type CommandMethod = 'POST' | 'PATCH' | 'DELETE'
type CommandPath = '/rollout' | '/flags' | '/telemetry'
type Priority = 'low' | 'medium' | 'high'
type OperatorRegion = 'APAC' | 'EMEA' | 'AMER'
type OperationPresetId = `operation-${number}`

// Labeled tuples preserve both slot order and slot meaning, which makes them useful for fixed-shape function inputs.
type CommandTuple = readonly [method: CommandMethod, path: CommandPath, retries: number]
type ReleaseWindow = readonly [opensAtIso: string, closesAtIso: string]

interface OperationPreset {
  readonly id: OperationPresetId
  readonly title: string
  readonly owner: string
  readonly route: CommandTuple
  readonly window: ReleaseWindow
}

interface DispatchPlan {
  readonly method: CommandMethod
  readonly path: CommandPath
  readonly retries: number
  readonly priority: Priority
  readonly retryProfile: readonly [retries: number, priority: Priority]
  readonly summary: string
}

// A call signature describes values that behave like functions while still carrying extra properties.
interface PlanPreviewer {
  (plan: DispatchPlan, tone: 'brief' | 'full'): string
  readonly label: string
}

// A construct signature describes any value that can be called with "new", even if the concrete constructor comes from elsewhere.
interface IsoClock {
  new (isoTime: string): Date
}

interface OperatorContext {
  readonly operator: string
  readonly region: OperatorRegion
  readonly queue: string
}

const operationPresets = [
  {
    id: 'operation-1',
    title: 'Token rollout promotion',
    owner: 'Design systems',
    route: ['POST', '/rollout', 2],
    window: ['2026-03-19T09:00:00.000Z', '2026-03-19T11:00:00.000Z'],
  },
  {
    id: 'operation-2',
    title: 'Feature-flag patch window',
    owner: 'Platform core',
    route: ['PATCH', '/flags', 1],
    window: ['2026-03-19T12:30:00.000Z', '2026-03-19T13:15:00.000Z'],
  },
  {
    id: 'operation-3',
    title: 'Telemetry rollback sweep',
    owner: 'Observability guild',
    route: ['DELETE', '/telemetry', 3],
    window: ['2026-03-19T15:00:00.000Z', '2026-03-19T16:30:00.000Z'],
  },
] as const satisfies readonly OperationPreset[]

const defaultPreset = operationPresets[0]

const regionOrder = ['APAC', 'EMEA', 'AMER'] as const satisfies readonly OperatorRegion[]

const priorityByMethod = {
  POST: 'high',
  PATCH: 'medium',
  DELETE: 'low',
} as const satisfies Record<CommandMethod, Priority>

const operatorContexts = {
  APAC: { operator: 'Nadia', region: 'APAC', queue: 'follow-the-sun' },
  EMEA: { operator: 'Marek', region: 'EMEA', queue: 'regional-lane' },
  AMER: { operator: 'Avery', region: 'AMER', queue: 'launch-desk' },
} as const satisfies Record<OperatorRegion, OperatorContext>

const typePatterns = [
  {
    label: 'Tuples',
    code: 'type CommandTuple = readonly [method, path, retries]',
    note: 'The command can be spread into overloaded APIs without losing which slot means what.',
  },
  {
    label: 'Function overloads',
    code: 'createDispatchPlan(route) / createDispatchPlan(method, path, retries)',
    note: 'One implementation supports multiple strongly typed entry points.',
  },
  {
    label: 'Call signatures',
    code: 'interface PlanPreviewer { (plan, tone): string; label: string }',
    note: 'The preview helper is callable like a function and still carries metadata.',
  },
  {
    label: 'Construct signatures',
    code: 'interface IsoClock { new (isoTime: string): Date }',
    note: 'The sample treats a constructor as typed input and uses it with new.',
  },
  {
    label: '`this` typing',
    code: 'function summarizeForOperator(this: OperatorContext, plan: DispatchPlan)',
    note: 'Callers must bind the right execution context before using the formatter.',
  },
] as const

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatIsoWindow(window: ReleaseWindow) {
  const ReplayClock: IsoClock = Date
  const opensAt = new ReplayClock(window[0])
  const closesAt = new ReplayClock(window[1])
  return `${formatTime(opensAt)} - ${formatTime(closesAt)}`
}

function isCommandTuple(value: CommandTuple | CommandMethod): value is CommandTuple {
  return Array.isArray(value)
}

// Function overloads let one API accept either a tuple or separate arguments while keeping both call sites strongly typed.
function createDispatchPlan(route: CommandTuple): DispatchPlan
function createDispatchPlan(method: CommandMethod, path: CommandPath, retries: number): DispatchPlan
function createDispatchPlan(
  first: CommandTuple | CommandMethod,
  path?: CommandPath,
  retries?: number,
): DispatchPlan {
  let route: CommandTuple

  if (isCommandTuple(first)) {
    route = first
  } else {
    if (path === undefined || retries === undefined) {
      throw new Error('Separate-argument overload requires method, path, and retries.')
    }

    route = [first, path, retries]
  }

  const [method, resolvedPath, resolvedRetries] = route
  const priority = priorityByMethod[method]

  return {
    method,
    path: resolvedPath,
    retries: resolvedRetries,
    priority,
    retryProfile: [resolvedRetries, priority],
    summary: `${method} ${resolvedPath} with ${resolvedRetries} retries (${priority} priority)`,
  }
}

const previewPlan: PlanPreviewer = Object.assign(
  (plan: DispatchPlan, tone: 'brief' | 'full') =>
    tone === 'brief'
      ? `${plan.method} ${plan.path}`
      : `${plan.summary}. Retry tuple is [${plan.retryProfile[0]}, ${plan.retryProfile[1]}].`,
  { label: 'Callable plan previewer' },
)

// A typed "this" parameter forces callers to provide the operator context explicitly instead of relying on any-shaped binding.
function summarizeForOperator(this: OperatorContext, plan: DispatchPlan) {
  return `${this.operator} in ${this.region} queued ${plan.method} ${plan.path} via ${this.queue}.`
}

export default function FunctionsTuplesSample() {
  // useState keeps the selected preset and operator region interactive while the type-shape helpers remain pure.
  const [activePresetId, setActivePresetId] = useState<OperationPresetId>(defaultPreset.id)
  const [region, setRegion] = useState<OperatorRegion>('APAC')

  const activePreset =
    operationPresets.find((preset) => preset.id === activePresetId) ?? defaultPreset
  const activeRoute: CommandTuple = activePreset.route
  const planFromTuple = createDispatchPlan(activeRoute)
  const planFromSpreadArgs = createDispatchPlan(...activeRoute)
  const operatorSummary = summarizeForOperator.call(operatorContexts[region], planFromTuple)
  const previewLabel = previewPlan(planFromTuple, 'full')
  const releaseWindowLabel = formatIsoWindow(activePreset.window)

  return (
    <div className="functions-sample">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Function typing, overloads, and tuples</h3>
      </div>

      <p className="section-copy">
        This sample focuses on TypeScript function shapes. The runtime UI stays small so the type
        behavior is easy to inspect: one command tuple flows through overloads, call signatures,
        construct signatures, and a formatter with explicit <code>this</code> typing.
      </p>

      <div className="functions-toolbar">
        <div className="functions-toolbar__buttons">
          {operationPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`filter-button ${activePresetId === preset.id ? 'is-selected' : ''}`}
              onClick={() => setActivePresetId(preset.id)}
            >
              {preset.title}
            </button>
          ))}
        </div>

        <div className="field">
          <label htmlFor="operator-region">Operator region</label>
          <select
            id="operator-region"
            value={region}
            onChange={(event) => setRegion(event.target.value as OperatorRegion)}
          >
            {regionOrder.map((regionOption) => (
              <option key={regionOption} value={regionOption}>
                {regionOption}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="sample-summary">
        <article className="sample-stat">
          <span>Active route</span>
          <strong>
            {activePreset.route[0]} {activePreset.route[1]}
          </strong>
        </article>
        <article className="sample-stat">
          <span>Retries</span>
          <strong>{activePreset.route[2]}</strong>
        </article>
        <article className="sample-stat">
          <span>Release window</span>
          <strong>{releaseWindowLabel}</strong>
        </article>
      </div>

      <div className="functions-grid">
        <article className="functions-card">
          <div className="resource-card__header">
            <div>
              <p className="eyebrow">Tuple anatomy</p>
              <h4>Fixed slots, predictable spread</h4>
            </div>
            <code>[method, path, retries]</code>
          </div>

          <div className="functions-list">
            <p>
              <span>Slot 1</span>
              <strong>{activePreset.route[0]}</strong>
            </p>
            <p>
              <span>Slot 2</span>
              <strong>{activePreset.route[1]}</strong>
            </p>
            <p>
              <span>Slot 3</span>
              <strong>{activePreset.route[2]}</strong>
            </p>
            <p>
              <span>Window tuple</span>
              <strong>{releaseWindowLabel}</strong>
            </p>
          </div>

          <p className="section-copy">
            The tuple slots stay ordered and labeled, so the same value can be passed around as one
            unit or spread into another typed API.
          </p>
        </article>

        <article className="functions-card">
          <div className="resource-card__header">
            <div>
              <p className="eyebrow">Overload comparison</p>
              <h4>Tuple call vs spread arguments</h4>
            </div>
            <code>overloads</code>
          </div>

          <div className="functions-list">
            <p>
              <span>Tuple overload</span>
              <strong>{planFromTuple.summary}</strong>
            </p>
            <p>
              <span>Spread overload</span>
              <strong>{planFromSpreadArgs.summary}</strong>
            </p>
            <p>
              <span>Same result</span>
              <strong>{planFromTuple.summary === planFromSpreadArgs.summary ? 'Yes' : 'No'}</strong>
            </p>
          </div>

          <p className="section-copy">
            Both call forms end in the same implementation, but TypeScript still validates the tuple
            shape and the separate parameter list independently.
          </p>
        </article>

        <article className="functions-card">
          <div className="resource-card__header">
            <div>
              <p className="eyebrow">Callable and constructable helpers</p>
              <h4>Call signatures + construct signatures</h4>
            </div>
            <code>{previewPlan.label}</code>
          </div>

          <div className="functions-list">
            <p>
              <span>Callable preview</span>
              <strong>{previewLabel}</strong>
            </p>
            <p>
              <span>Constructed open time</span>
              <strong>{formatTime(new Date(activePreset.window[0]))}</strong>
            </p>
            <p>
              <span>Owner</span>
              <strong>{activePreset.owner}</strong>
            </p>
          </div>

          <p className="section-copy">
            <code>previewPlan</code> behaves like a function and still exposes a label property,
            while the typed clock constructor guarantees that <code>new</code> receives an ISO
            string.
          </p>
        </article>

        <article className="functions-card">
          <div className="resource-card__header">
            <div>
              <p className="eyebrow">Context-bound formatter</p>
              <h4>`this` typing in functions</h4>
            </div>
            <code>{region}</code>
          </div>

          <div className="functions-list">
            <p>
              <span>Operator</span>
              <strong>{operatorContexts[region].operator}</strong>
            </p>
            <p>
              <span>Queue</span>
              <strong>{operatorContexts[region].queue}</strong>
            </p>
            <p>
              <span>Summary</span>
              <strong>{operatorSummary}</strong>
            </p>
          </div>

          <p className="section-copy">
            The formatter cannot be called with an arbitrary object. TypeScript checks the bound
            <code>this</code> context before the function runs.
          </p>
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
