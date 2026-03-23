import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReleaseStabilityAttestationLedgersPanel from "./ReleaseStabilityAttestationLedgersPanel";
import {
  releaseStabilityAttestationFetchDelayMs,
  releaseStabilityAttestationMutationDelayMs,
  resetReleaseStabilityAttestationMockState,
} from "./client";

async function advanceFetch() {
  await act(async () => {
    vi.advanceTimersByTime(releaseStabilityAttestationFetchDelayMs);
    await Promise.resolve();
  });
}

async function advanceMutation() {
  await act(async () => {
    vi.advanceTimersByTime(releaseStabilityAttestationMutationDelayMs);
    await Promise.resolve();
  });
}

describe("release stability attestation ledgers", () => {
  beforeEach(() => {
    resetReleaseStabilityAttestationMockState();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("moves through ledger review and exposes stale signals", async () => {
    render(<ReleaseStabilityAttestationLedgersPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start attestation review" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Checkout stability ledger/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Support stability ledger/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Executive stability ledger/i }));
    await advanceMutation();

    expect(
      screen.getByText(/Invalidate stale signals before approver sign-off can clear the stability attestation packet./i),
    ).toBeTruthy();
    expect(screen.getByText(/3 stale/i)).toBeTruthy();
  });

  it("invalidates stale signals, records sign-off, and publishes the attestation packet", async () => {
    render(<ReleaseStabilityAttestationLedgersPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start attestation review" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Checkout stability ledger/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Support stability ledger/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Executive stability ledger/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Invalidate stale signals" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Record approver sign-off" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Publish attestation packet" }));
    await advanceMutation();

    expect(screen.getByRole("heading", { name: "Published", level: 4 })).toBeTruthy();
    expect(
      screen.getByText(/Approver sign-off recorded for the revised stability attestation packet./i),
    ).toBeTruthy();
    expect(
      screen.getByText(/Published the stability attestation packet after stale-signal invalidation and approver sign-off./i),
    ).toBeTruthy();
  });
});