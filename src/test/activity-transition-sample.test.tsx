import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ActivityTransitionSample from "../samples/ActivityTransitionSample";

function getLogSection() {
  const section = screen.getByText("startTransition log").closest("div");

  expect(section).toBeTruthy();
  return section as HTMLElement;
}

describe("activity transition sample", () => {
  it("shows the default dashboard state", () => {
    render(<ActivityTransitionSample />);

    expect(screen.getByRole("heading", { name: "Activity boundaries and standalone startTransition" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "All tiers" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Show detail view" })).toBeTruthy();
    expect(screen.getByText("US-East production cluster")).toBeTruthy();
    expect(screen.getByText("EU-West staging environment")).toBeTruthy();
    expect(screen.getByText("Internal dev sandbox")).toBeTruthy();
    expect(within(getLogSection()).getByText(/No transitions recorded yet/i)).toBeTruthy();
  });

  it("filters tiers and records transition logs", () => {
    render(<ActivityTransitionSample />);

    fireEvent.click(screen.getByRole("button", { name: "Background" }));

    expect(screen.getByRole("button", { name: "Background" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("US-East production cluster")).toBeTruthy();
    expect(screen.getByText("Internal dev sandbox")).toBeTruthy();
    expect(screen.getByText("Disaster recovery standby")).toBeTruthy();
    expect(within(getLogSection()).getByText(/Filter changed → Background/i)).toBeTruthy();
  });

  it("opens a region detail panel and logs the transition", () => {
    render(<ActivityTransitionSample />);

    fireEvent.click(screen.getByRole("button", { name: /AP-South canary ring/i }));

    expect(screen.getByRole("heading", { name: "AP-South canary ring" })).toBeTruthy();
    expect(screen.getByText(/Gradual rollout target/i)).toBeTruthy();
    expect(screen.getByText("Check rollout percentage")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Back to dashboard" })).toBeTruthy();
    expect(within(getLogSection()).getByText(/Region selected → AP-South canary ring/i)).toBeTruthy();
  });
});
