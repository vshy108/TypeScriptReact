// Nested submit button state
// --------------------------
// This sample demonstrates useFormStatus for reading the active form submission
// from any descendant without threading props down from the form shell.
// Key pattern: multiple <button name="intent"> elements let the action handler
// distinguish which submit button was clicked, while useFormStatus gives
// nested components access to the pending state and submitted form data.

import { useId, useState } from 'react'
import { useFormStatus } from 'react-dom'

type DispatchAudience = 'product' | 'partners' | 'everyone'
type DispatchIntent = 'review' | 'publish'
type DispatchRecordId = `dispatch-${number}`

interface DispatchDraft {
  readonly subject: string
  readonly audience: DispatchAudience
  readonly intent: DispatchIntent
}

interface DispatchRecord extends DispatchDraft {
  readonly id: DispatchRecordId
  readonly submittedAt: string
  readonly durationLabel: string
}

const audienceOptions = [
  { value: 'product', label: 'Product team' },
  { value: 'partners', label: 'Partner brief' },
  { value: 'everyone', label: 'All customers' },
] as const satisfies readonly { value: DispatchAudience; label: string }[]

const intentLabels = {
  review: 'Send for review',
  publish: 'Publish update',
} as const satisfies Record<DispatchIntent, string>

const starterDispatches = [
  {
    id: 'dispatch-1',
    subject: 'React 19 sample rollout',
    audience: 'product',
    intent: 'review',
    submittedAt: '09:45:12',
    durationLabel: '640 ms',
  },
  {
    id: 'dispatch-2',
    subject: 'TypeScript roadmap refresh',
    audience: 'partners',
    intent: 'publish',
    submittedAt: '10:14:08',
    durationLabel: '810 ms',
  },
] as const satisfies readonly DispatchRecord[]

let nextDispatchNumber = starterDispatches.length + 1

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

