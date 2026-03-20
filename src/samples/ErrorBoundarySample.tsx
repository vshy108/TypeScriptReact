// Error boundaries and Suspense interaction
// ------------------------------------------
// This sample demonstrates a critical React gotcha:
//
// <Suspense> only catches LOADING states (pending Promises from use() or lazy()).
// It does NOT catch errors. If a lazy() import fails or a component throws during
// render, the error propagates UP until it hits an ErrorBoundary — NOT a Suspense
// boundary.
//
// Key patterns:
// 1. ErrorBoundary is required for production resilience — Suspense alone is not enough.
// 2. Nested boundaries: the NEAREST ErrorBoundary catches the error.
// 3. Reset/retry: error boundaries can offer a "try again" escape hatch.
// 4. lazy() failures and render-time throws need different handling strategies.
//
// Note: Error boundaries must be class components — there is no hook equivalent yet.

import { Component, lazy, Suspense, useState, type ReactNode } from "react";

// ---------------------------------------------------------------------------
// Error boundary — class component (no hook equivalent exists)
// ---------------------------------------------------------------------------

interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly label: string;
  readonly onReset?: () => void;
}

interface ErrorBoundaryState {
  readonly error: Error | null;
}

// Error boundaries MUST be class components. React has no useErrorBoundary() hook.
// getDerivedStateFromError runs during render to update state; componentDidCatch
// runs after commit for logging/reporting side effects.
class SampleErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  // This static method updates state when a descendant throws during render.
  // It runs during the render phase, so it must be a pure function (no side effects).
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override state: ErrorBoundaryState = { error: null };

  // componentDidCatch runs after the commit phase — safe for logging, reporting,
  // or sending error telemetry to an external service.
  override componentDidCatch(error: Error): void {
    // In production, send this to your error reporting service.
    console.error(`[${this.props.label}] Caught:`, error.message);
  }

  handleReset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  override render() {
    if (this.state.error) {
      return (
        <div className="sample-card error-boundary-card">
          <p className="eyebrow">{this.props.label}</p>
          <h4>Caught an error</h4>
          <p className="section-copy">{this.state.error.message}</p>
          <button
            type="button"
            className="primary-button"
            onClick={this.handleReset}
          >
            Reset boundary
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Components that fail in different ways
// ---------------------------------------------------------------------------

// This component throws during render — caught by ErrorBoundary, NOT Suspense.
function RenderThrower({ shouldThrow }: { readonly shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error(
      "This component threw during render. Suspense cannot catch this — only an ErrorBoundary can.",
    );
  }

  return (
    <div className="sample-card">
      <p className="eyebrow">RenderThrower</p>
      <strong>Rendered successfully</strong>
      <p className="section-copy">
        No error thrown. Click the button to trigger a render-time throw.
      </p>
    </div>
  );
}

// Simulate a lazy() import that fails after a delay.
// In real apps, this happens when the network is down, the chunk URL changed
// after redeployment, or the CDN returns a non-JS response.
function createFailingLazy() {
  return lazy(
    () =>
      new Promise<{ readonly default: React.ComponentType }>(
        (_resolve, reject) => {
          window.setTimeout(() => {
            reject(new Error("Failed to load chunk: network error simulation."));
          }, 600);
        },
      ),
  );
}

// Simulate a lazy() import that succeeds after a delay.
function createSuccessLazy() {
  return lazy(
    () =>
      new Promise<{ readonly default: React.ComponentType }>((resolve) => {
        window.setTimeout(() => {
          resolve({
            default: function LazySuccess() {
              return (
                <div className="sample-card">
                  <p className="eyebrow">Lazy component</p>
                  <strong>Loaded successfully</strong>
                </div>
              );
            },
          });
        }, 500);
      }),
  );
}

// ---------------------------------------------------------------------------
// Main sample
// ---------------------------------------------------------------------------

export default function ErrorBoundarySample() {
  const [shouldThrow, setShouldThrow] = useState(false);
  const [lazyMode, setLazyMode] = useState<"success" | "fail" | "idle">(
    "idle",
  );
  const [LazyComponent, setLazyComponent] = useState<React.LazyExoticComponent<
    React.ComponentType
  > | null>(null);

  function triggerLazy(mode: "success" | "fail") {
    setLazyMode(mode);
    // Create a fresh lazy component each time to reset the cache.
    setLazyComponent(
      () => (mode === "fail" ? createFailingLazy() : createSuccessLazy()),
    );
  }

  return (
    <div className="error-boundary-sample">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Error boundaries and Suspense interaction</h3>
      </div>

      <p className="section-copy">
        Suspense handles <em>loading</em> states (pending Promises). It does not
        catch errors. A failed <code>lazy()</code> import or a render-time throw
        propagates up to the nearest <code>ErrorBoundary</code>.
        Without one, the entire app unmounts.
      </p>

      <div className="edge-case-sections">
        {/* Section 1: Render-time throw */}
        <article className="sample-card">
          <p className="eyebrow">Render-time throw</p>
          <p className="section-copy">
            This component throws during render when triggered. The Suspense
            boundary does nothing — the ErrorBoundary catches it.
          </p>
          <button
            type="button"
            className="primary-button"
            onClick={() => setShouldThrow(true)}
          >
            Trigger render throw
          </button>
        </article>

        {/* The ErrorBoundary wraps the component that might throw. */}
        {/* Suspense is inside to show it does NOT help with errors. */}
        <SampleErrorBoundary
          label="Render error boundary"
          onReset={() => setShouldThrow(false)}
        >
          <Suspense fallback={<p>Suspense fallback (won&apos;t appear for errors)...</p>}>
            <RenderThrower shouldThrow={shouldThrow} />
          </Suspense>
        </SampleErrorBoundary>

        {/* Section 2: lazy() import failure */}
        <article className="sample-card">
          <p className="eyebrow">lazy() import simulation</p>
          <p className="section-copy">
            A successful lazy import shows the Suspense fallback, then the
            component. A failed lazy import shows the Suspense fallback, then
            the error propagates to the ErrorBoundary.
          </p>
          <div className="button-row">
            <button
              type="button"
              className="primary-button"
              onClick={() => triggerLazy("success")}
            >
              Load (success)
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => triggerLazy("fail")}
            >
              Load (fail)
            </button>
          </div>
        </article>

        <SampleErrorBoundary
          label="Lazy import error boundary"
          onReset={() => {
            setLazyMode("idle");
            setLazyComponent(null);
          }}
        >
          <Suspense
            fallback={
              <div className="sample-card">
                <p className="eyebrow">Suspense fallback</p>
                <strong>
                  Loading lazy component ({lazyMode})...
                </strong>
              </div>
            }
          >
            {LazyComponent ? <LazyComponent /> : (
              <div className="sample-card">
                <p className="eyebrow">Lazy slot</p>
                <strong>Click a button above to trigger a lazy import.</strong>
              </div>
            )}
          </Suspense>
        </SampleErrorBoundary>

        {/* Section 3: Nested boundaries — nearest wins */}
        <article className="sample-card">
          <p className="eyebrow">Nested boundaries</p>
          <p className="section-copy">
            The inner boundary catches the error first. The outer boundary only
            activates if the inner one is removed or doesn&apos;t exist.
          </p>
        </article>

        <SampleErrorBoundary label="Outer boundary">
          <SampleErrorBoundary label="Inner boundary (catches first)">
            <NestingDemo />
          </SampleErrorBoundary>
        </SampleErrorBoundary>
      </div>
    </div>
  );
}

// A small component that lets the user trigger a throw to see which boundary catches it.
function NestingDemo() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error(
      "Thrown from NestingDemo — the nearest ErrorBoundary catches this.",
    );
  }

  return (
    <div className="sample-card">
      <p className="eyebrow">NestingDemo</p>
      <strong>Rendered inside nested boundaries</strong>
      <button
        type="button"
        className="secondary-button"
        onClick={() => setShouldThrow(true)}
      >
        Throw error
      </button>
    </div>
  );
}
