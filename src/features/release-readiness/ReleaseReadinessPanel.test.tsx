import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ReleaseReadinessPanel from './ReleaseReadinessPanel'
import { releaseReadinessDelayMs, resetReleaseReadinessMockState } from './client'

describe('release readiness feature slice', () => {
  beforeEach(() => {
    resetReleaseReadinessMockState()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('loads the default release and switches details when a different release is selected', async () => {
    render(<ReleaseReadinessPanel />)

    expect(screen.getByText('Loading release readiness snapshot...')).toBeTruthy()

    await act(async () => {
      vi.advanceTimersByTime(releaseReadinessDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByRole('heading', { level: 3, name: 'Release readiness feature slice' })).toBeTruthy()
    expect(screen.getByText('Snapshot revision: 1', { exact: false })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 4, name: 'Frontend platform' })).toBeTruthy()

    fireEvent.change(screen.getByLabelText('Active release'), {
      target: { value: 'release-2' },
    })

    expect(screen.getByRole('heading', { level: 4, name: 'Design systems' })).toBeTruthy()
    expect(screen.getByText('VoiceOver regression testing is not yet complete on Safari 18.')).toBeTruthy()
  })

  it('refreshes the snapshot and increments the visible revision', async () => {
    render(<ReleaseReadinessPanel />)

    await act(async () => {
      vi.advanceTimersByTime(releaseReadinessDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Refresh snapshot' }))

    expect(screen.getByRole('button', { name: 'Refreshing snapshot...' })).toBeTruthy()

    await act(async () => {
      vi.advanceTimersByTime(releaseReadinessDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByText('Snapshot revision: 2', { exact: false })).toBeTruthy()

    const approvalChecklist = screen.getByRole('region', { name: 'Approval checklist' })
    expect(within(approvalChecklist).getByText('Operational readiness review')).toBeTruthy()
    expect(within(approvalChecklist).getByText(/latest dashboard threshold sync/i)).toBeTruthy()
  })
})
