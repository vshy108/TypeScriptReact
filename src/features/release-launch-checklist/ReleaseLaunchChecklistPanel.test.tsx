import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ReleaseLaunchChecklistPanel from './ReleaseLaunchChecklistPanel'
import {
  launchChecklistFetchDelayMs,
  launchChecklistSaveDelayMs,
  resetLaunchChecklistMockState,
} from './client'

describe('release launch multi-step workflow', () => {
  beforeEach(() => {
    resetLaunchChecklistMockState()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('saves the first step and unlocks the second step', async () => {
    render(<ReleaseLaunchChecklistPanel />)

    await act(async () => {
      vi.advanceTimersByTime(launchChecklistFetchDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByRole('button', { name: 'Open - Publish the status update' }).hasAttribute('disabled')).toBe(true)

    fireEvent.change(screen.getByLabelText('Step note'), {
      target: { value: 'Freeze the release window and confirm the on-call rotation is aligned.' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Save step' }))

    await act(async () => {
      vi.advanceTimersByTime(launchChecklistSaveDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByText('Saved Freeze the release window.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Open - Publish the status update' }).hasAttribute('disabled')).toBe(false)
    expect(screen.getByRole('heading', { level: 4, name: 'Publish the status update' })).toBeTruthy()
  })

  it('rejects a later step if the required keyword is missing', async () => {
    render(<ReleaseLaunchChecklistPanel />)

    await act(async () => {
      vi.advanceTimersByTime(launchChecklistFetchDelayMs)
      await Promise.resolve()
    })

    fireEvent.change(screen.getByLabelText('Step note'), {
      target: { value: 'Freeze the release window and confirm the on-call rotation is aligned.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save step' }))

    await act(async () => {
      vi.advanceTimersByTime(launchChecklistSaveDelayMs)
      await Promise.resolve()
    })

    fireEvent.change(screen.getByLabelText('Step note'), {
      target: { value: 'Publish the customer update in chat and the release room.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save step' }))

    await act(async () => {
      vi.advanceTimersByTime(launchChecklistSaveDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByText('The status step must mention the status update explicitly.')).toBeTruthy()
  })
})