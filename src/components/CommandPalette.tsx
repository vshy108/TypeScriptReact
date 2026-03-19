import type { KeyboardEvent, Ref } from 'react'
import { useId, useImperativeHandle, useRef } from 'react'

export interface CommandPaletteHandle {
  focus: () => void
  load: (value: string) => void
}

interface CommandPaletteProps {
  readonly ref?: Ref<CommandPaletteHandle>
  readonly suggestions: readonly string[]
  readonly onSubmit: (value: string) => void
}

export function CommandPalette({ ref, suggestions, onSubmit }: CommandPaletteProps) {
  const inputId = useId()
  const listId = `${inputId}-suggestions`
  const inputRef = useRef<HTMLInputElement>(null)

  // React 19 allows ref as a regular prop, so this component can expose a small imperative API.
  useImperativeHandle(
    ref,
    () => ({
      focus() {
        inputRef.current?.focus()
      },
      load(value) {
        if (!inputRef.current) {
          return
        }

        inputRef.current.value = value
        inputRef.current.focus()
        inputRef.current.select()
      },
    }),
    [],
  )

  // Keep submission local to the input so the sample focuses on ref and keyboard behavior.
  function handleSubmit(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') {
      return
    }

    const value = event.currentTarget.value.trim()

    if (!value) {
      return
    }

    onSubmit(value)
    event.currentTarget.select()
  }

  return (
    <div className="command-palette">
      <label htmlFor={inputId}>Command palette</label>
      <input
        ref={inputRef}
        id={inputId}
        list={listId}
        type="text"
        placeholder="Press Enter to log a command"
        onKeyDown={handleSubmit}
      />
      <datalist id={listId}>
        {suggestions.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>
      <p>React 19 lets this component accept a typed <code>ref</code> prop directly.</p>
    </div>
  )
}
