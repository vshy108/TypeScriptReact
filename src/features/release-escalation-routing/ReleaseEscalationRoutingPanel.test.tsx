import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReleaseEscalationRoutingPanel from "./ReleaseEscalationRoutingPanel";
import {
  releaseEscalationFetchDelayMs,
  releaseEscalationMutationDelayMs,
  releaseEscalationTickMs,
  resetReleaseEscalationRoutingMockState,
} from "./client";

async function advanceTick() {
  await act(async () => {
    vi.advanceTimersByTime(releaseEscalationTickMs + releaseEscalationFetchDelayMs);
    await Promise.resolve();
  });
}

describe("release escalation routing", () => {
  beforeEach(() => {
    resetReleaseEscalationRoutingMockState();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("reroutes the active escalation when the acknowledgement deadline expires", async () => {
    render(<ReleaseEscalationRoutingPanel />);

    await act(async () => {
      vi.advanceTimersByTime(releaseEscalationFetchDelayMs);
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole("button", { name: "Start escalation routing" }));

    await act(async () => {
      vi.advanceTimersByTime(releaseEscalationMutationDelayMs);
      await Promise.resolve();
    });

    await advanceTick();
    await advanceTick();
    await advanceTick();

    expect(
      screen.getByText(/Database saturation page missed its acknowledgement deadline and was rerouted to Jordan./i),
    ).toBeTruthy();
    expect(screen.getByText(/Acknowledgement deadline missed by Mina. Escalation rerouted to Jordan./i)).toBeTruthy();
  });

  it("acknowledges the rerouted owner and completes the queue", async () => {
    render(<ReleaseEscalationRoutingPanel />);

    await act(async () => {
      vi.advanceTimersByTime(releaseEscalationFetchDelayMs);
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole("button", { name: "Start escalation routing" }));

    await act(async () => {
      vi.advanceTimersByTime(releaseEscalationMutationDelayMs);
      await Promise.resolve();
    });

    await advanceTick();
    await advanceTick();
    await advanceTick();

    fireEvent.click(screen.getByRole("button", { name: /Acknowledge Jordan/i }));

    await act(async () => {
      vi.advanceTimersByTime(releaseEscalationMutationDelayMs);
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole("button", { name: /Acknowledge Priya/i }));

    await act(async () => {
      vi.advanceTimersByTime(releaseEscalationMutationDelayMs);
      await Promise.resolve();
    });

    expect(screen.getByRole("heading", { name: "Completed", level: 4 })).toBeTruthy();
    expect(
      screen.getByText(/Priya acknowledged Executive stakeholder update and closed this escalation route./i),
    ).toBeTruthy();
  });
});