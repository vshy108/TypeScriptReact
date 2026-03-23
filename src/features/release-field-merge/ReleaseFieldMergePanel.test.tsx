import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ReleaseFieldMergePanel from './ReleaseFieldMergePanel'
import { releaseMergeFetchDelayMs, releaseMergeSaveDelayMs, resetReleaseFieldMergeMockState } from './client'

describe('release field-level merge resolution', () => {
  beforeEach(() => {
    resetReleaseFieldMergeMockState()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('auto-merges untouched fields and leaves overlapping fields for resolution', async () => {
    render(<ReleaseFieldMergePanel />)

    await act(async () => {
      vi.advanceTimersByTime(releaseMergeFetchDelayMs)
      await Promise.resolve()
    })

    fireEvent.change(screen.getByLabelText('Summary draft'), {
      target: {
        value: 'We paused the rollout, engaged the incident team, and I am drafting the next customer update while mitigation continues.',
      },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Simulate teammate update' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseMergeFetchDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByDisplayValue('Mitigation is confirmed and the rollout remains paused.')).toBeTruthy()
    expect(screen.getByText('summary')).toBeTruthy()
  })

  it('resolves the conflicting field and saves the merged draft', async () => {
    render(<ReleaseFieldMergePanel />)

    await act(async () => {
      vi.advanceTimersByTime(releaseMergeFetchDelayMs)
      await Promise.resolve()
    })

    fireEvent.change(screen.getByLabelText('Summary draft'), {
      target: {
        value: 'We paused the rollout, engaged the incident team, and I am drafting the next customer update while mitigation continues.',
      },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Simulate teammate update' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseMergeFetchDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Keep local summary' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save merged draft' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseMergeSaveDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByText(/Saved merged draft revision/i)).toBeTruthy()
  })
})