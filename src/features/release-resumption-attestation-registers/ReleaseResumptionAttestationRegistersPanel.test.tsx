import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReleaseResumptionAttestationRegistersPanel from "./ReleaseResumptionAttestationRegistersPanel";
import {
  releaseResumptionAttestationFetchDelayMs,
  releaseResumptionAttestationMutationDelayMs,
  resetReleaseResumptionAttestationMockState,
} from "./client";

async function advanceFetch() {
  await act(async () => {
    vi.advanceTimersByTime(releaseResumptionAttestationFetchDelayMs);
    await Promise.resolve();
  });
}

async function advanceMutation() {
  await act(async () => {
    vi.advanceTimersByTime(releaseResumptionAttestationMutationDelayMs);
    await Promise.resolve();
  });
}

describe("release resumption attestation registers", () => {
  beforeEach(() => {
    resetReleaseResumptionAttestationMockState();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("moves through register review and exposes stale checks", async () => {
    render(<ReleaseResumptionAttestationRegistersPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start attestation review" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Checkout resumption register/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Support resumption register/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Finance resumption register/i }));
    await advanceMutation();

    expect(
      screen.getByText(/Invalidate stale checks before approver sign-off can clear the resumption packet./i),
    ).toBeTruthy();
    expect(screen.getByText(/3 stale/i)).toBeTruthy();
  });

  it("invalidates stale checks, records sign-off, and publishes the attestation packet", async () => {
    render(<ReleaseResumptionAttestationRegistersPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start attestation review" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Checkout resumption register/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Support resumption register/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Finance resumption register/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Invalidate stale checks" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Record approver sign-off" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Publish attestation packet" }));
    await advanceMutation();

    expect(screen.getByRole("heading", { name: "Published", level: 4 })).toBeTruthy();
    expect(
      screen.getByText(/Approver sign-off recorded for the revised resumption attestation packet./i),
    ).toBeTruthy();
    expect(
      screen.getByText(/Published the resumption attestation packet after stale-check invalidation and approver sign-off./i),
    ).toBeTruthy();
  });
});