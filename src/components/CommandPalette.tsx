// This file also uses type-only imports so keyboard and ref types stay available to the checker without creating runtime imports.
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
  // useId creates stable DOM ids that match labels, inputs, and datalists without hard-coded strings.
  const inputId = useId()
  const listId = `${inputId}-suggestions`
  // useRef holds onto the input DOM node across renders without causing rerenders when it changes.
  const inputRef = useRef<HTMLInputElement>(null)

  // React 19 allows ref as a regular prop, so this component can expose a small imperative API.
  // This is the modern replacement for forwardRef(), which wrapped components in a higher-order function
  // just to receive a ref. With React 19, ref is a standard prop — no wrapper needed.
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
    // The handle only depends on the stable inputRef object, so an empty dependency list keeps
    // the exposed imperative API stable for parents instead of replacing it every render.
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
