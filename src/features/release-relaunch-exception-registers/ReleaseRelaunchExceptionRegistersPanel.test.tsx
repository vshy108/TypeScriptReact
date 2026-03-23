import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReleaseRelaunchExceptionRegistersPanel from "./ReleaseRelaunchExceptionRegistersPanel";
import {
  releaseRelaunchExceptionFetchDelayMs,
  releaseRelaunchExceptionMutationDelayMs,
  resetReleaseRelaunchExceptionMockState,
} from "./client";

async function advanceFetch() {
  await act(async () => {
    vi.advanceTimersByTime(releaseRelaunchExceptionFetchDelayMs);
    await Promise.resolve();
  });
}

async function advanceMutation() {
  await act(async () => {
    vi.advanceTimersByTime(releaseRelaunchExceptionMutationDelayMs);
    await Promise.resolve();
  });
}

describe("release relaunch exception registers", () => {
  beforeEach(() => {
    resetReleaseRelaunchExceptionMockState();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("moves through register review and exposes stale thresholds", async () => {
    render(<ReleaseRelaunchExceptionRegistersPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start relaunch review" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Checkout relaunch register/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Support relaunch register/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Executive relaunch register/i }));
    await advanceMutation();

    expect(
      screen.getByText(/Invalidate stale thresholds before approver sign-off can clear the relaunch exception register./i),
    ).toBeTruthy();
    expect(screen.getByText(/3 stale/i)).toBeTruthy();
  });

  it("invalidates stale thresholds, records sign-off, and publishes the relaunch register", async () => {
    render(<ReleaseRelaunchExceptionRegistersPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start relaunch review" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Checkout relaunch register/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Support relaunch register/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Executive relaunch register/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Invalidate stale thresholds" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Record approver sign-off" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Publish relaunch register" }));
    await advanceMutation();

    expect(screen.getByRole("heading", { name: "Published", level: 4 })).toBeTruthy();
    expect(
      screen.getByText(/Approver sign-off recorded for the revised relaunch exception register./i),
    ).toBeTruthy();
    expect(
      screen.getByText(/Published the relaunch exception register after stale-threshold invalidation and approver sign-off./i),
    ).toBeTruthy();
  });
});