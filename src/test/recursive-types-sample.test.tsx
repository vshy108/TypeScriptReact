import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RecursiveTypesSample from "../samples/RecursiveTypesSample";

describe("recursive types sample", () => {
  it("shows the recursive summaries and deep config paths by default", () => {
    render(<RecursiveTypesSample />);

    expect(screen.getByRole("heading", { name: "Recursive types and tree-shaped data" })).toBeTruthy();
    expect(screen.getByText("Total nodes: 10")).toBeTruthy();
    expect(screen.getByText("Total budget: $5,450,000")).toBeTruthy();
    expect(screen.getByText("Max depth: 3")).toBeTruthy();
    expect(screen.getByText("features.rollout.percentage")).toBeTruthy();
    expect(screen.getByText("alerts.thresholds.cpu")).toBeTruthy();
    expect(screen.getByText("DeepReadonly<T>")).toBeTruthy();
  });

  it("expands a collapsed subtree to reveal recursive children", () => {
    render(<RecursiveTypesSample />);

    expect(screen.queryByText("Component engineer")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Expand React framework team" }));

    const reportsGroup = screen.getByRole("group", { name: "React framework team reports" });
    expect(within(reportsGroup).getByText("Component engineer")).toBeTruthy();
    expect(within(reportsGroup).getByText("Performance engineer")).toBeTruthy();
  });
});
