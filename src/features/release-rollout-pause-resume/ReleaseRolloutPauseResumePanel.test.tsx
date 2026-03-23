import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ReleaseRolloutPauseResumePanel from './ReleaseRolloutPauseResumePanel'
import {
  releasePauseFetchDelayMs,
  releasePauseMutationDelayMs,
  releasePauseTickMs,
  resetReleaseRolloutPauseResumeMockState,
} from './client'

async function advanceTick() {
  await act(async () => {
    vi.advanceTimersByTime(releasePauseTickMs + releasePauseFetchDelayMs)
    await Promise.resolve()
  })
}

describe('release rollout pause and resume', () => {
  beforeEach(() => {
    resetReleaseRolloutPauseResumeMockState()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('requires acknowledgements before resuming and then completes the rollout', async () => {
    render(<ReleaseRolloutPauseResumePanel />)

    await act(async () => {
      vi.advanceTimersByTime(releasePauseFetchDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Start rollout' }))

    await act(async () => {
      vi.advanceTimersByTime(releasePauseMutationDelayMs)
      await Promise.resolve()
    })

    await advanceTick()

    fireEvent.click(screen.getByRole('button', { name: 'Pause at active checkpoint' }))

    await act(async () => {
      vi.advanceTimersByTime(releasePauseMutationDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Resume with manual override' }))

    await act(async () => {
      vi.advanceTimersByTime(releasePauseMutationDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByText(/All acknowledgements must be complete before resuming./i)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Acknowledge SRE on-call/i }))

    await act(async () => {
      vi.advanceTimersByTime(releasePauseMutationDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: /Acknowledge Support lead/i }))

    await act(async () => {
      vi.advanceTimersByTime(releasePauseMutationDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Resume with manual override' }))

    await act(async () => {
      vi.advanceTimersByTime(releasePauseMutationDelayMs)
      await Promise.resolve()
    })

    await advanceTick()
    await advanceTick()

    expect(screen.getByText(/Resumed rollout with manual override after all acknowledgements were complete./i)).toBeTruthy()
    expect(screen.getByText(/Completed rollout after a paused checkpoint and manual override recovery./i)).toBeTruthy()
  })

  it('records the paused checkpoint and manual override on resume', async () => {
    render(<ReleaseRolloutPauseResumePanel />)

    await act(async () => {
      vi.advanceTimersByTime(releasePauseFetchDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Start rollout' }))

    await act(async () => {
      vi.advanceTimersByTime(releasePauseMutationDelayMs)
      await Promise.resolve()
    })

    await advanceTick()

    fireEvent.click(screen.getByRole('button', { name: 'Pause at active checkpoint' }))

    await act(async () => {
      vi.advanceTimersByTime(releasePauseMutationDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByText(/Paused at 50% traffic while operator checks service saturation./i)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Acknowledge SRE on-call/i }))

    await act(async () => {
      vi.advanceTimersByTime(releasePauseMutationDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: /Acknowledge Support lead/i }))

    await act(async () => {
      vi.advanceTimersByTime(releasePauseMutationDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Resume with manual override' }))

    await act(async () => {
      vi.advanceTimersByTime(releasePauseMutationDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByText(/Resumed at 50% traffic after operator acknowledgement and manual override./i)).toBeTruthy()
    expect(screen.getByText(/Manual override recorded on the current run./i)).toBeTruthy()
  })
}