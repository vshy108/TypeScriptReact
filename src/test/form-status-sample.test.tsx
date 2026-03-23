import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FormStatusSample from "../samples/FormStatusSample";

describe("form status sample", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("shows the idle form status by default", () => {
    render(<FormStatusSample />);

    expect(screen.getByRole("heading", { name: "Nested submit button state" })).toBeTruthy();
    expect(screen.getByText("Idle")).toBeTruthy();
    expect(screen.getByText("No active submission")).toBeTruthy();
    expect(screen.getByText("Waiting for a submit action")).toBeTruthy();
    expect(
      screen.getByText(
        /Choose one of the nested submit buttons to see useFormStatus react to the active form submission\./i,
      ),
    ).toBeTruthy();
  });

  it("shows pending form data during submit and records the completed dispatch", async () => {
    render(<FormStatusSample />);

    fireEvent.change(screen.getByLabelText("Update subject"), {
      target: { value: "Ship the release notes refresh" },
    });
    fireEvent.change(screen.getByLabelText("Audience"), {
      target: { value: "everyone" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Publish update" }));
      await Promise.resolve();
    });

    expect(screen.getByText("Submitting...")).toBeTruthy();
    expect(screen.getByText("post")).toBeTruthy();
    expect(screen.getByText("publish")).toBeTruthy();
    expect(screen.getByText("Ship the release notes refresh")).toBeTruthy();
    expect(screen.getByText("everyone")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Submitting publish..." })).toBeTruthy();

    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(screen.getByText("Idle")).toBeTruthy();
    expect(
      screen.getByText(/Publish update completed for "Ship the release notes refresh" at /i),
    ).toBeTruthy();
    expect(screen.getByText("Ship the release notes refresh")).toBeTruthy();
    expect(screen.getByText("Publish update for All customers")).toBeTruthy();
  });
});
