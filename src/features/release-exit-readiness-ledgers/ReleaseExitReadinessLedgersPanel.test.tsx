import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReleaseExitReadinessLedgersPanel from "./ReleaseExitReadinessLedgersPanel";
import {
  releaseExitReadinessFetchDelayMs,
  releaseExitReadinessMutationDelayMs,
  resetReleaseExitReadinessMockState,
} from "./client";

async function advanceFetch() {
  await act(async () => {
    vi.advanceTimersByTime(releaseExitReadinessFetchDelayMs);
    await Promise.resolve();
  });
}

async function advanceMutation() {
  await act(async () => {
    vi.advanceTimersByTime(releaseExitReadinessMutationDelayMs);
    await Promise.resolve();
  });
}

describe("release exit readiness ledgers", () => {
  beforeEach(() => {
    resetReleaseExitReadinessMockState();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("moves through ledger review and exposes stale criteria", async () => {
    render(<ReleaseExitReadinessLedgersPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start exit review" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Checkout exit ledger/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Support exit ledger/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Executive exit ledger/i }));
    await advanceMutation();

    expect(
      screen.getByText(/Invalidate stale criteria before approver sign-off can clear the exit readiness packet./i),
    ).toBeTruthy();
    expect(screen.getByText(/3 stale/i)).toBeTruthy();
  });

  it("invalidates stale criteria, records sign-off, and publishes the exit packet", async () => {
    render(<ReleaseExitReadinessLedgersPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start exit review" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Checkout exit ledger/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Support exit ledger/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Executive exit ledger/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Invalidate stale criteria" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Record approver sign-off" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Publish exit packet" }));
    await advanceMutation();

    expect(screen.getByRole("heading", { name: "Published", level: 4 })).toBeTruthy();
    expect(
      screen.getByText(/Approver sign-off recorded for the revised exit readiness packet./i),
    ).toBeTruthy();
    expect(
      screen.getByText(/Published the exit readiness packet after stale-criterion invalidation and approver sign-off./i),
    ).toBeTruthy();
  });
});