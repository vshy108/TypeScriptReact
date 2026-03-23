import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ReleaseRolloutReconciliationPanel from './ReleaseRolloutReconciliationPanel'
import {
  releaseRolloutFetchDelayMs,
  releaseRolloutPollIntervalMs,
  releaseRolloutReconcileDelayMs,
  releaseRolloutSaveDelayMs,
  resetReleaseRolloutReconciliationMockState,
} from './client'

describe('release rollout reconciliation', () => {
  beforeEach(() => {
    resetReleaseRolloutReconciliationMockState()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('shows optimistic client state immediately after a promotion request', async () => {
    render(<ReleaseRolloutReconciliationPanel />)

    await act(async () => {
      vi.advanceTimersByTime(releaseRolloutFetchDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getAllByRole('button', { name: 'Promote to 100%' })[0])

    expect(screen.getByText('Optimistically promoted Enterprise EU to 100%. Waiting for the next server refresh.')).toBeTruthy()
    expect(screen.getAllByText('100%')[0]).toBeTruthy()
  })

  it('reconciles the optimistic value after background refetch returns the final server rollout', async () => {
    render(<ReleaseRolloutReconciliationPanel />)

    await act(async () => {
      vi.advanceTimersByTime(releaseRolloutFetchDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getAllByRole('button', { name: 'Promote to 100%' })[0])

    await act(async () => {
      vi.advanceTimersByTime(releaseRolloutSaveDelayMs)
      await Promise.resolve()
    })

    await act(async () => {
      vi.advanceTimersByTime(releaseRolloutPollIntervalMs + releaseRolloutFetchDelayMs)
      await Promise.resolve()
    })

    await act(async () => {
      vi.advanceTimersByTime(releaseRolloutReconcileDelayMs)
      await Promise.resolve()
    })

    await act(async () => {
      vi.advanceTimersByTime(releaseRolloutPollIntervalMs + releaseRolloutFetchDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByText('Server reconciled Enterprise EU to 92% after the optimistic promotion.')).toBeTruthy()
    expect(screen.getAllByText('92%')[0]).toBeTruthy()
  })
})