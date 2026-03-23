import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReleaseIncidentCommsApprovalPacksPanel from "./ReleaseIncidentCommsApprovalPacksPanel";
import {
  releaseIncidentCommsFetchDelayMs,
  releaseIncidentCommsMutationDelayMs,
  resetReleaseIncidentCommsApprovalPacksMockState,
} from "./client";

async function advanceFetch() {
  await act(async () => {
    vi.advanceTimersByTime(releaseIncidentCommsFetchDelayMs);
    await Promise.resolve();
  });
}

async function advanceMutation() {
  await act(async () => {
    vi.advanceTimersByTime(releaseIncidentCommsMutationDelayMs);
    await Promise.resolve();
  });
}

describe("release incident comms approval packs", () => {
  beforeEach(() => {
    resetReleaseIncidentCommsApprovalPacksMockState();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("moves from operations review into legal override review", async () => {
    render(<ReleaseIncidentCommsApprovalPacksPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start staged review" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Operations approval pack/i }));
    await advanceMutation();

    expect(
      screen.getByText(/Legal must approve the customer-visible wording and apply the override before publish./i),
    ).toBeTruthy();
    expect(screen.getByText(/Awaiting legal approval and rollback wording review./i)).toBeTruthy();
  });

  it("applies the legal override diff and publishes the comms pack", async () => {
    render(<ReleaseIncidentCommsApprovalPacksPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start staged review" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Operations approval pack/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve Legal approval pack/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Apply legal override" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Publish incident comms" }));
    await advanceMutation();

    expect(screen.getByRole("heading", { name: "Published", level: 4 })).toBeTruthy();
    expect(
      screen.getByText(/Legal override applied to the customer-visible rollback wording./i),
    ).toBeTruthy();
    expect(
      screen.getByText(/Published the staged incident communication pack after the legal override was applied./i),
    ).toBeTruthy();
  });
});