import { useEffect, useRef, useState } from "react";

type SearchStatus = "idle" | "loading" | "success" | "cancelled" | "error";
type SearchEventId = `search-event-${number}`;

interface SearchResponse {
  readonly requestId: number;
  readonly query: string;
  readonly responseMs: number;
  readonly hits: readonly string[];
}

interface SearchPanelState {
  readonly status: SearchStatus;
  readonly note: string;
  readonly result: SearchResponse | null;
}

interface SearchEvent {
  readonly id: SearchEventId;
  readonly label: string;
  readonly detail: string;
}

const releaseNotes = [
  "React 19 release candidate notes",
  "React compiler rollout checklist",
  "Router transition timing guide",
  "Realtime search relevancy tuning",
  "Release approval audit checklist",
  "Request cancellation incident report",
  "Accessibility regression review",
  "Retry and backoff production playbook",
] as const;

const debounceWindowMs = 350;
let nextEventNumber = 1;

function createPanelState(note: string): SearchPanelState {
  return {
    status: "idle",
    note,
    result: null,
  };
}

function createEvent(label: string, detail: string): SearchEvent {
  return {
    id: `search-event-${nextEventNumber++}`,
    label,
    detail,
  };
}

function getResponseDelay(query: string) {
  return Math.max(220, 900 - query.length * 130);
}

function createAbortError() {
  return new DOMException("The operation was aborted.", "AbortError");
}

function isAbortError(error: unknown): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

function simulateReleaseSearch(
  query: string,
  requestId: number,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  const normalizedQuery = query.toLowerCase();
  const responseMs = getResponseDelay(normalizedQuery);

  return new Promise<SearchResponse>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      const hits = releaseNotes
        .filter((item) => item.toLowerCase().includes(normalizedQuery))
        .slice(0, 4);

      resolve({
        requestId,
        query,
        responseMs,
        hits,
      });
    }, responseMs);

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

function getStatusLabel(status: SearchStatus) {
  switch (status) {
    case "idle":
      return "Idle";
    case "loading":
      return "Loading";
    case "success":
      return "Resolved";
    case "cancelled":
      return "Cancelled";
    case "error":
      return "Error";
  }
}

