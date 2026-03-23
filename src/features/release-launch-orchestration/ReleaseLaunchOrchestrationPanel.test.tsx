import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ReleaseLaunchOrchestrationPanel from './ReleaseLaunchOrchestrationPanel'
import {
  releaseLaunchFetchDelayMs,
  releaseLaunchMutationDelayMs,
  releaseLaunchTickMs,
  resetReleaseLaunchOrchestrationMockState,
} from './client'

async function advanceTick() {
  await act(async () => {
    vi.advanceTimersByTime(releaseLaunchTickMs + releaseLaunchFetchDelayMs)
    await Promise.resolve()
  })
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

    await act(async () => {
      vi.advanceTimersByTime(releaseLaunchFetchDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Start progressive rollout' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseLaunchMutationDelayMs)
      await Promise.resolve()
    })

    await advanceTick()
    await advanceTick()
    await advanceTick()

    expect(screen.getByText(/Completed progressive rollout through all checkpoints./i)).toBeTruthy()
    expect(screen.getByText(/Checkpoint cleared at 100% traffic without triggering guardrails./i)).toBeTruthy()
    expect(screen.getByText('healthy')).toBeTruthy()
  })

  it('automatically aborts when the guardrail breach is armed', async () => {
    render(<ReleaseLaunchOrchestrationPanel />)

    await act(async () => {
      vi.advanceTimersByTime(releaseLaunchFetchDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Start progressive rollout' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseLaunchMutationDelayMs)
      await Promise.resolve()
    })

    await advanceTick()

    fireEvent.click(screen.getByRole('button', { name: 'Arm abort condition' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseLaunchMutationDelayMs)
      await Promise.resolve()
    })

    await advanceTick()

    expect(screen.getByText(/Checkout error rate crossed the 2.0% abort threshold during Regional 25%./i)).toBeTruthy()
    expect(screen.getByText(/Automatic abort triggered during Regional 25%./i)).toBeTruthy()
    expect(screen.getByText('breached')).toBeTruthy()
  })
}