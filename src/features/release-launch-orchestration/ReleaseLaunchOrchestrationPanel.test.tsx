import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ReleaseLaunchOrchestrationPanel from './ReleaseLaunchOrchestrationPanel'
import {
  releaseLaunchFetchDelayMs,
  releaseLaunchMutationDelayMs,
  releaseLaunchTickMs,
  resetReleaseLaunchOrchestrationMockState,
} from './client'

async function flushFetch() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(releaseLaunchFetchDelayMs)
  })
}

async function flushMutation() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(releaseLaunchMutationDelayMs)
  })
}

async function advanceTick() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(releaseLaunchTickMs)
  })

  await flushFetch()
}

describe('release launch orchestration', () => {
  beforeEach(() => {
    resetReleaseLaunchOrchestrationMockState()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('progresses through checkpoints and completes the rollout', async () => {
    render(<ReleaseLaunchOrchestrationPanel />)

    await flushFetch()

    fireEvent.click(screen.getByRole('button', { name: 'Start progressive rollout' }))

    await flushMutation()

    await advanceTick()
    await advanceTick()
    await advanceTick()
    await advanceTick()

    expect(screen.getByRole('heading', { level: 4, name: 'Completed' })).toBeTruthy()
    expect(screen.getByText(/Checkpoint cleared at 100% traffic without triggering guardrails./i)).toBeTruthy()
    expect(screen.getAllByText(/Rollout completed cleanly with no automatic abort signal./i)).toHaveLength(2)
  })

  it('automatically aborts when the guardrail breach is armed', async () => {
    render(<ReleaseLaunchOrchestrationPanel />)

    await flushFetch()

    fireEvent.click(screen.getByRole('button', { name: 'Start progressive rollout' }))

    await flushMutation()

    await advanceTick()

    fireEvent.click(screen.getByRole('button', { name: 'Arm abort condition' }))

    await flushMutation()

    await advanceTick()

    expect(screen.getByText(/Checkout error rate crossed the 2.0% abort threshold during Regional 25%./i)).toBeTruthy()
    expect(screen.getByText(/Automatic abort triggered during Regional 25%./i)).toBeTruthy()
    expect(screen.getByRole('heading', { level: 4, name: 'Aborted' })).toBeTruthy()
    expect(screen.getByText('breached')).toBeTruthy()
  })
})