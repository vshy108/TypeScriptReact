import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReleaseIncidentTimelineReconstructionPanel from "./ReleaseIncidentTimelineReconstructionPanel";
import {
  releaseTimelineFetchDelayMs,
  releaseTimelineMutationDelayMs,
  resetReleaseTimelineReconstructionMockState,
} from "./client";

async function advanceFetch() {
  await act(async () => {
    vi.advanceTimersByTime(releaseTimelineFetchDelayMs);
    await Promise.resolve();
  });
}

async function advanceMutation() {
  await act(async () => {
    vi.advanceTimersByTime(releaseTimelineMutationDelayMs);
    await Promise.resolve();
  });
}

describe("release incident timeline reconstruction", () => {
  beforeEach(() => {
    resetReleaseTimelineReconstructionMockState();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("resolves the conflicting witness note and blocks summary regeneration until then", async () => {
    render(<ReleaseIncidentTimelineReconstructionPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start timeline reconstruction" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Choose ops note" }));
    await advanceMutation();

    expect(
      screen.getByText(/Resolved 14:07 UTC failover ordering in favor of the ops witness note and retained the other note as supporting context./i),
    ).toBeTruthy();
    expect(
      screen.getByText(/Regenerate the executive summary now that the canonical timeline is set./i),
    ).toBeTruthy();
  });

  it("generates and publishes the executive summary after conflicts are resolved", async () => {
    render(<ReleaseIncidentTimelineReconstructionPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start timeline reconstruction" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Choose ops note" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Generate executive summary" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Publish executive summary" }));
    await advanceMutation();

    expect(screen.getByRole("heading", { name: "Published", level: 4 })).toBeTruthy();
    expect(
      screen.getByText(/Generated a publish-safe executive summary from the reconciled incident timeline./i),
    ).toBeTruthy();
    expect(
      screen.getByText(/Published the executive summary after timeline reconciliation and summary regeneration completed./i),
    ).toBeTruthy();
  });
});