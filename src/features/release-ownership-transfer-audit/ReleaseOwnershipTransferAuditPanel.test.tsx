import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReleaseOwnershipTransferAuditPanel from "./ReleaseOwnershipTransferAuditPanel";
import {
  releaseOwnershipTransferFetchDelayMs,
  releaseOwnershipTransferMutationDelayMs,
  resetReleaseOwnershipTransferAuditMockState,
} from "./client";

async function advanceFetch() {
  await act(async () => {
    vi.advanceTimersByTime(releaseOwnershipTransferFetchDelayMs);
    await Promise.resolve();
  });
}

async function advanceMutation() {
  await act(async () => {
    vi.advanceTimersByTime(releaseOwnershipTransferMutationDelayMs);
    await Promise.resolve();
  });
}

describe("release ownership transfer audit", () => {
  beforeEach(() => {
    resetReleaseOwnershipTransferAuditMockState();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("records acknowledgement history as the transfer advances", async () => {
    render(<ReleaseOwnershipTransferAuditPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start ownership transfer" }));

    await advanceMutation();

    expect(
      screen.getByText(/Taylor started the ownership transfer and sent the audit packet to Mina./i),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Acknowledge Outgoing owner sign-off/i }));

    await advanceMutation();

    expect(
      screen.getByText(/Taylor acknowledged the outgoing handoff packet and cleared the transfer for the incoming owner./i),
    ).toBeTruthy();
    expect(screen.getByText(/Awaiting acknowledgement from Mina to accept release ownership./i)).toBeTruthy();
  });

  it("replays escalation context before completing the ownership handoff", async () => {
    render(<ReleaseOwnershipTransferAuditPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start ownership transfer" }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Acknowledge Outgoing owner sign-off/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Acknowledge Incoming owner acknowledgement/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Acknowledge Escalation replay/i }));
    await advanceMutation();

    expect(screen.getByRole("heading", { name: "Completed", level: 4 })).toBeTruthy();
    expect(
      screen.getByText(/Mina replayed the reroute decisions, acknowledgement history, and remaining follow-ups./i),
    ).toBeTruthy();
    expect(
      screen.getByText(/Ownership transferred to Mina after the escalation replay context was acknowledged./i),
    ).toBeTruthy();
  });
});