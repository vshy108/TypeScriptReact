import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ReleaseReviewThreadsPanel from './ReleaseReviewThreadsPanel'
import {
  releaseReviewFetchDelayMs,
  releaseReviewMutationDelayMs,
  resetReleaseReviewThreadsMockState,
} from './client'

describe('release review threads and approvals', () => {
  beforeEach(() => {
    resetReleaseReviewThreadsMockState()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('adds a blocking review thread and keeps publish disabled', async () => {
    render(<ReleaseReviewThreadsPanel />)

    await act(async () => {
      vi.advanceTimersByTime(releaseReviewFetchDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Simulate legal review' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseReviewMutationDelayMs)
      await Promise.resolve()
    })

    expect(
      screen.getByText('Please explicitly state that mitigation is confirmed before this customer update goes out.'),
    ).toBeTruthy()
    expect(screen.getByText(/changes-requested/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Publish candidate' }).hasAttribute('disabled')).toBe(true)
  })

  it('resolves review threads, records approvals, and publishes the candidate', async () => {
    render(<ReleaseReviewThreadsPanel />)

    await act(async () => {
      vi.advanceTimersByTime(releaseReviewFetchDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Simulate legal review' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseReviewMutationDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Resolve first thread' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseReviewMutationDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Approve Legal reviewer' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseReviewMutationDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Publish candidate' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseReviewMutationDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByText(/Published review candidate revision/i)).toBeTruthy()
    expect(screen.getByText(/published revision/i)).toBeTruthy()
  })
})