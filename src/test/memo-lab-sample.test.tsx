import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MemoLabSample from "../samples/MemoLabSample";

function getMemoStat(label: string) {
  const stat = screen.getByText(label).closest("article");

  expect(stat).toBeTruthy();
  return stat as HTMLElement;
}

function getInspectorSection(label: string) {
  const section = screen.getByText(label).closest("div");

  expect(section).toBeTruthy();
  return section as HTMLElement;
}

describe("memo lab sample", () => {
  it("shows the default roster summary and selected card", () => {
    render(<MemoLabSample />);

    expect(screen.getByRole("heading", { name: "Memoization and render-control lab" })).toBeTruthy();
    expect(within(getMemoStat("Visible members")).getByText("8")).toBeTruthy();
    expect(within(getMemoStat("Available now")).getByText("5")).toBeTruthy();
    expect(within(getInspectorSection("Selected card")).getByRole("heading", { name: "Lia Chen" })).toBeTruthy();
    expect(within(getInspectorSection("DevTools label")).getByText("8 visible | focus=All | query=all")).toBeTruthy();
    expect(screen.getByText("Calm chrome")).toBeTruthy();
  });

  it("filters the roster, updates the selected inspector, and records profiler commits", () => {
    render(<MemoLabSample />);

    fireEvent.change(screen.getByLabelText("Focus"), {
      target: { value: "Operations" },
    });
    fireEvent.click(screen.getByLabelText("Show only currently available teammates"));

    expect(within(getMemoStat("Visible members")).getByText("1")).toBeTruthy();
    expect(within(getMemoStat("Available now")).getByText("1")).toBeTruthy();
    expect(within(getInspectorSection("Selected card")).getByRole("heading", { name: "Mateo Cruz" })).toBeTruthy();
    expect(within(getInspectorSection("DevTools label")).getByText("1 visible | focus=Operations | query=all")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Toggle shell tone" }));

    expect(screen.getByText("Signal chrome")).toBeTruthy();
    expect(screen.queryByText("No profiler commits yet.")).toBeNull();
    expect(screen.getAllByText(/Actual .* ms/i).length).toBeGreaterThan(0);
  });
});
