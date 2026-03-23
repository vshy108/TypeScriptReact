import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DebouncedSearchRaceSample from "../samples/DebouncedSearchRaceSample";

describe("debounced search race sample", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("waits for the debounce window before starting a search", async () => {
    render(<DebouncedSearchRaceSample />);

    const input = screen.getByLabelText("Search release notes");
    fireEvent.change(input, { target: { value: "rea" } });

    expect(screen.getByText("Debounced query: not started yet")).toBeTruthy();
    expect(screen.getByText("Requests started: 0")).toBeTruthy();

    await act(async () => {
      vi.advanceTimersByTime(349);
      await Promise.resolve();
    });

    expect(screen.getByText("Debounced query: not started yet")).toBeTruthy();
    expect(screen.getByText("Requests started: 0")).toBeTruthy();

    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });

    expect(screen.getByText("Debounced query: rea")).toBeTruthy();
    expect(screen.getByText("Requests started: 1")).toBeTruthy();
  });

  it("prevents an older response from overwriting the guarded panel", async () => {
    render(<DebouncedSearchRaceSample />);

    const input = screen.getByLabelText("Search release notes");
    const naivePanel = screen.getByRole("region", { name: "Naive request handling" });
    const guardedPanel = screen.getByRole("region", { name: "Guarded request handling" });

    fireEvent.change(input, { target: { value: "re" } });

    await act(async () => {
      vi.advanceTimersByTime(350);
      await Promise.resolve();
    });

    fireEvent.change(input, { target: { value: "react" } });

    await act(async () => {
      vi.advanceTimersByTime(350);
      await Promise.resolve();
    });

    await act(async () => {
      vi.advanceTimersByTime(250);
      await Promise.resolve();
    });

    expect(within(naivePanel).getByText("Latest completed query: react")).toBeTruthy();
    expect(within(guardedPanel).getByText("Latest completed query: react")).toBeTruthy();

    await act(async () => {
      vi.advanceTimersByTime(390);
      await Promise.resolve();
    });

    expect(within(naivePanel).getByText("Latest completed query: re")).toBeTruthy();
    expect(within(guardedPanel).getByText("Latest completed query: react")).toBeTruthy();
  });
});