import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReleaseIncidentFaqCurationPanel from "./ReleaseIncidentFaqCurationPanel";
import {
  releaseIncidentFaqFetchDelayMs,
  releaseIncidentFaqMutationDelayMs,
  resetReleaseIncidentFaqCurationMockState,
} from "./client";

async function advanceFetch() {
  await act(async () => {
    vi.advanceTimersByTime(releaseIncidentFaqFetchDelayMs);
    await Promise.resolve();
  });
}

async function advanceMutation() {
  await act(async () => {
    vi.advanceTimersByTime(releaseIncidentFaqMutationDelayMs);
    await Promise.resolve();
  });
}

describe("release incident faq curation", () => {
  beforeEach(() => {
    resetReleaseIncidentFaqCurationMockState();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("moves through channel review and exposes stale answers", async () => {
    render(<ReleaseIncidentFaqCurationPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start FAQ review" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Status page FAQ/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Support macro FAQ/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Social reply FAQ/i }));
    await advanceMutation();

    expect(
      screen.getByText(/Stale answers must be invalidated before reviewer sign-off can clear the cross-channel FAQ bundle./i),
    ).toBeTruthy();
    expect(screen.getByText(/3 stale/i)).toBeTruthy();
  });

  it("invalidates stale answers, records sign-off, and publishes the faq bundle", async () => {
    render(<ReleaseIncidentFaqCurationPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start FAQ review" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Status page FAQ/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Support macro FAQ/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Social reply FAQ/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Invalidate stale answers" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Record reviewer sign-off" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Publish FAQ bundle" }));
    await advanceMutation();

    expect(screen.getByRole("heading", { name: "Published", level: 4 })).toBeTruthy();
    expect(
      screen.getByText(/Reviewer sign-off recorded for the refreshed cross-channel FAQ answers./i),
    ).toBeTruthy();
    expect(
      screen.getByText(/Published the synchronized cross-channel FAQ bundle after stale-answer invalidation and reviewer sign-off./i),
    ).toBeTruthy();
  });
});