import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ReleaseHandoffConflictPanel from './ReleaseHandoffConflictPanel'
import {
  releaseHandoffFetchDelayMs,
  releaseHandoffSaveDelayMs,
  resetReleaseHandoffConflictMockState,
} from './client'

describe('release handoff conflict resolution', () => {
  beforeEach(() => {
    resetReleaseHandoffConflictMockState()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('detects a conflict after a background refetch updates the server version', async () => {
    render(<ReleaseHandoffConflictPanel />)

    await act(async () => {
      vi.advanceTimersByTime(releaseHandoffFetchDelayMs)
      await Promise.resolve()
    })

    fireEvent.change(screen.getByLabelText('Draft handoff note'), {
      target: { value: 'Customer support is briefed, but I still need to add the escalation matrix before the launch room closes.' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Simulate external update' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseHandoffFetchDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByText('The server version changed while you were editing. Reload the latest version before saving again.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Reload server version' }).hasAttribute('disabled')).toBe(false)
  })

  it('reloads the server version and then allows a clean save', async () => {
    render(<ReleaseHandoffConflictPanel />)

    await act(async () => {
      vi.advanceTimersByTime(releaseHandoffFetchDelayMs)
      await Promise.resolve()
    })

    fireEvent.change(screen.getByLabelText('Draft handoff note'), {
      target: { value: 'Customer support is briefed, but I still need to add the escalation matrix before the launch room closes.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Simulate external update' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseHandoffFetchDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Reload server version' }))
    expect(screen.getByText('Reloaded the latest server version into the draft.')).toBeTruthy()

    fireEvent.change(screen.getByLabelText('Draft handoff note'), {
      target: { value: 'Customer support is briefed, escalation coverage is confirmed, and the handoff note is final for rollout.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save handoff' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseHandoffSaveDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByText(/Saved handoff revision/i)).toBeTruthy()
  })
})