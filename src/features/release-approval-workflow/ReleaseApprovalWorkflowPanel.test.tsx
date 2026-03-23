import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ReleaseApprovalWorkflowPanel from './ReleaseApprovalWorkflowPanel'
import {
  releaseApprovalFetchDelayMs,
  releaseApprovalSaveDelayMs,
  resetReleaseApprovalMockState,
} from './client'

describe('release approval mutation workflow', () => {
  beforeEach(() => {
    resetReleaseApprovalMockState()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('submits a mutation and updates the persisted workflow state', async () => {
    render(<ReleaseApprovalWorkflowPanel />)

    await act(async () => {
      vi.advanceTimersByTime(releaseApprovalFetchDelayMs)
      await Promise.resolve()
    })

    fireEvent.change(screen.getByLabelText('Release for review'), {
      target: { value: 'release-3' },
    })

    fireEvent.change(screen.getByLabelText('Decision'), {
      target: { value: 'approve' },
    })
    fireEvent.change(screen.getByLabelText('Rollout percent'), {
      target: { value: '85' },
    })
    fireEvent.change(screen.getByLabelText('Decision note'), {
      target: { value: 'Approve the rollout with the recovery runbook linked in the incident plan.' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Save decision' }))

    expect(screen.getByRole('button', { name: 'Saving decision...' })).toBeTruthy()

    await act(async () => {
      vi.advanceTimersByTime(releaseApprovalSaveDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByText('Saved decision for Offline sync stabilization.')).toBeTruthy()

    const persistedState = screen.getByRole('region', { name: 'Persisted workflow state' })
    expect(within(persistedState).getByText('Approve')).toBeTruthy()
    expect(within(persistedState).getByText('85%')).toBeTruthy()
    expect(within(persistedState).getByText(/recovery runbook linked/i)).toBeTruthy()
  })

  it('shows the server-style validation error for invalid rollback notes', async () => {
    render(<ReleaseApprovalWorkflowPanel />)

    await act(async () => {
      vi.advanceTimersByTime(releaseApprovalFetchDelayMs)
      await Promise.resolve()
    })

    fireEvent.change(screen.getByLabelText('Decision'), {
      target: { value: 'rollback' },
    })
    fireEvent.change(screen.getByLabelText('Decision note'), {
      target: { value: 'Too short' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Save decision' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseApprovalSaveDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByText('Rollback decisions need a note of at least 20 characters.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Save decision' })).toBeTruthy()
  })
})