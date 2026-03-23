import { useCallback, useEffect, useId, useRef, useState } from 'react'

const reviewerOptions = [
  'Design ops',
  'Frontend platform',
  'Release captain',
] as const

const accessibilityChecklist = [
  'The dialog is labeled with aria-labelledby and aria-describedby.',
  'Focus moves into the dialog when it opens and returns to the trigger when it closes.',
  'Tab stays trapped inside the dialog until the dialog is dismissed.',
  'Escape closes the dialog without requiring the pointer.',
] as const

const focusableSelector = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

export default function AccessibleDialogSample() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedReviewer, setSelectedReviewer] = useState<(typeof reviewerOptions)[number]>(
    reviewerOptions[0],
  )
  const [activityLog, setActivityLog] = useState<readonly string[]>([
    'Open the dialog, move through the controls with Tab, then close it with Escape or the footer buttons.',
  ])
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const firstActionRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  const pushLog = useCallback((message: string) => {
    setActivityLog((currentLog) => [`${formatTime(new Date())} - ${message}`, ...currentLog].slice(0, 5))
  }, [])

  const closeDialog = useCallback((reason: string) => {
    setIsOpen(false)
    pushLog(reason)
  }, [pushLog])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    const triggerElement = triggerRef.current
    document.body.style.overflow = 'hidden'
    firstActionRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (!dialogRef.current) {
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        closeDialog('Closed the dialog with Escape and restored focus to the trigger.')
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      )

      if (!focusableElements.length) {
        event.preventDefault()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (!firstElement || !lastElement) {
        return
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      triggerElement?.focus()
    }
  }, [closeDialog, isOpen])

  return (
    <div className="accessible-dialog-sample">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Accessible dialog and focus management</h3>
      </div>

      <p className="section-copy">
        This sample is aimed at frontend interview prep: it demonstrates a labeled dialog,
        keyboard dismissal, focus trapping, and focus return after close.
      </p>

      <div className="accessible-dialog__summary">
        <article className="portal-stat">
          <span>Dialog state</span>
          <strong>{isOpen ? 'Open' : 'Closed'}</strong>
        </article>
        <article className="portal-stat">
          <span>Selected reviewer</span>
          <strong>{selectedReviewer}</strong>
        </article>
      </div>

      <div className="accessible-dialog__toolbar">
        <button
          ref={triggerRef}
          type="button"
          className="primary-button"
          onClick={() => {
            setIsOpen(true)
            pushLog('Opened the dialog from the trigger button.')
          }}
        >
          Open accessible dialog
        </button>
      </div>

      <ul className="summary-list accessible-dialog__checklist">
        {accessibilityChecklist.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <div className="portal-log accessible-dialog__log">
        {activityLog.map((entry) => (
          <p key={entry}>{entry}</p>
        ))}
      </div>

      {isOpen ? (
        <div className="portal-backdrop" role="presentation" onClick={() => closeDialog('Closed the dialog by clicking the backdrop.') }>
          <section
            ref={dialogRef}
            className="portal-modal accessible-dialog__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="section-heading">
              <p className="eyebrow">Accessible modal</p>
              <h4 id={titleId}>Release approval dialog</h4>
            </div>

            <p id={descriptionId} className="section-copy">
              Choose the reviewer who will sign off the release checklist. This dialog keeps
              keyboard focus inside until you confirm or cancel.
            </p>

            <div className="accessible-dialog__reviewers" role="group" aria-label="Reviewer options">
              {reviewerOptions.map((reviewer, index) => (
                <button
                  key={reviewer}
                  ref={index === 0 ? firstActionRef : undefined}
                  type="button"
                  className={`filter-button ${selectedReviewer === reviewer ? 'is-selected' : ''}`}
                  aria-pressed={selectedReviewer === reviewer}
                  onClick={() => {
                    setSelectedReviewer(reviewer)
                    pushLog(`Selected ${reviewer} as the current reviewer.`)
                  }}
                >
                  {`Choose ${reviewer} reviewer`}
                </button>
              ))}
            </div>

            <div className="accessible-dialog__actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => closeDialog('Cancelled the dialog and returned focus to the trigger.')}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => closeDialog(`Confirmed ${selectedReviewer} as the release reviewer.`)}
              >
                Confirm reviewer
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}