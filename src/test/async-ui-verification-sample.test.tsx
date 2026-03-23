import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AsyncUiVerificationSample from "../samples/AsyncUiVerificationSample";

describe("async ui verification sample", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("shows loading before the mocked success response resolves", async () => {
    render(<AsyncUiVerificationSample />);

    fireEvent.click(screen.getByRole("button", { name: "Load release summary" }));

    expect(screen.getByText("Loading release summary...")).toBeTruthy();

    await act(async () => {
      vi.advanceTimersByTime(180);
      await Promise.resolve();
    });

    expect(screen.getByRole("region", { name: "Verified release summary" })).toBeTruthy();
    expect(screen.getByText(/Checkout, support, and recovery signals are all green/i)).toBeTruthy();
  });

  it("shows the mocked failure path and then succeeds on retry", async () => {
    render(<AsyncUiVerificationSample />);

    fireEvent.click(screen.getByRole("button", { name: "Use failing mock response" }));
    fireEvent.click(screen.getByRole("button", { name: "Load release summary" }));

    await act(async () => {
      vi.advanceTimersByTime(220);
      await Promise.resolve();
    });

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText(/Mocked network failure while loading the release summary./i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Use successful mock response" }));
    fireEvent.click(screen.getByRole("button", { name: "Retry mocked request" }));

    await act(async () => {
      vi.advanceTimersByTime(180);
      await Promise.resolve();
    });

    expect(screen.getByRole("region", { name: "Verified release summary" })).toBeTruthy();
  });
});