export default function DebouncedSearchRaceSample() {
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [startedSearches, setStartedSearches] = useState(0);
  const [naiveState, setNaiveState] = useState<SearchPanelState>(() =>
    createPanelState("Every response can overwrite the UI, even if it is stale."),
  );
  const [guardedState, setGuardedState] = useState<SearchPanelState>(() =>
    createPanelState("The previous request is cancelled before the next one becomes current."),
  );
  const [events, setEvents] = useState<readonly SearchEvent[]>([
    createEvent(
      "Ready",
      'Try typing "re", pause, then type "react". The shorter query is deliberately slower so it resolves last.',
    ),
  ]);

  const requestSequenceRef = useRef(0);
  const latestGuardedRequestRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  function pushEvent(label: string, detail: string) {
    setEvents((previous) => [createEvent(label, detail), ...previous].slice(0, 6));
  }

  useEffect(() => {
    const normalizedValue = inputValue.trim();

    if (!normalizedValue) {
      setDebouncedQuery("");
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(normalizedValue);
    }, debounceWindowMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [inputValue]);

  useEffect(() => {
    if (!debouncedQuery) {
      setNaiveState(
        createPanelState("Every response can overwrite the UI, even if it is stale."),
      );
      setGuardedState(
        createPanelState("The previous request is cancelled before the next one becomes current."),
      );
      return;
    }

    const requestId = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestId;
    latestGuardedRequestRef.current = requestId;
    setStartedSearches((count) => count + 1);

    setNaiveState((previous) => ({
      status: "loading",
      note: `Loading request #${requestId} for "${debouncedQuery}" without cancellation.`,
      result: previous.result,
    }));
    setGuardedState((previous) => ({
      status: "loading",
      note: `Loading request #${requestId} for "${debouncedQuery}" and cancelling the previous one.`,
      result: previous.result,
    }));
    pushEvent(
      "Search started",
      `Debounced query "${debouncedQuery}" started request #${requestId} in both panels.`,
    );

    const guardedController = new AbortController();

    void simulateReleaseSearch(debouncedQuery, requestId).then((response) => {
      if (!mountedRef.current) {
        return;
      }

      setNaiveState({
        status: "success",
        note: `Request #${response.requestId} resolved after ${response.responseMs}ms. A slower older request can still overwrite this later.`,
        result: response,
      });
      pushEvent(
        "Naive resolved",
        `Request #${response.requestId} for "${response.query}" updated the naive panel after ${response.responseMs}ms.`,
      );
    });

    void simulateReleaseSearch(debouncedQuery, requestId, guardedController.signal)
      .then((response) => {
        if (!mountedRef.current || latestGuardedRequestRef.current !== response.requestId) {
          return;
        }

        setGuardedState({
          status: "success",
          note: `Request #${response.requestId} resolved after ${response.responseMs}ms and remained the latest request.`,
          result: response,
        });
        pushEvent(
          "Guarded resolved",
          `Request #${response.requestId} for "${response.query}" updated the guarded panel after ${response.responseMs}ms.`,
        );
      })
      .catch((error: unknown) => {
        if (!mountedRef.current) {
          return;
        }

        if (isAbortError(error)) {
          if (latestGuardedRequestRef.current !== requestId) {
            return;
          }

          setGuardedState((previous) => ({
            status: "cancelled",
            note: `Request #${requestId} was cancelled before it could replace a newer result.`,
            result: previous.result,
          }));
          return;
        }

        setGuardedState((previous) => ({
          status: "error",
          note: `Request #${requestId} failed unexpectedly.`,
          result: previous.result,
        }));
      });

    return () => {
      guardedController.abort();
    };
  }, [debouncedQuery]);

  const isWaitingForPause = inputValue.trim() !== debouncedQuery;

  return (
    <div className="debounced-search-sample">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Debounced search and request races</h3>
      </div>

      <p className="section-copy">
        Debouncing lowers request volume, but it does not prevent stale responses
        from arriving out of order. This sample shows the classic bug and a
        cancellation-based fix side by side.
      </p>

      <div className="debounced-search__summary">
        <article className="sample-card">
          <p className="eyebrow">Interview angle</p>
          <h4>Input responsiveness is only half the problem</h4>
          <p>
            Strong frontend answers explain both why a search box is debounced
            and how older requests are prevented from overwriting newer intent.
          </p>
        </article>

        <article className="sample-card">
          <p className="eyebrow">Current run</p>
          <ul className="accessible-dialog__checklist">
            <li>Typed query: {inputValue || "empty"}</li>
            <li>Debounced query: {debouncedQuery || "not started yet"}</li>
            <li>Requests started: {startedSearches}</li>
            <li>Waiting for pause: {isWaitingForPause ? "yes" : "no"}</li>
          </ul>
        </article>
      </div>

      <div className="debounced-search__toolbar surface surface--compact">
        <label className="field">
          <span>Search release notes</span>
          <input
            type="search"
            value={inputValue}
            placeholder="Try re, then react"
            onChange={(event) => {
              setInputValue(event.target.value);
            }}
          />
        </label>

        <div className="debounced-search__quick-actions">
          <button type="button" className="secondary-button" onClick={() => setInputValue("re")}>
            Try re
          </button>
          <button type="button" className="secondary-button" onClick={() => setInputValue("react")}>
            Try react
          </button>
          <button type="button" className="secondary-button" onClick={() => setInputValue("router")}>
            Try router
          </button>
          <button type="button" className="secondary-button" onClick={() => setInputValue("")}>
            Clear
          </button>
        </div>
      </div>

      <div className="debounced-search__panels">
        <section className="sample-card debounced-search__panel" aria-label="Naive request handling">
          <p className="eyebrow">Naive handling</p>
          <h4>Last response wins, even if it is stale</h4>
          <p>Status: {getStatusLabel(naiveState.status)}</p>
          <p>{naiveState.note}</p>
          <p>
            Latest completed query: {naiveState.result?.query ?? "none"}
          </p>
          <p>
            Latest request id: {naiveState.result?.requestId ?? "none"}
          </p>
          <ul className="debounced-search__results">
            {(naiveState.result?.hits.length ?? 0) > 0 ? (
              naiveState.result?.hits.map((hit) => <li key={hit}>{hit}</li>)
            ) : (
              <li>No results yet.</li>
            )}
          </ul>
        </section>

        <section className="sample-card debounced-search__panel" aria-label="Guarded request handling">
          <p className="eyebrow">Guarded handling</p>
          <h4>Previous request is cancelled before it can overwrite</h4>
          <p>Status: {getStatusLabel(guardedState.status)}</p>
          <p>{guardedState.note}</p>
          <p>
            Latest completed query: {guardedState.result?.query ?? "none"}
          </p>
          <p>
            Latest request id: {guardedState.result?.requestId ?? "none"}
          </p>
          <ul className="debounced-search__results">
            {(guardedState.result?.hits.length ?? 0) > 0 ? (
              guardedState.result?.hits.map((hit) => <li key={hit}>{hit}</li>)
            ) : (
              <li>No results yet.</li>
            )}
          </ul>
        </section>
      </div>

      <div className="debounced-search__events surface surface--compact">
        <div className="section-heading">
          <p className="eyebrow">Event log</p>
          <h4>What happened</h4>
        </div>

        <div className="accessible-dialog__log">
          {events.map((entry) => (
            <article key={entry.id} className="detail-panel">
              <div className="detail-panel__body">
                <strong>{entry.label}</strong>
                <p>{entry.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}