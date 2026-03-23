import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReleaseRollbackDecisionMatrixPanel from "./ReleaseRollbackDecisionMatrixPanel";
import {
  releaseRollbackDecisionFetchDelayMs,
  releaseRollbackDecisionMutationDelayMs,
  resetReleaseRollbackDecisionMatrixMockState,
} from "./client";

async function advanceFetch() {
  await act(async () => {
    vi.advanceTimersByTime(releaseRollbackDecisionFetchDelayMs);
    await Promise.resolve();
  });
}

async function advanceMutation() {
  await act(async () => {
    vi.advanceTimersByTime(releaseRollbackDecisionMutationDelayMs);
    await Promise.resolve();
  });
}

describe("release rollback decision matrix", () => {
  beforeEach(() => {
    resetReleaseRollbackDecisionMatrixMockState();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("resolves the conflicting matrix signal before quorum can start", async () => {
    render(<ReleaseRollbackDecisionMatrixPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start decision review" }));
    await advanceMutation();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Resolve Latency percentile disagreement as rollback",
      }),
    );
    await advanceMutation();

    expect(
      screen.getByText(/Resolved Latency percentile disagreement in favor of rollback./i),
    ).toBeTruthy();
    expect(
      screen.getByText(/Quorum sign-off is required before executing the rollback decision./i),
    ).toBeTruthy();
  });

  it("collects quorum and executes the rollback decision", async () => {
    render(<ReleaseRollbackDecisionMatrixPanel />);

    await advanceFetch();

    fireEvent.click(screen.getByRole("button", { name: "Start decision review" }));
    await advanceMutation();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Resolve Latency percentile disagreement as rollback",
      }),
    );
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve as Taylor/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: /Approve as Mina/i }));
    await advanceMutation();

    fireEvent.click(screen.getByRole("button", { name: "Execute decision" }));
    await advanceMutation();

    expect(screen.getByRole("heading", { name: "Executed", level: 4 })).toBeTruthy();
    expect(
      screen.getByText(/Executed the rollback decision after quorum sign-off completed./i),
    ).toBeTruthy();
  });
});