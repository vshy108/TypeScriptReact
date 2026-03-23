import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import StaleClosureSample from "../samples/StaleClosureSample";

function getCard(label: string) {
  const card = screen.getByText(label).closest("article");

  expect(card).toBeTruthy();
  return card as HTMLElement;
}

describe("stale closure sample", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("shows stale and fresh timeout reads plus the functional updater result", async () => {
    render(<StaleClosureSample />);

    const staleCard = getCard("Stale closure demo");
    expect(within(staleCard).getByText("0")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "+1 (stale closure)" }));
    expect(within(staleCard).getByText("1")).toBeTruthy();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });

    expect(
      screen.getByText(/setTimeout read count=0 \(stale\)\. Actual count was already 1\./i),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "+1 (ref fix)" }));
    expect(within(staleCard).getByText("2")).toBeTruthy();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });

    expect(screen.getByText(/setTimeout read countRef\.current=2 \(fresh\)\./i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "+3 (functional updater)" }));
    expect(within(staleCard).getByText("5")).toBeTruthy();
    expect(
      screen.getByText(/Queued 3 increments from count=2\. Each reads the latest prev value, so the result is count\+3\./i),
    ).toBeTruthy();
  });

  it("batches updates across handlers, timeouts, promises, and interval ref reads", async () => {
    render(<StaleClosureSample />);

    const batchingCard = getCard("Batching demo");
    const effectCard = getCard("Effect closure demo");

    fireEvent.click(screen.getByRole("button", { name: "Batch in handler" }));
    expect(within(batchingCard).getByText(/A=1 B=1/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Batch in setTimeout" }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(within(batchingCard).getByText(/A=2 B=2/i)).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Batch in Promise" }));
      await Promise.resolve();
    });

    expect(within(batchingCard).getByText(/A=3 B=3/i)).toBeTruthy();
    expect(screen.getByText(/Promise batch/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Bump ticker \(current: 0\)" }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(within(effectCard).getByText(/Ticker=1 at/i)).toBeTruthy();
  });
});
