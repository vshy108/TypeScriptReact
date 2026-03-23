import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReleaseRollbackWaiverLedgersPanel from "./ReleaseRollbackWaiverLedgersPanel";
import {
  releaseRollbackWaiverFetchDelayMs,
  releaseRollbackWaiverMutationDelayMs,
  resetReleaseRollbackWaiverMockState,
} from "./client";

async function advanceFetch() {
  await act(async () => {
    vi.advanceTimersByTime(releaseRollbackWaiverFetchDelayMs);
    await Promise.resolve();
  });
}

async function advanceMutation() {
  await act(async () => {
    vi.advanceTimersByTime(releaseRollbackWaiverMutationDelayMs);
    await Promise.resolve();
  });
}

describe("release rollback waiver ledgers", () => {
  beforeEach(() => {
    resetReleaseRollbackWaiverMockState();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("moves through waiver review and exposes expired exceptions", async () => {
    render(<ReleaseRollbackWaiverLedgersPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start waiver review" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Payments partner waiver ledger/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Merchant SLA waiver ledger/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Executive exception ledger/i }));
    await advanceMutation();

    expect(
      screen.getByText(/Invalidate expired exceptions before approver sign-off can clear the rollback waiver ledger./i),
    ).toBeTruthy();
    expect(screen.getByText(/3 stale/i)).toBeTruthy();
  });

  it("invalidates expired exceptions, records sign-off, and publishes the waiver ledger", async () => {
    render(<ReleaseRollbackWaiverLedgersPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start waiver review" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Payments partner waiver ledger/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Merchant SLA waiver ledger/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Executive exception ledger/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Invalidate expired exceptions" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Record approver sign-off" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Publish waiver ledger" }));
    await advanceMutation();

    expect(screen.getByRole("heading", { name: "Published", level: 4 })).toBeTruthy();
    expect(
      screen.getByText(/Approver sign-off recorded for the revised rollback waiver ledger./i),
    ).toBeTruthy();
    expect(
      screen.getByText(/Published the rollback waiver ledger after expired-exception invalidation and approver sign-off./i),
    ).toBeTruthy();
  });
});