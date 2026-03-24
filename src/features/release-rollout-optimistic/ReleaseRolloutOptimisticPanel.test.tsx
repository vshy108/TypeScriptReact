import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ReleaseRolloutOptimisticPanel from './ReleaseRolloutOptimisticPanel'
import {
  resetRolloutOptimisticMockState,
  rolloutResolveDelayMs,
  rolloutWorkspaceFetchDelayMs,
} from './client'

describe('release rollout optimistic updates', () => {
  beforeEach(() => {
    resetRolloutOptimisticMockState()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('removes a blocker immediately and keeps it gone after a successful save', async () => {
    render(<ReleaseRolloutOptimisticPanel />)

    await act(async () => {
      vi.advanceTimersByTime(rolloutWorkspaceFetchDelayMs)
      await Promise.resolve()
    })

    const blockerTitle = 'Router cache trace needs one more healthy canary cycle'
    fireEvent.change(screen.getByLabelText(`Resolution note for ${blockerTitle}`), {
      target: { value: 'Resolved after the canary review completed and mitigation steps were documented.' },
    })

    fireEvent.click(screen.getAllByRole('button', { name: 'Resolve optimistically' })[0]!)

    expect(screen.queryByText(blockerTitle)).toBeNull()

    await act(async () => {
      vi.advanceTimersByTime(rolloutResolveDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByText(`Resolved ${blockerTitle}.`)).toBeTruthy()
    expect(screen.queryByText(blockerTitle)).toBeNull()
  })

  it('rolls a blocker back into the list when validation rejects the optimistic mutation', async () => {
    render(<ReleaseRolloutOptimisticPanel />)

    await act(async () => {
      vi.advanceTimersByTime(rolloutWorkspaceFetchDelayMs)
      await Promise.resolve()
    })

    const blockerTitle = 'VoiceOver regression still needs an escalation sign-off before rollout'
    fireEvent.change(screen.getByLabelText(`Resolution note for ${blockerTitle}`), {
      target: { value: 'Resolved after review completed without extra work.' },
    })

    fireEvent.click(screen.getAllByRole('button', { name: 'Resolve optimistically' })[1]!)

    expect(screen.queryByText(blockerTitle)).toBeNull()

    await act(async () => {
      vi.advanceTimersByTime(rolloutResolveDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByText('This blocker requires an escalation note before it can stay resolved.')).toBeTruthy()
    expect(screen.getByText(blockerTitle)).toBeTruthy()
  })
})