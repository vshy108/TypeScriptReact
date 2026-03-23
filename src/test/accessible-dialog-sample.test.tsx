import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AccessibleDialogSample from '../samples/AccessibleDialogSample'

describe('accessible dialog sample', () => {
  it('moves focus into the dialog and returns it to the trigger on Escape', () => {
    render(<AccessibleDialogSample />)

    const trigger = screen.getByRole('button', { name: 'Open accessible dialog' })
    trigger.focus()

    fireEvent.click(trigger)

    expect(screen.getByRole('dialog', { name: 'Release approval dialog' })).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Choose Design ops reviewer' }))

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('dialog', { name: 'Release approval dialog' })).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('traps Tab from the last control back to the first control', () => {
    render(<AccessibleDialogSample />)

    fireEvent.click(screen.getByRole('button', { name: 'Open accessible dialog' }))

    const firstControl = screen.getByRole('button', { name: 'Choose Design ops reviewer' })
    const lastControl = screen.getByRole('button', { name: 'Confirm reviewer' })

    lastControl.focus()
    fireEvent.keyDown(document, { key: 'Tab' })

    expect(document.activeElement).toBe(firstControl)
  })
})