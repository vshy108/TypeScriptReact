import { useMemo, useState } from 'react'

type ReleaseContractPattern = `release-${number}`

interface ReleaseContract {
  readonly id: ReleaseContractPattern
  readonly name: string
  readonly owner: string
  readonly channel: 'canary' | 'beta' | 'stable'
  readonly flags: readonly string[]
  readonly rolloutPercent: number
  readonly rollbackWindowHours: number
  readonly paused: boolean
}

type ValueKind<Value> = Value extends string
  ? 'text'
  : Value extends number
    ? 'number'
    : Value extends boolean
      ? 'toggle'
      : Value extends readonly string[]
        ? 'list'
        : 'object'

type FieldMeta<T extends object> = {
  readonly [Key in keyof T]: {
    readonly label: string
    readonly kind: ValueKind<T[Key]>
    readonly editable: boolean
  }
}

type PlannerStepFrom<T> = T extends (...args: never[]) => {
  readonly steps: ReadonlyArray<infer Step>
}
  ? Step
  : never

type FirstArgument<T> = T extends (input: infer Input, ...args: never[]) => unknown
  ? Input
  : never

const releaseContracts = [
  {
    id: 'release-1',
    name: 'UI polish release',
    owner: 'Design systems',
    channel: 'beta',
    flags: ['tokens-v2', 'palette-refactor'],
    rolloutPercent: 55,
    rollbackWindowHours: 4,
    paused: false,
  },
  {
    id: 'release-2',
    name: 'Runtime stability release',
    owner: 'Platform core',
    channel: 'canary',
    flags: ['runtime-telemetry', 'error-boundary-upgrade'],
    rolloutPercent: 20,
    rollbackWindowHours: 6,
    paused: false,
  },
  {
    id: 'release-3',
    name: 'Migration support release',
    owner: 'Developer experience',
    channel: 'stable',
    flags: ['codemod-assistant', 'docs-refresh'],
    rolloutPercent: 100,
    rollbackWindowHours: 8,
    paused: true,
  },
] as const satisfies readonly ReleaseContract[]

type ReleaseContractId = (typeof releaseContracts)[number]['id']
type ReleaseField = keyof ReleaseContract
type EditableReleaseField = 'owner' | 'channel' | 'rolloutPercent' | 'paused'
type ReleaseDraft = Partial<Pick<ReleaseContract, EditableReleaseField>>
type ReleaseLookup = Record<ReleaseContractId, ReleaseContract>

const releaseFieldOrder = [
  'id',
  'name',
  'owner',
  'channel',
  'flags',
  'rolloutPercent',
  'rollbackWindowHours',
  'paused',
] as const satisfies readonly ReleaseField[]

const editableFieldOrder = [
  'owner',
  'channel',
  'rolloutPercent',
  'paused',
] as const satisfies readonly EditableReleaseField[]

// A mapped type keeps this metadata synchronized with the contract shape.
const releaseFieldMeta = {
  id: { label: 'Identifier', kind: 'text', editable: false },
  name: { label: 'Release name', kind: 'text', editable: false },
  owner: { label: 'Owner', kind: 'text', editable: true },
  channel: { label: 'Channel', kind: 'text', editable: true },
  flags: { label: 'Flags', kind: 'list', editable: false },
  rolloutPercent: { label: 'Rollout', kind: 'number', editable: true },
  rollbackWindowHours: { label: 'Rollback window', kind: 'number', editable: false },
  paused: { label: 'Paused', kind: 'toggle', editable: true },
} as const satisfies FieldMeta<ReleaseContract>

const kindDescriptions = {
  text: 'String-like field',
  number: 'Numeric field',
  toggle: 'Boolean toggle',
  list: 'Readonly string list',
} as const satisfies Record<ValueKind<ReleaseContract[ReleaseField]>, string>

const typePatterns = [
  {
    label: 'Partial + Pick',
    code: 'type ReleaseDraft = Partial<Pick<ReleaseContract, EditableReleaseField>>',
    note: 'The draft only exposes a safe editable subset, and every field can be omitted.',
  },
  {
    label: 'Record',
    code: 'type ReleaseLookup = Record<ReleaseContractId, ReleaseContract>',
    note: 'The sample can index a release by its exact id without a maybe-undefined result.',
  },
  {
    label: 'keyof + mapped types',
    code: 'type FieldMeta<T> = { [Key in keyof T]: ... }',
    note: 'Metadata keys must stay aligned with the source model, or TypeScript reports it immediately.',
  },
  {
    label: 'Conditional types',
    code: 'type ValueKind<Value> = Value extends string ? "text" : ...',
    note: 'Each field is tagged by the value category that TypeScript infers from its property type.',
  },
  {
    label: 'ReturnType + infer',
    code: 'type PlannerStepFrom<T> = T extends (...) => { steps: (infer Step)[] } ? Step : never',
    note: 'The planner output and its step entries are derived from the function signature instead of copied.',
  },
] as const