function assertNonEmptyString(
  value: FormDataEntryValue | null,
  field: string,
): asserts value is string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} is required.`)
  }
}

function isDispatchAudience(value: string): value is DispatchAudience {
  return audienceOptions.some((option) => option.value === value)
}

function isDispatchIntent(value: string): value is DispatchIntent {
  return value === 'review' || value === 'publish'
}

function parseDispatchDraft(formData: FormData): DispatchDraft {
  const subjectValue = formData.get('subject')
  const audienceValue = formData.get('audience')
  const intentValue = formData.get('intent')

  assertNonEmptyString(subjectValue, 'Subject')
  assertNonEmptyString(audienceValue, 'Audience')
  assertNonEmptyString(intentValue, 'Submit intent')

  if (!isDispatchAudience(audienceValue)) {
    throw new Error('Choose a valid audience.')
  }

  if (!isDispatchIntent(intentValue)) {
    throw new Error('Use one of the nested submit buttons.')
  }

  return {
    subject: subjectValue.trim(),
    audience: audienceValue,
    intent: intentValue,
  }
}

function createDispatchRecord(draft: DispatchDraft, durationMs: number): DispatchRecord {
  return {
    id: `dispatch-${nextDispatchNumber++}`,
    ...draft,
    submittedAt: formatTime(new Date()),
    durationLabel: `${durationMs} ms`,
  }
}

// Safely extract a string field from the in-flight FormData.
// useFormStatus exposes `data` only while a submission is active,
// so this helper defends against null data and non-string entries.
function readPendingField(data: FormData | null, field: string) {
  const value = data?.get(field)
  return typeof value === 'string' ? value : null
}

function getAudienceLabel(audience: DispatchAudience) {
  return audienceOptions.find((option) => option.value === audience)?.label ?? audience
}

function PendingInspector() {
  // These descendants read the nearest parent <form>'s submission state
  // without any prop threading. useFormStatus only works inside a <form>.
  const { pending, data, method } = useFormStatus()
  const subject = readPendingField(data, 'subject')?.trim()
  const audience = readPendingField(data, 'audience')
  const intent = readPendingField(data, 'intent')

  return (
    <aside className="form-status-panel" aria-live="polite">
      <div className="form-status-panel__header">
        <span>Current form status</span>
        <strong>{pending ? 'Submitting...' : 'Idle'}</strong>
      </div>

      <dl className="form-status-panel__grid">
        <div>
          <dt>Method</dt>
          <dd>{method ?? 'none'}</dd>
        </div>
        <div>
          <dt>Intent</dt>
          <dd>{intent ?? 'No active submission'}</dd>
        </div>
        <div>
          <dt>Subject</dt>
          <dd>{subject || 'Waiting for a submit action'}</dd>
        </div>
        <div>
          <dt>Audience</dt>
          <dd>{audience ?? 'None'}</dd>
        </div>
      </dl>
    </aside>
  )
}

// Each submit button carries a different `name="intent"` value. useFormStatus
// reads which button triggered the submission so individual buttons can show
// their own active indicator without shared boolean props.
function SubmitButton({ intent }: { readonly intent: DispatchIntent }) {
  const { pending, data } = useFormStatus()
  const activeIntent = readPendingField(data, 'intent')
  const isActiveIntent = pending && activeIntent === intent

  return (
    <button
      type="submit"
      name="intent"
      value={intent}
      disabled={pending}
      className={`primary-button form-status-submit ${isActiveIntent ? 'is-active' : ''}`}
    >
      {isActiveIntent ? `Submitting ${intent}...` : intentLabels[intent]}
    </button>
  )
}

export default function FormStatusSample() {
  const subjectId = useId()
  const audienceId = useId()
  const [dispatches, setDispatches] = useState<readonly DispatchRecord[]>(starterDispatches)
  const [lastResult, setLastResult] = useState(
    'Choose one of the nested submit buttons to see useFormStatus react to the active form submission.',
  )

  // A function action gives useFormStatus a live snapshot of the form that is currently submitting.
  // performance.now() captures the wall-clock duration of the simulated async work
  // so the dispatch record can display how long the submission took.
  async function handleDispatch(formData: FormData) {
    const startedAt = performance.now()

    try {
      const draft = parseDispatchDraft(formData)
      await wait(1000)

      const record = createDispatchRecord(draft, Math.round(performance.now() - startedAt))

      setDispatches((currentDispatches) => [record, ...currentDispatches].slice(0, 4))
      setLastResult(
        `${intentLabels[record.intent]} completed for "${record.subject}" at ${record.submittedAt}.`,
      )
    } catch (error) {
      setLastResult(error instanceof Error ? error.message : 'Unable to submit the form.')
    }
  }

  return (
    <div className="form-status-sample">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Nested submit button state</h3>
      </div>

      <p className="section-copy">
        This sample focuses on <code>useFormStatus</code>. The pending panel and submit buttons sit
        inside the form tree, so they can read the nearest form state directly instead of receiving
        <code>pending</code> or <code>FormData</code> as props.
      </p>

      <form action={handleDispatch} method="post" className="form-status-shell">
        <div className="form-status-fields">
          <div className="field">
            <label htmlFor={subjectId}>Update subject</label>
            <input
              id={subjectId}
              name="subject"
              type="text"
              defaultValue="React DOM sample launch"
              placeholder="Summarize the update"
            />
          </div>

          <div className="field">
            <label htmlFor={audienceId}>Audience</label>
            <select id={audienceId} name="audience" defaultValue="product">
              {audienceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <PendingInspector />

        <div className="form-status-actions">
          <SubmitButton intent="review" />
          <SubmitButton intent="publish" />
        </div>
      </form>

      <div className="form-status-results">
        <article className="form-status-panel">
          <div className="form-status-panel__header">
            <span>Last result</span>
            <strong>Latest outcome</strong>
          </div>
          <p className="section-copy">{lastResult}</p>
        </article>

        <div className="form-status-history">
          {dispatches.map((dispatch) => (
            <article key={dispatch.id} className="form-status-history-card">
              <strong>{dispatch.subject}</strong>
              <p>
                {intentLabels[dispatch.intent]} for {getAudienceLabel(dispatch.audience)}
              </p>
              <div className="sample-card__meta">
                <span>{dispatch.submittedAt}</span>
                <span>{dispatch.durationLabel}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
