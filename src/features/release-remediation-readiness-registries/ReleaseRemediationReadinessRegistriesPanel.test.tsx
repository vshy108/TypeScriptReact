import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReleaseRemediationReadinessRegistriesPanel from "./ReleaseRemediationReadinessRegistriesPanel";
import {
  releaseRemediationReadinessFetchDelayMs,
  releaseRemediationReadinessMutationDelayMs,
  resetReleaseRemediationReadinessMockState,
} from "./client";

async function advanceFetch() {
  await act(async () => {
    vi.advanceTimersByTime(releaseRemediationReadinessFetchDelayMs);
    await Promise.resolve();
  });
}

async function advanceMutation() {
  await act(async () => {
    vi.advanceTimersByTime(releaseRemediationReadinessMutationDelayMs);
    await Promise.resolve();
  });
}

describe("release remediation readiness registries", () => {
  beforeEach(() => {
    resetReleaseRemediationReadinessMockState();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("moves through registry review and exposes stale evidence", async () => {
    render(<ReleaseRemediationReadinessRegistriesPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start readiness review" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Checkout remediation registry/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Support remediation registry/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Executive remediation registry/i }));
    await advanceMutation();

    expect(
      screen.getByText(/Invalidate stale evidence before approver sign-off can clear the remediation readiness packet./i),
    ).toBeTruthy();
    expect(screen.getByText(/3 stale/i)).toBeTruthy();
  });

  it("invalidates stale evidence, records sign-off, and publishes the readiness packet", async () => {
    render(<ReleaseRemediationReadinessRegistriesPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start readiness review" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Checkout remediation registry/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Support remediation registry/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Executive remediation registry/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Invalidate stale evidence" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Record approver sign-off" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Publish readiness packet" }));
    await advanceMutation();

    expect(screen.getByRole("heading", { name: "Published", level: 4 })).toBeTruthy();
    expect(
      screen.getByText(/Approver sign-off recorded for the revised remediation readiness packet./i),
    ).toBeTruthy();
    expect(
      screen.getByText(/Published the remediation readiness packet after stale-evidence invalidation and approver sign-off./i),
    ).toBeTruthy();
  });
});