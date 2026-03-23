import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReleaseCustomerPromiseReconciliationPanel from "./ReleaseCustomerPromiseReconciliationPanel";
import {
  releaseCustomerPromiseFetchDelayMs,
  releaseCustomerPromiseMutationDelayMs,
  resetReleaseCustomerPromiseMockState,
} from "./client";

async function advanceFetch() {
  await act(async () => {
    vi.advanceTimersByTime(releaseCustomerPromiseFetchDelayMs);
    await Promise.resolve();
  });
}

async function advanceMutation() {
  await act(async () => {
    vi.advanceTimersByTime(releaseCustomerPromiseMutationDelayMs);
    await Promise.resolve();
  });
}

describe("release customer promise reconciliation", () => {
  beforeEach(() => {
    resetReleaseCustomerPromiseMockState();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("moves through promise review and exposes stale claims", async () => {
    render(<ReleaseCustomerPromiseReconciliationPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start promise review" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Checkout recovery promise/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Support resolution promise/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Executive account promise/i }));
    await advanceMutation();

    expect(
      screen.getByText(/Invalidate stale claims before approver sign-off can clear the reconciled customer promises./i),
    ).toBeTruthy();
    expect(screen.getByText(/3 stale/i)).toBeTruthy();
  });

  it("invalidates stale claims, records sign-off, and publishes the reconciled promises", async () => {
    render(<ReleaseCustomerPromiseReconciliationPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start promise review" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Checkout recovery promise/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Support resolution promise/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Executive account promise/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Invalidate stale claims" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Record approver sign-off" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Publish reconciled promises" }));
    await advanceMutation();

    expect(screen.getByRole("heading", { name: "Published", level: 4 })).toBeTruthy();
    expect(
      screen.getByText(/Approver sign-off recorded for the reconciled customer promise set./i),
    ).toBeTruthy();
    expect(
      screen.getByText(/Published the reconciled customer promises after stale-claim invalidation and approver sign-off./i),
    ).toBeTruthy();
  });
});