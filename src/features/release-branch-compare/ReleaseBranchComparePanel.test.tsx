import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ReleaseBranchComparePanel from './ReleaseBranchComparePanel'
import {
  releaseBranchFetchDelayMs,
  releaseBranchMutationDelayMs,
  resetReleaseBranchCompareMockState,
} from './client'

describe('release branch compare view', () => {
  beforeEach(() => {
    resetReleaseBranchCompareMockState()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('switches to an alternate branch and shows the wording differences', async () => {
    render(<ReleaseBranchComparePanel />)

    await act(async () => {
      vi.advanceTimersByTime(releaseBranchFetchDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: /Support-forward branch/i }))

    await act(async () => {
      vi.advanceTimersByTime(releaseBranchMutationDelayMs)
      await Promise.resolve()
    })

    expect(screen.getAllByText('Different wording').length).toBe(2)
    expect(screen.getByText(/Comparing Support-forward branch against the current primary branch./i)).toBeTruthy()
  })

  it('promotes the compared branch to the new primary draft', async () => {
    render(<ReleaseBranchComparePanel />)

    await act(async () => {
      vi.advanceTimersByTime(releaseBranchFetchDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: /Support-forward branch/i }))

    await act(async () => {
      vi.advanceTimersByTime(releaseBranchMutationDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Promote compared branch' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseBranchMutationDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByText(/Promoted Support-forward branch to the new primary release draft./i)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Current primary branch' })).toBeTruthy()
  })
})