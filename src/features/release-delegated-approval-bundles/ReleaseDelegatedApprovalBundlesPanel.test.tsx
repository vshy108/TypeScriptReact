import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReleaseDelegatedApprovalBundlesPanel from "./ReleaseDelegatedApprovalBundlesPanel";
import {
  releaseDelegatedApprovalFetchDelayMs,
  releaseDelegatedApprovalMutationDelayMs,
  releaseDelegatedApprovalTickMs,
  resetReleaseDelegatedApprovalBundlesMockState,
} from "./client";

async function advanceFetch() {
  await act(async () => {
    vi.advanceTimersByTime(releaseDelegatedApprovalFetchDelayMs);
    await Promise.resolve();
  });
}

async function advanceMutation() {
  await act(async () => {
    vi.advanceTimersByTime(releaseDelegatedApprovalMutationDelayMs);
    await Promise.resolve();
  });
}

async function advanceTick() {
  await act(async () => {
    vi.advanceTimersByTime(
      releaseDelegatedApprovalTickMs + releaseDelegatedApprovalFetchDelayMs,
    );
    await Promise.resolve();
  });
}

describe("release delegated approval bundles", () => {
  beforeEach(() => {
    resetReleaseDelegatedApprovalBundlesMockState();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("delegates the active approval bundle when the expiry window closes", async () => {
    render(<ReleaseDelegatedApprovalBundlesPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start delegated approvals" }));

    await advanceMutation();

    await advanceTick();
    await advanceTick();
    await advanceTick();

    expect(
      screen.getByText(/Customer-facing approval bundle expired for Priya and was delegated to Mina./i),
    ).toBeTruthy();
    expect(
      screen.getByText(/Approval window expired for Priya. Bundle delegated to Mina with a new expiry window./i),
    ).toBeTruthy();
  });

  it("replays evidence and publishes after delegated approvals are complete", async () => {
    render(<ReleaseDelegatedApprovalBundlesPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start delegated approvals" }));
    await advanceMutation();

    await advanceTick();
    await advanceTick();
    await advanceTick();

    fireEvent.click(screen.getByRole("button", { name: /Approve as Mina/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve as Taylor/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Replay audit evidence" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Publish release" }));
    await advanceMutation();

    expect(screen.getByRole("heading", { name: "Published", level: 4 })).toBeTruthy();
    expect(
      screen.getByText(/Replayed the approval delegation evidence and cleared the publish gate./i),
    ).toBeTruthy();
    expect(
      screen.getByText(/Published the release after all delegated approval bundles and replayed evidence cleared the gate./i),
    ).toBeTruthy();
  });
});