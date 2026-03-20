// Stale closures and batching traps
// ----------------------------------
// This sample demonstrates two of the most common React gotchas:
//
// 1. STALE CLOSURES — A function created during render captures the state
//    value at that point in time. If the function runs later (inside
//    setTimeout, setInterval, or a Promise callback), it reads the OLD value,
//    not the current one. Fix: use a functional updater or store the latest
//    value in a ref.
//
// 2. BATCHING BOUNDARIES — React 18+ batches state updates inside event
//    handlers, effects, and even inside setTimeout/Promise callbacks.
//    However, understanding WHEN the batched render happens is important:
//    the DOM read right after setState still sees the old value because
//    the commit hasn't happened yet.

import { useEffect, useRef, useState } from "react";

type LogEntryId = `log-${number}`;

interface LogEntry {
  readonly id: LogEntryId;
  readonly label: string;
  readonly detail: string;
}

let nextLogEntryNumber = 1;

function createLogEntry(label: string, detail: string): LogEntry {
  return {
    id: `log-${nextLogEntryNumber++}`,
    label,
    detail,
  };
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export default function StaleClosureSample() {
  // -----------------------------------------------------------------------
  // Section 1: Stale closure in setTimeout
  // -----------------------------------------------------------------------
  const [count, setCount] = useState(0);

  // This ref always holds the latest count. Updated via useEffect so the
  // react-hooks/refs rule is satisfied — ref writes belong in effects, not render.
  const countRef = useRef(count);
  useEffect(() => {
    countRef.current = count;
  });

  const [log, setLog] = useState<readonly LogEntry[]>([
    createLogEntry(
      "Ready",
      "Click the buttons to compare stale vs fresh reads.",
    ),
  ]);

  function pushLog(label: string, detail: string) {
    setLog((prev) => [createLogEntry(label, detail), ...prev].slice(0, 8));
  }

  // BUG: This closure captures `count` at the time the timeout is scheduled.
  // If the user clicks "+1" before the timeout fires, the logged value will
  // be the OLD count, not the current one.
  function incrementWithStaleClosure() {
    const capturedCount = count; // captured NOW
    setCount((c) => c + 1);

    window.setTimeout(() => {
      // `capturedCount` is stale — it was captured before the increment.
      pushLog(
        "Stale closure",
        `setTimeout read count=${capturedCount} (stale). Actual count was already ${countRef.current}.`,
      );
    }, 800);
  }

  // FIX: Read from a ref instead of the closed-over state variable.
  // The ref is mutated on every render so it always reflects the latest value.
  function incrementWithRefFix() {
    setCount((c) => c + 1);

    window.setTimeout(() => {
      // countRef.current is always up-to-date because we sync it on every render.
      pushLog(
        "Ref fix",
        `setTimeout read countRef.current=${countRef.current} (fresh).`,
      );
    }, 800);
  }

  // FIX: Use a functional updater to derive the next value from the
  // latest state at the time the update is processed, not when it was
  // scheduled. This avoids the stale closure entirely.
  function incrementThreeTimes() {
    // Without functional updaters, these three calls would all read the
    // same `count` value and produce count+1 instead of count+3.
    setCount((c) => c + 1);
    setCount((c) => c + 1);
    setCount((c) => c + 1);

    pushLog(
      "Functional updater",
      `Queued 3 increments from count=${count}. Each reads the latest prev value, so the result is count+3.`,
    );
  }

  // -----------------------------------------------------------------------
  // Section 2: Batching behavior
  // -----------------------------------------------------------------------
  const [batchA, setBatchA] = useState(0);
  const [batchB, setBatchB] = useState(0);
  const [renderCount, setRenderCount] = useState(0);

  // Track how many renders actually happen.
  const renderCounterRef = useRef(0);
  useEffect(() => {
    renderCounterRef.current += 1;
  });

  // React batches both updates into a single render.
  function batchedInEventHandler() {
    setBatchA((a) => a + 1);
    setBatchB((b) => b + 1);
    setRenderCount(renderCounterRef.current);
    pushLog(
      "Event handler batch",
      `setBatchA + setBatchB in one handler → one render. Render #${renderCounterRef.current}.`,
    );
  }

  // Since React 18, updates inside setTimeout are ALSO batched.
  // Before React 18, this would cause two separate renders.
  function batchedInTimeout() {
    window.setTimeout(() => {
      setBatchA((a) => a + 1);
      setBatchB((b) => b + 1);
      setRenderCount(renderCounterRef.current);
      pushLog(
        "setTimeout batch",
        `setBatchA + setBatchB inside setTimeout → still one render in React 18+. Render #${renderCounterRef.current}.`,
      );
    }, 0);
  }

  // Same for Promise callbacks — React 18+ batches these too.
  function batchedInPromise() {
    void Promise.resolve().then(() => {
      setBatchA((a) => a + 1);
      setBatchB((b) => b + 1);
      setRenderCount(renderCounterRef.current);
      pushLog(
        "Promise batch",
        `setBatchA + setBatchB inside Promise.then → batched in React 18+. Render #${renderCounterRef.current}.`,
      );
    });
  }

  // -----------------------------------------------------------------------
  // Section 3: Stale closure in useEffect
  // -----------------------------------------------------------------------
  const [ticker, setTicker] = useState(0);
  const [intervalValue, setIntervalValue] = useState("Not started");

  // BUG demonstration: if you put `ticker` in the deps array, the interval
  // restarts on every tick. If you omit it (empty deps), the closure captures
  // the initial value forever.
  // FIX: Use a ref to always read the latest ticker value.
  const tickerRef = useRef(ticker);
  useEffect(() => {
    tickerRef.current = ticker;
  });

  useEffect(() => {
    const id = window.setInterval(() => {
      // Reading from the ref gets the latest value without restarting the interval.
      setIntervalValue(
        `Ticker=${tickerRef.current} at ${formatTime(new Date())}`,
      );
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="stale-closure-sample">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Stale closures and batching traps</h3>
      </div>

      <p className="section-copy">
        Closures created during render capture state <em>at that moment</em>.
        Code that runs later (setTimeout, setInterval, Promise callbacks) reads
        the stale captured value unless you use a functional updater or a ref.
        React 18+ batches updates in all contexts, but understanding when the
        commit happens is still essential.
      </p>

      <div className="edge-case-sections">
        <article className="sample-card">
          <p className="eyebrow">Stale closure demo</p>
          <h4>
            Count: <strong>{count}</strong>
          </h4>
          <div className="button-row">
            <button
              type="button"
              className="primary-button"
              onClick={incrementWithStaleClosure}
            >
              +1 (stale closure)
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={incrementWithRefFix}
            >
              +1 (ref fix)
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={incrementThreeTimes}
            >
              +3 (functional updater)
            </button>
          </div>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Batching demo</p>
          <h4>
            A={batchA} B={batchB} Renders={renderCount}
          </h4>
          <div className="button-row">
            <button
              type="button"
              className="primary-button"
              onClick={batchedInEventHandler}
            >
              Batch in handler
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={batchedInTimeout}
            >
              Batch in setTimeout
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={batchedInPromise}
            >
              Batch in Promise
            </button>
          </div>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Effect closure demo</p>
          <h4>Interval reads ref, not stale state</h4>
          <p className="section-copy">{intervalValue}</p>
          <button
            type="button"
            className="primary-button"
            onClick={() => setTicker((t) => t + 1)}
          >
            Bump ticker (current: {ticker})
          </button>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Event log</p>
          <ul className="summary-list">
            {log.map((entry) => (
              <li key={entry.id}>
                <strong>{entry.label}</strong> — {entry.detail}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}
