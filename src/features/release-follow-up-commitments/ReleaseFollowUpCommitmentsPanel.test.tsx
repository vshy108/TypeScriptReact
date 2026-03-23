import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReleaseFollowUpCommitmentsPanel from "./ReleaseFollowUpCommitmentsPanel";
import {
  releaseFollowUpFetchDelayMs,
  releaseFollowUpMutationDelayMs,
  resetReleaseFollowUpCommitmentsMockState,
} from "./client";

async function advanceFetch() {
  await act(async () => {
    vi.advanceTimersByTime(releaseFollowUpFetchDelayMs);
    await Promise.resolve();
  });
}

async function advanceMutation() {
  await act(async () => {
    vi.advanceTimersByTime(releaseFollowUpMutationDelayMs);
    await Promise.resolve();
  });
}

describe("release follow-up commitments", () => {
  beforeEach(() => {
    resetReleaseFollowUpCommitmentsMockState();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("moves through owner review and exposes drifted etas", async () => {
    render(<ReleaseFollowUpCommitmentsPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start follow-up review" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Checkout remediation follow-up/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Support playbook revision/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Incident review publication/i }));
    await advanceMutation();

    expect(
      screen.getByText(/Invalidate drifted ETAs before approver sign-off can clear the follow-up commitments./i),
    ).toBeTruthy();
    expect(screen.getByText(/3 drifted/i)).toBeTruthy();
  });

  it("invalidates eta drift, records sign-off, and publishes the follow-up bundle", async () => {
    render(<ReleaseFollowUpCommitmentsPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start follow-up review" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Checkout remediation follow-up/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Support playbook revision/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Incident review publication/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Invalidate ETA drift" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Record approver sign-off" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Publish follow-up bundle" }));
    await advanceMutation();

    expect(screen.getByRole("heading", { name: "Published", level: 4 })).toBeTruthy();
    expect(
      screen.getByText(/Approver sign-off recorded for the revised follow-up commitments and ETAs./i),
    ).toBeTruthy();
    expect(
      screen.getByText(/Published the post-incident follow-up commitments after ETA drift invalidation and approver sign-off./i),
    ).toBeTruthy();
  });
});