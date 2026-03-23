import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LayoutEffectsSample from "../samples/LayoutEffectsSample";

function getPanel(label: string) {
  const panel = screen.getByText(label).closest("article");

  expect(panel).toBeTruthy();
  return panel as HTMLElement;
}

describe("layout effects sample", () => {
  it("shows the default measured layout state", () => {
    render(<LayoutEffectsSample />);

    expect(screen.getByRole("heading", { name: "Measured layout and synchronous effects" })).toBeTruthy();
    expect(within(getPanel("Active chip")).getByRole("heading", { name: "Accessibility review" })).toBeTruthy();
    expect(within(getPanel("Active chip")).getByText(/cobalt/i)).toBeTruthy();
    expect(within(getPanel("Active chip")).getByText(/roomy/i)).toBeTruthy();
    expect(within(getPanel("Timing contrast")).getByText(/useLayoutEffect: Accessibility review measured/i)).toBeTruthy();
    expect(within(getPanel("Timing contrast")).getByText(/useEffect: Accessibility review measured/i)).toBeTruthy();
  });

  it("updates the active chip, palette, and density observations", () => {
    render(<LayoutEffectsSample />);

    fireEvent.click(screen.getByRole("button", { name: "copper" }));
    fireEvent.click(screen.getByRole("button", { name: "compact" }));
    fireEvent.click(screen.getByRole("button", { name: /Perf regression triage/i }));

    const activePanel = getPanel("Active chip");
    const timingPanel = getPanel("Timing contrast");

    expect(within(activePanel).getByRole("heading", { name: "Perf regression triage" })).toBeTruthy();
    expect(within(activePanel).getByText(/copper/i)).toBeTruthy();
    expect(within(activePanel).getByText(/compact/i)).toBeTruthy();
    expect(
      within(activePanel).getByText(/Use the same DOM snapshot to compare a layout-timed marker against a passive one\./i),
    ).toBeTruthy();
    expect(within(timingPanel).getByText(/useLayoutEffect: Perf regression triage measured/i)).toBeTruthy();
    expect(within(timingPanel).getByText(/useEffect: Perf regression triage measured/i)).toBeTruthy();
  });
});
