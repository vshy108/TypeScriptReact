// Ref timing and callback refs
// -----------------------------
// This sample demonstrates three important ref behaviors:
//
// 1. REF IS NULL DURING FIRST RENDER — useRef returns { current: null } and
//    the ref is only populated after React commits the DOM. Trying to read
//    ref.current during render gives null.
//
// 2. CALLBACK REFS — Instead of useRef, you can pass a function as the ref
//    prop. React calls it with the DOM node on mount and with null on unmount.
//    This is useful for measuring elements, integrating with third-party
//    libraries, or running imperative setup the moment a node appears.
//
// 3. useImperativeHandle — Exposes a custom imperative interface through a
//    ref so the parent can call methods on a child component without reaching
//    into its DOM internals.

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

type LogEntryId = `ref-log-${number}`;

interface LogEntry {
  readonly id: LogEntryId;
  readonly label: string;
  readonly detail: string;
}

let nextLogNumber = 1;

function createLog(label: string, detail: string): LogEntry {
  return { id: `ref-log-${nextLogNumber++}`, label, detail };
}

// ---------------------------------------------------------------------------
// Section 1: Ref is null during render
// ---------------------------------------------------------------------------

function RefTimingDemo() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [log, setLog] = useState<readonly LogEntry[]>([]);

  // We cannot read boxRef.current during render (react-hooks/refs rule).
  // Instead, we check it inside useEffect which runs after DOM commit.
  useEffect(() => {
    // At this point, boxRef.current is attached to the real DOM node.
    const tagName = boxRef.current
      ? `<${boxRef.current.tagName.toLowerCase()}>`
      : "null";
    // Intentional: we observe ref.current after commit to demonstrate ref timing.
    /* eslint-disable react-hooks/set-state-in-effect */
    setLog((prev) => [
      createLog(
        "useEffect",
        `ref.current is ${tagName}. DOM is now available.`,
      ),
      createLog(
        "During render",
        "ref.current cannot be read during render — it is only available after commit.",
      ),
      ...prev,
    ]);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Derive the display status from whether the effect has populated the log.
  // This avoids calling setState inside the effect for a display-only value.
  const status =
    log.length > 0 ? "attached after commit" : "(waiting for first render)";

  return (
    <article className="sample-card">
      <p className="eyebrow">Ref timing</p>
      <h4>ref.current is null during render</h4>
      <div ref={boxRef} className="ref-target-box">
        This div has a ref attached. During render, ref.current is not yet
        available — it is populated after commit. Status: {status}
      </div>
      <ul className="summary-list">
        {log.map((entry) => (
          <li key={entry.id}>
            <strong>{entry.label}</strong> — {entry.detail}
          </li>
        ))}
      </ul>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Section 2: Callback refs — called on mount (node) and unmount (null)
// ---------------------------------------------------------------------------

function CallbackRefDemo() {
  const [visible, setVisible] = useState(true);
  const [log, setLog] = useState<readonly LogEntry[]>([
    createLog("Ready", "Toggle visibility to see callback ref calls."),
  ]);

  // A callback ref receives the DOM node when mounted and null when unmounted.
  // Stabilize it with useCallback so React keeps the same ref identity across
  // renders — an unstable callback ref would be re-attached every render,
  // causing an infinite setState → re-render → re-attach loop.
  const handleCallbackRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const rect = node.getBoundingClientRect();
      setLog((prev) =>
        [
          createLog(
            "Callback ref (mount)",
            `Received <${node.tagName.toLowerCase()}>, width=${Math.round(rect.width)}px.`,
          ),
          ...prev,
        ].slice(0, 6),
      );
    } else {
      setLog((prev) =>
        [
          createLog(
            "Callback ref (unmount)",
            "Received null — node removed.",
          ),
          ...prev,
        ].slice(0, 6),
      );
    }
  }, []);

  return (
    <article className="sample-card">
      <p className="eyebrow">Callback refs</p>
      <h4>Called with node on mount, null on unmount</h4>
      <button
        type="button"
        className="primary-button"
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? "Unmount element" : "Mount element"}
      </button>
      {visible && (
        <div ref={handleCallbackRef} className="ref-target-box">
          This element has a callback ref. Watch the log when toggling.
        </div>
      )}
      <ul className="summary-list">
        {log.map((entry) => (
          <li key={entry.id}>
            <strong>{entry.label}</strong> — {entry.detail}
          </li>
        ))}
      </ul>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Section 3: useImperativeHandle — expose custom methods through a ref
// ---------------------------------------------------------------------------

interface FocusableInputHandle {
  focus: () => void;
  clear: () => void;
  getValue: () => string;
}

// useImperativeHandle customizes what the parent sees through the ref.
// Instead of exposing the raw DOM input, we expose a focused API: focus(),
// clear(), and getValue(). This encapsulates the child's internals.
//
// Note: forwardRef is the legacy pattern here. In React 19, ref-as-prop is
// preferred, but useImperativeHandle still requires forwardRef or a ref prop
// explicitly wired to the hook.
const FocusableInput = forwardRef<FocusableInputHandle>(
  function FocusableInput(_props, ref) {
    const inputRef = useRef<HTMLInputElement>(null);
    const inputId = useId();
    const [value, setValue] = useState("");

    useImperativeHandle(
      ref,
      () => ({
        focus() {
          inputRef.current?.focus();
        },
        clear() {
          setValue("");
        },
        getValue() {
          return value;
        },
      }),
      [value],
    );

    return (
      <div className="ref-target-box">
        <label htmlFor={inputId} className="sr-only">
          Imperative input
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type here, then use parent buttons"
        />
      </div>
    );
  },
);

function ImperativeHandleDemo() {
  const handleRef = useRef<FocusableInputHandle>(null);
  const [log, setLog] = useState<readonly LogEntry[]>([
    createLog("Ready", "Use the buttons to call methods on the child ref."),
  ]);

  function callFocus() {
    handleRef.current?.focus();
    setLog((prev) =>
      [createLog("focus()", "Called from parent via ref."), ...prev].slice(0, 6),
    );
  }

  function callClear() {
    handleRef.current?.clear();
    setLog((prev) =>
      [createLog("clear()", "Cleared input via ref."), ...prev].slice(0, 6),
    );
  }

  function callGetValue() {
    const val = handleRef.current?.getValue() ?? "(no ref)";
    setLog((prev) =>
      [
        createLog("getValue()", `Returned: "${val}"`),
        ...prev,
      ].slice(0, 6),
    );
  }

  return (
    <article className="sample-card">
      <p className="eyebrow">useImperativeHandle</p>
      <h4>Expose custom methods through a ref</h4>
      <FocusableInput ref={handleRef} />
      <div className="button-row">
        <button type="button" className="primary-button" onClick={callFocus}>
          focus()
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={callClear}
        >
          clear()
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={callGetValue}
        >
          getValue()
        </button>
      </div>
      <ul className="summary-list">
        {log.map((entry) => (
          <li key={entry.id}>
            <strong>{entry.label}</strong> — {entry.detail}
          </li>
        ))}
      </ul>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Main sample
// ---------------------------------------------------------------------------

export default function RefTimingSample() {
  return (
    <div className="ref-timing-sample">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Ref timing and callback refs</h3>
      </div>

      <p className="section-copy">
        Refs are <code>null</code> during render because the DOM hasn&apos;t been
        committed yet. Callback refs fire when a node mounts (with the node)
        and unmounts (with <code>null</code>). useImperativeHandle exposes a
        custom API through a ref instead of raw DOM access.
      </p>

      <div className="edge-case-sections">
        <RefTimingDemo />
        <CallbackRefDemo />
        <ImperativeHandleDemo />
      </div>
    </div>
  );
}
