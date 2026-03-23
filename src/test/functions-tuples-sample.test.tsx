import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FunctionsTuplesSample from "../samples/FunctionsTuplesSample";

function getArticleByLabel(label: string) {
  const article = screen.getByText(label).closest("article");

  expect(article).toBeTruthy();
  return article as HTMLElement;
}

function getCardByHeading(name: string) {
  const card = screen.getByRole("heading", { name }).closest("article");

  expect(card).toBeTruthy();
  return card as HTMLElement;
}

describe("functions tuples sample", () => {
  it("shows the default preset and matching overload summaries", () => {
    render(<FunctionsTuplesSample />);

    expect(within(getArticleByLabel("Active route")).getByText("POST /rollout")).toBeTruthy();
    expect(within(getArticleByLabel("Retries")).getByText("2")).toBeTruthy();

    const overloadCard = getCardByHeading("Tuple call vs spread arguments");
    expect(within(overloadCard).getAllByText("POST /rollout with 2 retries (high priority)")).toHaveLength(2);
    expect(within(overloadCard).getByText("Same result")).toBeTruthy();
    expect(within(overloadCard).getByText("Yes")).toBeTruthy();
  });

  it("updates the active preset and region-bound summary", () => {
    render(<FunctionsTuplesSample />);

    fireEvent.change(screen.getByRole("combobox", { name: "Operator region" }), {
      target: { value: "AMER" },
    });

    expect(
      (screen.getByRole("combobox", { name: "Operator region" }) as HTMLSelectElement).value,
    ).toBe("AMER");

    const contextCard = getCardByHeading("`this` typing in functions");
    expect(
      within(contextCard).getByText("Avery in AMER queued POST /rollout via launch-desk."),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Telemetry rollback sweep" }));

    expect(within(getArticleByLabel("Active route")).getByText("DELETE /telemetry")).toBeTruthy();

    const overloadCard = getCardByHeading("Tuple call vs spread arguments");
    expect(within(overloadCard).getAllByText("DELETE /telemetry with 3 retries (low priority)")).toHaveLength(2);
    expect(
      within(contextCard).getByText("Avery in AMER queued DELETE /telemetry via launch-desk."),
    ).toBeTruthy();
  });
});
