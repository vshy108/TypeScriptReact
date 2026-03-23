import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ReleaseRolloutPauseResumePanel from './ReleaseRolloutPauseResumePanel'
import {
  releasePauseFetchDelayMs,
  releasePauseMutationDelayMs,
  releasePauseTickMs,
  resetReleaseRolloutPauseResumeMockState,
} from './client'

async function flushFetch() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(releasePauseFetchDelayMs)
  })
}

async function flushMutation() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(releasePauseMutationDelayMs)
  })
}

async function advanceTick() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(releasePauseTickMs)
  })

  await flushFetch()
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

    await flushFetch()

    fireEvent.click(screen.getByRole('button', { name: 'Start rollout' }))

    await flushMutation()

    fireEvent.click(screen.getByRole('button', { name: 'Pause at active checkpoint' }))

    await flushMutation()

    fireEvent.click(screen.getByRole('button', { name: 'Resume with manual override' }))

    await flushMutation()

    expect(screen.getByText(/All acknowledgements must be complete before resuming./i)).toBeTruthy()
    expect(screen.getByText(/Paused at 10% traffic while operator checks service saturation./i)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Acknowledge SRE on-call/i }))

    await flushMutation()

    fireEvent.click(screen.getByRole('button', { name: /Acknowledge Support lead/i }))

    await flushMutation()

    fireEvent.click(screen.getByRole('button', { name: 'Resume with manual override' }))

    await flushMutation()

    await advanceTick()
    await advanceTick()
    await advanceTick()

    expect(screen.getByText(/Resumed rollout with manual override after all acknowledgements were complete./i)).toBeTruthy()
    expect(screen.getByRole('heading', { level: 4, name: 'Completed' })).toBeTruthy()
  })

  it('records the paused checkpoint and manual override on resume', async () => {
    render(<ReleaseRolloutPauseResumePanel />)

    await flushFetch()

    fireEvent.click(screen.getByRole('button', { name: 'Start rollout' }))

    await flushMutation()

    fireEvent.click(screen.getByRole('button', { name: 'Pause at active checkpoint' }))

    await flushMutation()

    expect(screen.getByText(/Paused at 10% traffic while operator checks service saturation./i)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Acknowledge SRE on-call/i }))

    await flushMutation()

    fireEvent.click(screen.getByRole('button', { name: /Acknowledge Support lead/i }))

    await flushMutation()

    fireEvent.click(screen.getByRole('button', { name: 'Resume with manual override' }))

    await flushMutation()

    expect(screen.getByText(/Resumed at 10% traffic after operator acknowledgement and manual override./i)).toBeTruthy()
    expect(screen.getByText(/Manual override recorded on the current run./i)).toBeTruthy()
  })
})