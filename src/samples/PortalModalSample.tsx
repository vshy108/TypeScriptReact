import { useEffect, useRef, useState } from 'react'
import { createPortal, flushSync } from 'react-dom'

type ToastMode = 'normal' | 'sync'
type ToastId = `toast-${number}`

interface ToastRecord {
  readonly id: ToastId
  readonly title: string
  readonly description: string
  readonly mode: ToastMode
}

const modalChecklist = [
  'Render the dialog outside the sample card so stacking and clipping stay predictable.',
  'Keep the toast host separate from the modal host to show multiple portal targets.',
  'Compare immediate DOM reads after a normal batched update versus a flushSync update.',
] as const

let nextToastNumber = 1

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

function createToast(mode: ToastMode, visibleCount: number): ToastRecord {
  return {
    id: `toast-${nextToastNumber++}` as ToastId,
    title: mode === 'sync' ? 'flushSync toast' : 'Batched toast',
    description:
      mode === 'sync'
        ? `The count was forced to commit before the DOM read. Visible total is now ${visibleCount}.`
        : `This enqueue stayed batched, so the immediate DOM read still saw the old count before commit.`,
    mode,
  }
}

function usePortalHost(className: string, label: string) {
  const [host] = useState<HTMLElement | null>(() => {
    if (typeof document === 'undefined') {
      return null
    }

    const element = document.createElement('div')
    element.className = className
    element.dataset.portalHost = label
    return element
  })

  useEffect(() => {
    if (!host) {
      return
    }

    document.body.appendChild(host)

    return () => {
      host.remove()
    }
  }, [host])

  return host
}

function ModalPortal({
  host,
  onClose,
}: {
  readonly host: HTMLElement | null
  readonly onClose: () => void
}) {
  if (!host) {
    return null
  }

  return createPortal(
    <div className="portal-backdrop" onClick={onClose}>
      <section
        className="portal-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="portal-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="portal-modal__header">
          <div>
            <p className="eyebrow">Portal dialog</p>
            <h4 id="portal-modal-title">Release coordination modal</h4>
          </div>
          <button type="button" className="secondary-button" onClick={onClose}>
            Close
          </button>
        </div>

        <p className="section-copy">
          The modal is mounted under a dedicated body-level host, not inside the sample card. That
          keeps overlays, focus traps, and stacking contexts separate from the normal layout tree.
        </p>

        <ul className="summary-list">
          {modalChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>,
    host,
  )
}

function ToastPortal({
  host,
  toasts,
  onDismiss,
}: {
  readonly host: HTMLElement | null
  readonly toasts: readonly ToastRecord[]
  readonly onDismiss: (toastId: ToastId) => void
}) {
  if (!host) {
    return null
  }

  return createPortal(
    <div className="portal-toast-stack" aria-live="polite">
      {toasts.map((toast) => (
        <article key={toast.id} className={`portal-toast portal-toast--${toast.mode}`}>
          <div className="portal-toast__header">
            <strong>{toast.title}</strong>
            <button type="button" className="secondary-button" onClick={() => onDismiss(toast.id)}>
              Dismiss
            </button>
          </div>
          <p>{toast.description}</p>
        </article>
      ))}
    </div>,
    host,
  )
}

export default function PortalModalSample() {
  const [modalOpen, setModalOpen] = useState(false)
  const [toasts, setToasts] = useState<readonly ToastRecord[]>([])
  const [eventLog, setEventLog] = useState<readonly string[]>([
    'Queue a batched toast and then a flushSync toast to compare the immediate count read.',
  ])
  const toastCountRef = useRef<HTMLSpanElement>(null)
  const modalHost = usePortalHost('portal-modal-host', 'modal')
  const toastHost = usePortalHost('portal-toast-host', 'toast')

  useEffect(() => {
    if (!modalOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [modalOpen])

  function pushLog(message: string) {
    setEventLog((currentLog) => [`${formatTime(new Date())} - ${message}`, ...currentLog].slice(0, 5))
  }

  function dismissToast(toastId: ToastId) {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId))
  }

  // flushSync is only used here so the sample can compare a forced commit against normal batching.
  function enqueueToast(mode: ToastMode) {
    if (mode === 'sync') {
      flushSync(() => {
        setToasts((currentToasts) => [
          createToast('sync', currentToasts.length + 1),
          ...currentToasts,
        ].slice(0, 4))
      })

      pushLog(`flushSync observed count ${toastCountRef.current?.textContent ?? 'missing'} right after enqueue.`)
      return
    }

    setToasts((currentToasts) => [
      createToast('normal', currentToasts.length + 1),
      ...currentToasts,
    ].slice(0, 4))
    pushLog(`Batched enqueue observed count ${toastCountRef.current?.textContent ?? 'missing'} before commit.`)
  }

  return (
    <div className="portal-sample">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Portal-based modal and toast system</h3>
      </div>

      <p className="section-copy">
        This sample focuses on <code>createPortal</code> and <code>flushSync</code>. The modal and
        toast layers render into body-level hosts, while the log compares a normal batched update
        against a forced synchronous commit.
      </p>

      <div className="portal-toolbar">
        <button type="button" className="primary-button" onClick={() => setModalOpen(true)}>
          Open modal portal
        </button>
        <button type="button" className="secondary-button" onClick={() => enqueueToast('normal')}>
          Queue batched toast
        </button>
        <button type="button" className="secondary-button" onClick={() => enqueueToast('sync')}>
          Queue flushSync toast
        </button>
        <button type="button" className="secondary-button" onClick={() => setToasts([])}>
          Clear toasts
        </button>
      </div>

      <div className="portal-summary">
        <article className="portal-stat">
          <span>Modal state</span>
          <strong>{modalOpen ? 'Open' : 'Closed'}</strong>
        </article>
        <article className="portal-stat">
          <span>Visible toasts</span>
          <strong ref={toastCountRef}>{toasts.length}</strong>
        </article>
        <article className="portal-stat">
          <span>Portal hosts</span>
          <strong>{modalHost && toastHost ? 'Ready' : 'Mounting...'}</strong>
        </article>
      </div>

      <div className="portal-layout">
        <article className="portal-panel">
          <span className="eyebrow">Host layer</span>
          <p>
            Both overlays live outside the sample tree. The modal host handles the backdrop and
            dialog, while the toast host owns its own fixed stack in the page corner.
          </p>

          <dl className="portal-host-list">
            <div>
              <dt>Modal host</dt>
              <dd>{modalHost ? 'Mounted in document.body' : 'Waiting for effect setup'}</dd>
            </div>
            <div>
              <dt>Toast host</dt>
              <dd>{toastHost ? 'Mounted in document.body' : 'Waiting for effect setup'}</dd>
            </div>
          </dl>
        </article>

        <article className="portal-panel">
          <span className="eyebrow">Observation log</span>
          <div className="portal-log">
            {eventLog.map((entry) => (
              <p key={entry}>{entry}</p>
            ))}
          </div>
        </article>
      </div>

      <ModalPortal host={modalHost} onClose={() => setModalOpen(false)} />
      <ToastPortal host={toastHost} toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
