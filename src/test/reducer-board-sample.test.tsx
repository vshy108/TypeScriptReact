import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ReducerBoardSample from "../samples/ReducerBoardSample";

function getStat(label: string) {
  const stat = screen.getByText(label, { selector: "span" }).closest("article");

  expect(stat).toBeTruthy();
  return stat as HTMLElement;
}

function getLane(name: string) {
  const lane = screen.getByRole("heading", { name }).closest("section");

  expect(lane).toBeTruthy();
  return lane as HTMLElement;
}

describe("reducer board sample", () => {
  it("shows the seeded reducer state by default", () => {
    render(<ReducerBoardSample />);

    expect(screen.getByRole("heading", { name: "Reducer-driven task board" })).toBeTruthy();
    expect(within(getStat("Total tasks")).getByText("3")).toBeTruthy();
    expect(within(getStat("High priority")).getByText("1")).toBeTruthy();
    expect(
      within(getStat("Last action")).getByText("Board seeded through the reducer initializer."),
    ).toBeTruthy();
    expect(within(getLane("Backlog")).getByText("Normalize reducer actions around domain intent")).toBeTruthy();
    expect(within(getLane("Active")).getByText("Move lane transitions behind dispatch calls")).toBeTruthy();
  });

  it("adds a task, toggles priority, and filters the visible lanes", () => {
    render(<ReducerBoardSample />);

    fireEvent.change(screen.getByLabelText("New reducer task"), {
      target: { value: "Validate reducer board transitions" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add task" }));

    const backlogLane = getLane("Backlog");
    expect(within(backlogLane).getByText("Validate reducer board transitions")).toBeTruthy();
    expect(within(backlogLane).getByText("Normal priority")).toBeTruthy();
    expect(within(getStat("Total tasks")).getByText("4")).toBeTruthy();
    expect(
      within(getStat("Last action")).getByText(
        'Added "Validate reducer board transitions" to Backlog.',
      ),
    ).toBeTruthy();

    const newTaskCard = within(backlogLane)
      .getByText("Validate reducer board transitions")
      .closest("article");
    expect(newTaskCard).toBeTruthy();

    fireEvent.click(within(newTaskCard as HTMLElement).getByRole("button", { name: "Toggle priority" }));

    expect(within(newTaskCard as HTMLElement).getByText("High priority")).toBeTruthy();
    expect(within(getStat("High priority")).getByText("2")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    expect(screen.queryByRole("heading", { name: "Backlog" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Active" })).toBeNull();
    expect(within(getLane("Done")).getByText("Show last reducer action in the UI")).toBeTruthy();
    expect(
      within(getStat("Last action")).getByText("Filtered board to Done."),
    ).toBeTruthy();
  });
});
