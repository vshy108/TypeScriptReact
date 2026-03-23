import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ReleaseScheduledPublishPanel from './ReleaseScheduledPublishPanel'
import {
  releaseScheduledFetchDelayMs,
  releaseScheduledMutationDelayMs,
  releaseScheduledTickMs,
  resetReleaseScheduledPublishMockState,
} from './client'

describe('release scheduled publish state', () => {
  beforeEach(() => {
    resetReleaseScheduledPublishMockState()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('requires approvals before publish can be scheduled', async () => {
    render(<ReleaseScheduledPublishPanel />)

    await act(async () => {
      vi.advanceTimersByTime(releaseScheduledFetchDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByRole('button', { name: 'Schedule publish' }).hasAttribute('disabled')).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: 'Approve Legal reviewer' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseScheduledMutationDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByText('Approved Legal reviewer.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Schedule publish' }).hasAttribute('disabled')).toBe(false)
  })

  it('counts down to publish and allows rollback during the rollback window', async () => {
    render(<ReleaseScheduledPublishPanel />)

    await act(async () => {
      vi.advanceTimersByTime(releaseScheduledFetchDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Approve Legal reviewer' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseScheduledMutationDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Schedule publish' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseScheduledMutationDelayMs)
      await Promise.resolve()
    })

    await act(async () => {
      vi.advanceTimersByTime(releaseScheduledTickMs + releaseScheduledFetchDelayMs)
      await Promise.resolve()
    })

    await act(async () => {
      vi.advanceTimersByTime(releaseScheduledTickMs + releaseScheduledFetchDelayMs)
      await Promise.resolve()
    })

    await act(async () => {
      vi.advanceTimersByTime(releaseScheduledTickMs + releaseScheduledFetchDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByText(/Rollback window open/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Rollback published release' }).hasAttribute('disabled')).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: 'Rollback published release' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseScheduledMutationDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByText('Rolled back the published release during the rollback window.')).toBeTruthy()
  })
})