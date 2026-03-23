import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ContextIdentitySample from "../samples/ContextIdentitySample";

function getCard(label: string) {
  const card = screen.getByText(label).closest("div.sample-card");

  expect(card).toBeTruthy();
  return card as HTMLElement;
}

describe("context identity sample", () => {
  it("shows the buggy provider by default", () => {
    render(<ContextIdentitySample />);

    expect(screen.getByRole("heading", { name: "Context provider identity perf trap" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Buggy provider" })).toBeTruthy();
    expect(within(getCard("PaletteLabel")).getByText("ocean")).toBeTruthy();
    expect(within(getCard("PaletteLabel")).getByText("Renders: 0")).toBeTruthy();
    expect(within(getCard("ToggleButton")).getByRole("button", { name: "Toggle palette" })).toBeTruthy();
    expect(within(getCard("UnrelatedCounter (no context)")).getByText("Parent renders: 0")).toBeTruthy();
  });

  it("shows extra consumer renders in buggy mode but skips them in fixed mode", () => {
    render(<ContextIdentitySample />);

    fireEvent.click(screen.getByRole("button", { name: "Force parent render (tick: 0)" }));

    expect(within(getCard("PaletteLabel")).getByText("Renders: 1")).toBeTruthy();
    expect(within(getCard("ToggleButton")).getByText("Renders: 1")).toBeTruthy();
    expect(within(getCard("UnrelatedCounter (no context)")).getByText("Parent renders: 2")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Fixed provider" }));

    expect(within(getCard("PaletteLabel")).getByText("Renders: 0")).toBeTruthy();
    expect(within(getCard("ToggleButton")).getByText("Renders: 0")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Force parent render (tick: 1)" }));

    expect(within(getCard("PaletteLabel")).getByText("Renders: 0")).toBeTruthy();
    expect(within(getCard("ToggleButton")).getByText("Renders: 0")).toBeTruthy();
    expect(within(getCard("UnrelatedCounter (no context)")).getByText("Parent renders: 4")).toBeTruthy();
  });
});
