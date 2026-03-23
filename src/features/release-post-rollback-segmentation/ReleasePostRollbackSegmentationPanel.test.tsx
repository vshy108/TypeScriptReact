import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReleasePostRollbackSegmentationPanel from "./ReleasePostRollbackSegmentationPanel";
import {
  releasePostRollbackFetchDelayMs,
  releasePostRollbackMutationDelayMs,
  resetReleasePostRollbackSegmentationMockState,
} from "./client";

async function advanceFetch() {
  await act(async () => {
    vi.advanceTimersByTime(releasePostRollbackFetchDelayMs);
    await Promise.resolve();
  });
}

async function advanceMutation() {
  await act(async () => {
    vi.advanceTimersByTime(releasePostRollbackMutationDelayMs);
    await Promise.resolve();
  });
}

describe("release post rollback segmentation", () => {
  beforeEach(() => {
    resetReleasePostRollbackSegmentationMockState();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("schedules segment waves before fork review can begin", async () => {
    render(<ReleasePostRollbackSegmentationPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start segmentation plan" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Schedule NA enterprise accounts/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Schedule EU self-serve customers/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Schedule AP support escalation queue/i }));
    await advanceMutation();

    expect(
      screen.getByText(/Approve the escalation-safe message forks before publishing segmented rollback updates./i),
    ).toBeTruthy();
    expect(screen.getByText(/2 pending/i)).toBeTruthy();
  });

  it("approves forks and publishes the segmented rollback updates", async () => {
    render(<ReleasePostRollbackSegmentationPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start segmentation plan" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Schedule NA enterprise accounts/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Schedule EU self-serve customers/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Schedule AP support escalation queue/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Approve message forks" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Publish segmented updates" }));
    await advanceMutation();

    expect(screen.getByRole("heading", { name: "Published", level: 4 })).toBeTruthy();
    expect(
      screen.getByText(/Approved the escalation-safe message forks for all segmented rollback updates./i),
    ).toBeTruthy();
    expect(
      screen.getByText(/Published region-specific rollback updates after segmentation timing and fork approvals completed./i),
    ).toBeTruthy();
  });
});