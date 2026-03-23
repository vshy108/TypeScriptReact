import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReleaseRecoveryCreditLedgersPanel from "./ReleaseRecoveryCreditLedgersPanel";
import {
  releaseRecoveryCreditFetchDelayMs,
  releaseRecoveryCreditMutationDelayMs,
  resetReleaseRecoveryCreditMockState,
} from "./client";

async function advanceFetch() {
  await act(async () => {
    vi.advanceTimersByTime(releaseRecoveryCreditFetchDelayMs);
    await Promise.resolve();
  });
}

async function advanceMutation() {
  await act(async () => {
    vi.advanceTimersByTime(releaseRecoveryCreditMutationDelayMs);
    await Promise.resolve();
  });
}

describe("release recovery credit ledgers", () => {
  beforeEach(() => {
    resetReleaseRecoveryCreditMockState();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("moves through credit review and exposes stale credits", async () => {
    render(<ReleaseRecoveryCreditLedgersPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start credit review" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Checkout credit ledger/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Support concession ledger/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Strategic account ledger/i }));
    await advanceMutation();

    expect(
      screen.getByText(/Invalidate stale credits before approver sign-off can clear the recovery credit ledger./i),
    ).toBeTruthy();
    expect(screen.getByText(/3 stale/i)).toBeTruthy();
  });

  it("invalidates stale credits, records sign-off, and publishes the credit ledger", async () => {
    render(<ReleaseRecoveryCreditLedgersPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start credit review" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Checkout credit ledger/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Support concession ledger/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Strategic account ledger/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Invalidate stale credits" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Record approver sign-off" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Publish credit ledger" }));
    await advanceMutation();

    expect(screen.getByRole("heading", { name: "Published", level: 4 })).toBeTruthy();
    expect(
      screen.getByText(/Approver sign-off recorded for the revised recovery credit ledger./i),
    ).toBeTruthy();
    expect(
      screen.getByText(/Published the recovery credit ledger after stale-credit invalidation and approver sign-off./i),
    ).toBeTruthy();
  });
});