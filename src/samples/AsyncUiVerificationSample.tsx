import { useRef, useState } from "react";

type MockScenarioId = "success" | "error" | "slow-success";
type AsyncStatus = "idle" | "loading" | "success" | "error";

interface MockScenario {
  readonly id: MockScenarioId;
  readonly label: string;
  readonly delayMs: number;
  readonly mode: "success" | "error";
  readonly detail: string;
}

interface MockedReleaseSummary {
  readonly headline: string;
  readonly detail: string;
}

const scenarios: readonly MockScenario[] = [
  {
    id: "success",
    label: "Use successful mock response",
    delayMs: 180,
    mode: "success",
    detail: "Returns a successful release summary after a short mocked delay.",
  },
  {
    id: "error",
    label: "Use failing mock response",
    delayMs: 220,
    mode: "error",
    detail: "Rejects with a mocked network failure so the UI can exercise the error path.",
  },
  {
    id: "slow-success",
    label: "Use slow successful mock",
    delayMs: 520,
    mode: "success",
    detail: "Returns successfully after a longer delay so the loading state stays visible long enough to verify.",
  },
] as const;

const testingChecklist = [
  "Assert the loading state before advancing mocked timers.",
  "Verify the resolved content only after the mocked network response finishes.",
  "Exercise the failure path with an alert and a retry.",
  "Keep the component deterministic so tests prove behavior instead of timing luck.",
] as const;

function getScenario(id: MockScenarioId) {
  const scenario = scenarios.find((candidate) => candidate.id === id);

  if (scenario) {
    return scenario;
  }

  throw new Error(`Unknown mock scenario: ${id}`);
}

function createAbortError() {
  return new DOMException("The operation was aborted.", "AbortError");
}

function fetchMockedReleaseSummary(
  scenario: MockScenario,
  signal?: AbortSignal,
): Promise<MockedReleaseSummary> {
  return new Promise<MockedReleaseSummary>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (scenario.mode === "error") {
        reject(new Error("Mocked network failure while loading the release summary."));
        return;
      }

      resolve({
        headline: "Release summary verified",
        detail:
          "Checkout, support, and recovery signals are all green, so the release summary can be shown to operators.",
      });
    }, scenario.delayMs);

    // Abort integration — mirrors what fetch() does internally with its signal.
    // handleAbort clears the pending timeout, detaches itself, and rejects with
    // an AbortError. The pre-check for signal.aborted handles the edge case
    // where the caller already aborted before the promise executor ran. The
    // listener covers future aborts, and { once: true } auto-removes after
    // firing (the explicit removeEventListener is a safety net for the normal-
    // completion path where the timeout fires first).
    function handleAbort() {
      window.clearTimeout(timeoutId);
      signal?.removeEventListener("abort", handleAbort);
      reject(createAbortError());
    }

    if (signal?.aborted) {
      handleAbort();
      return;
    }

    signal?.addEventListener("abort", handleAbort, { once: true });
  });
}

export default function AsyncUiVerificationSample() {
  const [scenarioId, setScenarioId] = useState<MockScenarioId>("success");
  const [status, setStatus] = useState<AsyncStatus>("idle");
  const [result, setResult] = useState<MockedReleaseSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestCount, setRequestCount] = useState(0);
  const [activityLog, setActivityLog] = useState<readonly string[]>([
    "Pick a mocked scenario, load the release summary, and verify the loading, success, and failure states in tests.",
  ]);
  const controllerRef = useRef<AbortController | null>(null);

  const activeScenario = getScenario(scenarioId);

  function pushLog(message: string) {
    setActivityLog((currentLog) => [message, ...currentLog].slice(0, 5));
  }

  function loadReleaseSummary() {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setStatus("loading");
    setErrorMessage(null);
    setResult(null);
    setRequestCount((currentCount) => currentCount + 1);
    pushLog(`Started ${activeScenario.label.toLowerCase()}.`);

    void fetchMockedReleaseSummary(activeScenario, controller.signal)
      .then((nextResult) => {
        setStatus("success");
        setResult(nextResult);
        pushLog(`Resolved ${activeScenario.label.toLowerCase()} after ${activeScenario.delayMs}ms.`);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unknown error while loading the mocked release summary.",
        );
        pushLog(`Rejected ${activeScenario.label.toLowerCase()} after ${activeScenario.delayMs}ms.`);
      });
  }

  return (
    <div className="async-ui-verification-sample">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Async UI verification and mocked network behavior</h3>
      </div>

      <p className="section-copy">
        This sample is built for interview-style testing discussion: it uses deterministic mocked responses so tests can
        verify loading, success, failure, and retry behavior without depending on real network timing.
      </p>

      <div className="async-ui-verification-sample__summary">
        <article className="sample-card">
          <p className="eyebrow">Current mock</p>
          <h4>{activeScenario.label}</h4>
          <p>{activeScenario.detail}</p>
        </article>
        <article className="sample-card">
          <p className="eyebrow">Requests started</p>
          <h4>{requestCount}</h4>
          <p>{status === "loading" ? "Loading mocked response..." : `Current state: ${status}`}</p>
        </article>
      </div>

      <div className="async-ui-verification-sample__layout">
        <section className="sample-card async-ui-verification-sample__panel" aria-label="Mocked network controls">
          <div className="section-heading">
            <p className="eyebrow">Mock controls</p>
            <h4>Drive the network state</h4>
          </div>

          <div className="async-ui-verification-sample__scenario-group">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                className={`filter-button ${scenario.id === scenarioId ? "is-selected" : ""}`}
                aria-pressed={scenario.id === scenarioId}
                onClick={() => setScenarioId(scenario.id)}
              >
                {scenario.label}
              </button>
            ))}
          </div>

          <div className="async-ui-verification-sample__actions">
            <button type="button" className="primary-button" onClick={loadReleaseSummary}>
              {status === "error" ? "Retry mocked request" : "Load release summary"}
            </button>
          </div>

          {status === "loading" ? (
            <p>Loading release summary...</p>
          ) : null}

          {status === "success" && result ? (
            <section className="sample-card async-ui-verification-sample__result" aria-label="Verified release summary">
              <strong>{result.headline}</strong>
              <p>{result.detail}</p>
            </section>
          ) : null}

          {status === "error" && errorMessage ? (
            <p role="alert">{errorMessage}</p>
          ) : null}
        </section>

        <section className="sample-card async-ui-verification-sample__panel" aria-label="Testing checklist and log">
          <div className="section-heading">
            <p className="eyebrow">Testing checklist</p>
            <h4>What a strong test should prove</h4>
          </div>

          <ul className="summary-list async-ui-verification-sample__checklist">
            {testingChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="portal-log async-ui-verification-sample__log">
            {activityLog.map((entry) => (
              <p key={entry}>{entry}</p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}