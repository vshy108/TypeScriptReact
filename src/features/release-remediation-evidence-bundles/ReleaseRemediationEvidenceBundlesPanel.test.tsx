import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReleaseRemediationEvidenceBundlesPanel from "./ReleaseRemediationEvidenceBundlesPanel";
import {
  releaseRemediationEvidenceFetchDelayMs,
  releaseRemediationEvidenceMutationDelayMs,
  resetReleaseRemediationEvidenceBundlesMockState,
} from "./client";

async function advanceFetch() {
  await act(async () => {
    vi.advanceTimersByTime(releaseRemediationEvidenceFetchDelayMs);
    await Promise.resolve();
  });
}

async function advanceMutation() {
  await act(async () => {
    vi.advanceTimersByTime(releaseRemediationEvidenceMutationDelayMs);
    await Promise.resolve();
  });
}

describe("release remediation evidence bundles", () => {
  beforeEach(() => {
    resetReleaseRemediationEvidenceBundlesMockState();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("moves through bundle review and exposes stale proof", async () => {
    render(<ReleaseRemediationEvidenceBundlesPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start evidence review" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Checkout verification bundle/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Support readiness bundle/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Executive review bundle/i }));
    await advanceMutation();

    expect(
      screen.getByText(/Invalidate stale proof before approver sign-off can clear the remediation evidence packet./i),
    ).toBeTruthy();
    expect(screen.getByText(/3 stale/i)).toBeTruthy();
  });

  it("invalidates stale proof, records sign-off, and publishes the evidence packet", async () => {
    render(<ReleaseRemediationEvidenceBundlesPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start evidence review" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Checkout verification bundle/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Support readiness bundle/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Executive review bundle/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Invalidate stale proof" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Record approver sign-off" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Publish evidence packet" }));
    await advanceMutation();

    expect(screen.getByRole("heading", { name: "Published", level: 4 })).toBeTruthy();
    expect(
      screen.getByText(/Approver sign-off recorded for the revised remediation evidence packet./i),
    ).toBeTruthy();
    expect(
      screen.getByText(/Published the remediation evidence packet after stale-proof invalidation and approver sign-off./i),
    ).toBeTruthy();
  });
});