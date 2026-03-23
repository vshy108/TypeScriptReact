import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReleaseCommunicationHandoffPanel from "./ReleaseCommunicationHandoffPanel";
import {
  releaseCommunicationFetchDelayMs,
  releaseCommunicationMutationDelayMs,
  releaseCommunicationTickMs,
  resetReleaseCommunicationHandoffMockState,
} from "./client";

async function advanceTick() {
  await act(async () => {
    vi.advanceTimersByTime(
      releaseCommunicationTickMs + releaseCommunicationFetchDelayMs,
    );
    await Promise.resolve();
  });
}

describe("release communication handoff", () => {
  beforeEach(() => {
    resetReleaseCommunicationHandoffMockState();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("requires all channel acknowledgements before staged publish can start", async () => {
    render(<ReleaseCommunicationHandoffPanel />);

    await act(async () => {
      vi.advanceTimersByTime(releaseCommunicationFetchDelayMs);
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole("button", { name: "Start staged publish" }));

    await act(async () => {
      vi.advanceTimersByTime(releaseCommunicationMutationDelayMs);
      await Promise.resolve();
    });

    expect(
      screen.getByText(/All channels must be acknowledged before staged publish can start./i),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Acknowledge Email update/i }));

    await act(async () => {
      vi.advanceTimersByTime(releaseCommunicationMutationDelayMs);
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole("button", { name: /Acknowledge Social update/i }));

    await act(async () => {
      vi.advanceTimersByTime(releaseCommunicationMutationDelayMs);
      await Promise.resolve();
    });

    expect(
      screen.getByText(/All channels are acknowledged and ready for staged publish./i),
    ).toBeTruthy();
  });

  it("enters recovery on the email stage and then completes after confirmation", async () => {
    render(<ReleaseCommunicationHandoffPanel />);

    await act(async () => {
      vi.advanceTimersByTime(releaseCommunicationFetchDelayMs);
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole("button", { name: /Acknowledge Email update/i }));

    await act(async () => {
      vi.advanceTimersByTime(releaseCommunicationMutationDelayMs);
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole("button", { name: /Acknowledge Social update/i }));

    await act(async () => {
      vi.advanceTimersByTime(releaseCommunicationMutationDelayMs);
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole("button", { name: "Start staged publish" }));

    await act(async () => {
      vi.advanceTimersByTime(releaseCommunicationMutationDelayMs);
      await Promise.resolve();
    });

    await advanceTick();
    await advanceTick();
    await advanceTick();
    await advanceTick();

    expect(
      screen.getByText(/Email update needs recovery confirmation after a partial send bounced for the executive list./i),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Confirm recovery and continue" }));

    await act(async () => {
      vi.advanceTimersByTime(releaseCommunicationMutationDelayMs);
      await Promise.resolve();
    });

    expect(
      screen.getByText(/Confirmed email recovery and resumed the final channel publish./i),
    ).toBeTruthy();

    await advanceTick();
    await advanceTick();

    expect(
      screen.getByRole("heading", { name: "Completed", level: 4 }),
    ).toBeTruthy();
    expect(
      screen.getByText(/Social update published successfully and the handoff can move to the next channel./i),
    ).toBeTruthy();
  });
});