function createRecordById<const Items extends readonly { readonly id: string }[]>(items: Items) {
  return Object.fromEntries(items.map((item) => [item.id, item])) as Record<
    Items[number]['id'],
    Items[number]
  >
}

const releaseLookup = createRecordById(releaseContracts) as ReleaseLookup

function getNextChannel(current: ReleaseContract['channel']): ReleaseContract['channel'] {
  switch (current) {
    case 'canary':
      return 'beta'
    case 'beta':
      return 'stable'
    case 'stable':
      return 'stable'
  }
}

function buildReleaseDraft(contract: ReleaseContract): ReleaseDraft {
  return {
    owner: `${contract.owner} + release reviewer`,
    channel: getNextChannel(contract.channel),
    ...(contract.rolloutPercent < 100
      ? { rolloutPercent: Math.min(contract.rolloutPercent + 15, 100) }
      : {}),
    ...(contract.paused ? { paused: false } : {}),
  }
}

function planRelease(input: ReleaseContract) {
  const nextChannel = getNextChannel(input.channel)

  return {
    status: input.paused ? 'needs-unpause' : 'ready',
    rolloutLabel: `${input.rolloutPercent}% -> ${Math.min(input.rolloutPercent + 15, 100)}%`,
    summary: `${input.name} moves from ${input.channel} to ${nextChannel}.`,
    steps: [
      {
        label: 'Confirm release owner',
        state: 'ready',
        detail: `Primary owner: ${input.owner}.`,
      },
      {
        label: 'Verify rollout window',
        state: input.paused ? 'blocked' : 'ready',
        detail: `Rollback support remains open for ${input.rollbackWindowHours} hours.`,
      },
      {
        label: 'Promote next channel',
        state: nextChannel === input.channel ? 'steady' : 'ready',
        detail: `Target channel after the draft is ${nextChannel}.`,
      },
    ] as const,
  }
}

type ReleasePlan = ReturnType<typeof planRelease>
type ReleasePlanStep = PlannerStepFrom<typeof planRelease>
type ReleasePlannerInput = FirstArgument<typeof planRelease>

function describeField<Key extends ReleaseField>(contract: ReleaseContract, field: Key) {
  return {
    field,
    label: releaseFieldMeta[field].label,
    kind: releaseFieldMeta[field].kind,
    value: contract[field],
  }
}

function formatFieldValue(value: ReleaseContract[ReleaseField]) {
  if (Array.isArray(value)) {
    return value.join(', ')
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }

  return String(value)
}

function getDraftEntries(draft: ReleaseDraft) {
  return editableFieldOrder.flatMap((field) => {
    const value = draft[field]
    return value === undefined ? [] : [[field, value] as const]
  })
}

