import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ReleaseChangeHistoryPanel from './ReleaseChangeHistoryPanel'
import {
  releaseHistoryFetchDelayMs,
  releaseHistoryMutationDelayMs,
  resetReleaseChangeHistoryMockState,
} from './client'

describe('release audit history and undo', () => {
  beforeEach(() => {
    resetReleaseChangeHistoryMockState()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('captures change attribution when a teammate updates the shared release copy', async () => {
    render(<ReleaseChangeHistoryPanel />)

    await act(async () => {
      vi.advanceTimersByTime(releaseHistoryFetchDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Simulate teammate change' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseHistoryMutationDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByText('Updated customer-facing wording with support guidance - revision 2')).toBeTruthy()
  })

  it('undoes the most recent change and restores the prior revision', async () => {
    render(<ReleaseChangeHistoryPanel />)

    await act(async () => {
      vi.advanceTimersByTime(releaseHistoryFetchDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Simulate teammate change' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseHistoryMutationDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Undo latest change' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseHistoryMutationDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByText(/Undid the latest change and restored revision 1/i)).toBeTruthy()
    expect(screen.getByDisplayValue('Mitigation is confirmed and the rollout remains paused.')).toBeTruthy()
  })
})