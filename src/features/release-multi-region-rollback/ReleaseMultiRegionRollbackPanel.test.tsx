import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReleaseMultiRegionRollbackPanel from "./ReleaseMultiRegionRollbackPanel";
import {
  releaseRollbackFetchDelayMs,
  releaseRollbackMutationDelayMs,
  releaseRollbackTickMs,
  resetReleaseMultiRegionRollbackMockState,
} from "./client";

async function advanceTick() {
  await act(async () => {
    vi.advanceTimersByTime(releaseRollbackTickMs + releaseRollbackFetchDelayMs);
    await Promise.resolve();
  });
}

describe("release multi-region rollback", () => {
  beforeEach(() => {
    resetReleaseMultiRegionRollbackMockState();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("stops in partial recovery until dependency acknowledgements are complete", async () => {
    render(<ReleaseMultiRegionRollbackPanel />);

    await act(async () => {
      vi.advanceTimersByTime(releaseRollbackFetchDelayMs);
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole("button", { name: "Start targeted rollback" }));

    await act(async () => {
      vi.advanceTimersByTime(releaseRollbackMutationDelayMs);
      await Promise.resolve();
    });

    await advanceTick();
    await advanceTick();

    expect(
      screen.getByText(/EU West is safely rolled back, but AP Southeast stays targeted until cache and support acknowledgements are complete./i),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Resume final region recovery" }));

    await act(async () => {
      vi.advanceTimersByTime(releaseRollbackMutationDelayMs);
      await Promise.resolve();
    });

    expect(
      screen.getByText(/All dependency acknowledgements must be complete before recovery resumes./i),
    ).toBeTruthy();
  });

  it("resumes the final targeted region after acknowledgements and completes the rollback", async () => {
    render(<ReleaseMultiRegionRollbackPanel />);

    await act(async () => {
      vi.advanceTimersByTime(releaseRollbackFetchDelayMs);
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole("button", { name: "Start targeted rollback" }));

    await act(async () => {
      vi.advanceTimersByTime(releaseRollbackMutationDelayMs);
      await Promise.resolve();
    });

    await advanceTick();
    await advanceTick();

    fireEvent.click(screen.getByRole("button", { name: /Acknowledge Payments cache/i }));

    await act(async () => {
      vi.advanceTimersByTime(releaseRollbackMutationDelayMs);
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole("button", { name: /Acknowledge Support updates/i }));

    await act(async () => {
      vi.advanceTimersByTime(releaseRollbackMutationDelayMs);
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole("button", { name: "Resume final region recovery" }));

    await act(async () => {
      vi.advanceTimersByTime(releaseRollbackMutationDelayMs);
      await Promise.resolve();
    });

    expect(screen.getByText(/Resumed rollback recovery for the final targeted region./i)).toBeTruthy();

    await advanceTick();
    await advanceTick();

    expect(
      screen.getByText(/Rollback finished across the targeted regions and follow-up dependencies were acknowledged./i),
    ).toBeTruthy();
    expect(screen.getByText(/Rollback completed in AP Southeast. Traffic is back on the previous release./i)).toBeTruthy();
  });
});