export default function UtilityMappedSample() {
  const [activeId, setActiveId] = useState<ReleaseContractId>(releaseContracts[0].id)
  const [focusedField, setFocusedField] = useState<ReleaseField>('channel')

  const activeRelease = releaseLookup[activeId]
  const activeDraft = useMemo(() => buildReleaseDraft(activeRelease), [activeRelease])
  const activePlan: ReleasePlan = useMemo(() => planRelease(activeRelease), [activeRelease])
  const focusedFieldSummary = useMemo(
    () => describeField(activeRelease, focusedField),
    [activeRelease, focusedField],
  )

  // These aliases force the compiler to keep the planner helpers wired to the real function shape.
  const releasePlannerInput: ReleasePlannerInput = activeRelease
  const leadStep: ReleasePlanStep = activePlan.steps[0]

  return (
    <div className="ts-utility-sample">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Utility, mapped, and conditional types</h3>
      </div>

      <p className="section-copy">
        This sample keeps the runtime UI intentionally small. The point is to show how TypeScript
        transforms one release contract into safer derived shapes instead of scattering copy-pasted
        interfaces across the codebase.
      </p>

      <div className="ts-utility-toolbar">
        {releaseContracts.map((contract) => (
          <button
            key={contract.id}
            type="button"
            className={`filter-button ${activeId === contract.id ? 'is-selected' : ''}`}
            onClick={() => setActiveId(contract.id)}
          >
            {contract.name}
          </button>
        ))}
      </div>

      <div className="sample-summary">
        <article className="sample-stat">
          <span>Active release</span>
          <strong>{activeRelease.id}</strong>
        </article>
        <article className="sample-stat">
          <span>Editable fields</span>
          <strong>{editableFieldOrder.length}</strong>
        </article>
        <article className="sample-stat">
          <span>Lookup entries</span>
          <strong>{Object.keys(releaseLookup).length}</strong>
        </article>
      </div>

      <div className="ts-utility-grid">
        <article className="ts-utility-card">
          <div className="resource-card__header">
            <div>
              <p className="eyebrow">Source contract</p>
              <h4>{activeRelease.name}</h4>
            </div>
            <span className="chip">{activeRelease.channel}</span>
          </div>

          <div className="ts-utility-selector">
            <label htmlFor="field-focus">Inspect a keyof field</label>
            <select
              id="field-focus"
              value={focusedField}
              onChange={(event) => setFocusedField(event.target.value as ReleaseField)}
            >
              {releaseFieldOrder.map((field) => (
                <option key={field} value={field}>
                  {releaseFieldMeta[field].label}
                </option>
              ))}
            </select>
          </div>

          <dl className="ts-utility-definition-list">
            {releaseFieldOrder.map((field) => (
              <div key={field}>
                <dt>{releaseFieldMeta[field].label}</dt>
                <dd>{formatFieldValue(activeRelease[field])}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="ts-utility-card">
          <div className="resource-card__header">
            <div>
              <p className="eyebrow">Utility types in use</p>
              <h4>Editable draft and lookup</h4>
            </div>
            <code>Record + Partial + Pick</code>
          </div>

          <p className="section-copy">
            <code>releaseLookup[{activeId}]</code> returns the active contract directly because the
            lookup is typed as a <code>Record</code> keyed by exact ids.
          </p>

          <div className="ts-utility-code">
            <strong>ReleaseDraft preview</strong>
            {getDraftEntries(activeDraft).map(([field, value]) => (
              <p key={field}>
                <span>{releaseFieldMeta[field].label}</span>
                <code>{formatFieldValue(value)}</code>
              </p>
            ))}
          </div>

          <p className="section-copy">
            The draft omits non-editable properties entirely. That is why <code>flags</code> and
            <code> rollbackWindowHours</code> never appear here.
          </p>
        </article>

        <article className="ts-utility-card">
          <div className="resource-card__header">
            <div>
              <p className="eyebrow">Mapped and conditional view</p>
              <h4>Field metadata stays in sync</h4>
            </div>
            <code>keyof + conditional types</code>
          </div>

          <div className="ts-utility-table" role="table" aria-label="Field metadata">
            {releaseFieldOrder.map((field) => (
              <div key={field} className="ts-utility-table__row" role="row">
                <span role="cell">{releaseFieldMeta[field].label}</span>
                <code role="cell">{releaseFieldMeta[field].kind}</code>
                <span role="cell">
                  {releaseFieldMeta[field].editable ? 'Editable' : 'Read-only'}
                </span>
              </div>
            ))}
          </div>

          <p className="section-copy">
            Focused field: <strong>{focusedFieldSummary.label}</strong> is treated as a{' '}
            <code>{focusedFieldSummary.kind}</code> field, so the sample can explain it as{' '}
            {kindDescriptions[focusedFieldSummary.kind].toLowerCase()}.
          </p>
        </article>

        <article className="ts-utility-card">
          <div className="resource-card__header">
            <div>
              <p className="eyebrow">Function-derived types</p>
              <h4>ReturnType and infer</h4>
            </div>
            <code>ReturnType + infer</code>
          </div>

          <p className="section-copy">{activePlan.summary}</p>

          <div className="ts-utility-plan">
            <p>
              <span>Status</span>
              <strong>{activePlan.status}</strong>
            </p>
            <p>
              <span>Rollout</span>
              <strong>{activePlan.rolloutLabel}</strong>
            </p>
            <p>
              <span>Planner input</span>
              <strong>{releasePlannerInput.owner}</strong>
            </p>
            <p>
              <span>Lead step</span>
              <strong>{leadStep.label}</strong>
            </p>
          </div>

          <ul className="summary-list">
            {activePlan.steps.map((step) => (
              <li key={step.label}>
                <strong>{step.label}:</strong> {step.state}. {step.detail}
              </li>
            ))}
          </ul>
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
