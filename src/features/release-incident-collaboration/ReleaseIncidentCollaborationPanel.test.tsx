import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ReleaseIncidentCollaborationPanel from './ReleaseIncidentCollaborationPanel'
import {
  releaseIncidentFetchDelayMs,
  releaseIncidentSaveDelayMs,
  resetReleaseIncidentCollaborationMockState,
} from './client'

describe('release incident collaborative editing', () => {
  beforeEach(() => {
    resetReleaseIncidentCollaborationMockState()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('shows collaborator presence updates and detects a conflict after a teammate edit', async () => {
    render(<ReleaseIncidentCollaborationPanel />)

    await act(async () => {
      vi.advanceTimersByTime(releaseIncidentFetchDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByText('Mina')).toBeTruthy()

    fireEvent.change(screen.getByLabelText('Shared incident summary'), {
      target: {
        value: 'We identified elevated error rates in the rollout region, paused the rollout, and I am updating the customer communication timeline now.',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Simulate teammate edit' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseIncidentFetchDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByText('Jordan')).toBeTruthy()
    expect(
      screen.getByText('A teammate changed the shared incident draft while you were editing. Reload the latest version before saving again.'),
    ).toBeTruthy()
  })

  it('reloads the latest draft after a teammate edit and then saves successfully', async () => {
    render(<ReleaseIncidentCollaborationPanel />)

    await act(async () => {
      vi.advanceTimersByTime(releaseIncidentFetchDelayMs)
      await Promise.resolve()
    })

    fireEvent.change(screen.getByLabelText('Shared incident summary'), {
      target: {
        value: 'We identified elevated error rates in the rollout region, paused the rollout, and I am updating the customer communication timeline now.',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Simulate teammate edit' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseIncidentFetchDelayMs)
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Reload latest draft' }))
    expect(screen.getByText('Reloaded the latest shared draft from the server.')).toBeTruthy()

    fireEvent.change(screen.getByLabelText('Shared incident summary'), {
      target: {
        value: 'We identified elevated error rates in the rollout region, paused the rollout, confirmed mitigation, and published the next customer-facing incident update.',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save shared draft' }))

    await act(async () => {
      vi.advanceTimersByTime(releaseIncidentSaveDelayMs)
      await Promise.resolve()
    })

    expect(screen.getByText(/Saved shared draft revision/i)).toBeTruthy()
  })
})