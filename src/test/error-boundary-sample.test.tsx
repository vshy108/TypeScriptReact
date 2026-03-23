import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ErrorBoundarySample from "../samples/ErrorBoundarySample";

describe("error boundary sample", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("catches a render-time throw and resets the boundary", () => {
    render(<ErrorBoundarySample />);

    expect(screen.getByRole("heading", { name: "Error boundaries and Suspense interaction" })).toBeTruthy();
    expect(screen.getByText("Rendered successfully")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Trigger render throw" }));

    const renderBoundary = screen.getByText("Render error boundary").closest("div");
    expect(renderBoundary).toBeTruthy();
    expect(within(renderBoundary as HTMLElement).getByText("Caught an error")).toBeTruthy();
    expect(
      within(renderBoundary as HTMLElement).getByText(
        /Suspense cannot catch this — only an ErrorBoundary can\./i,
      ),
    ).toBeTruthy();

    fireEvent.click(within(renderBoundary as HTMLElement).getByRole("button", { name: "Reset boundary" }));

    expect(screen.getByText("Rendered successfully")).toBeTruthy();
  });

  it("shows Suspense for lazy success and the boundary for lazy failure", async () => {
    render(<ErrorBoundarySample />);

    fireEvent.click(screen.getByRole("button", { name: "Load (success)" }));

    expect(screen.getByText("Loading lazy component (success)...")).toBeTruthy();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(screen.getByText("Loaded successfully")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Load (fail)" }));

    expect(screen.getByText("Loading lazy component (fail)...")).toBeTruthy();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });

    const lazyBoundary = screen.getByText("Lazy import error boundary").closest("div");
    expect(lazyBoundary).toBeTruthy();
    expect(within(lazyBoundary as HTMLElement).getByText("Caught an error")).toBeTruthy();
    expect(
      within(lazyBoundary as HTMLElement).getByText("Failed to load chunk: network error simulation."),
    ).toBeTruthy();

    fireEvent.click(within(lazyBoundary as HTMLElement).getByRole("button", { name: "Reset boundary" }));

    expect(screen.getByText("Click a button above to trigger a lazy import.")).toBeTruthy();
  });

  it("lets the inner nested boundary catch first", () => {
    render(<ErrorBoundarySample />);

    fireEvent.click(screen.getByRole("button", { name: "Throw error" }));

    const innerBoundary = screen.getByText("Inner boundary (catches first)").closest("div");
    expect(innerBoundary).toBeTruthy();
    expect(within(innerBoundary as HTMLElement).getByText("Caught an error")).toBeTruthy();
    expect(
      within(innerBoundary as HTMLElement).getByText(
        "Thrown from NestingDemo — the nearest ErrorBoundary catches this.",
      ),
    ).toBeTruthy();
    expect(screen.queryByText("Outer boundary")).toBeNull();
  });
});
