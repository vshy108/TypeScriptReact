import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ClassesModelsSample from "../samples/ClassesModelsSample";

function getCardByEyebrow(label: string) {
  const card = screen.getByText(label).closest("article");

  expect(card).toBeTruthy();
  return card as HTMLElement;
}

describe("classes models sample", () => {
  it("shows the default concrete plugin summary", () => {
    render(<ClassesModelsSample />);

    expect(screen.getByRole("heading", { name: "Classes and object-oriented modeling" })).toBeTruthy();
    expect(within(getCardByEyebrow("Selected plugin")).getByRole("heading", { name: "Rollout coordinator" })).toBeTruthy();
    expect(within(getCardByEyebrow("Selected plugin")).getByText("Design systems")).toBeTruthy();
    expect(within(getCardByEyebrow("Selected plugin")).getByText("Stable operating range")).toBeTruthy();
    expect(within(getCardByEyebrow("Latest run")).getByRole("heading", { name: "Run the active class" })).toBeTruthy();
    expect(within(getCardByEyebrow("Latest run")).getByText("Idle")).toBeTruthy();
  });

  it("runs the selected plugin and updates the latest run details", () => {
    render(<ClassesModelsSample />);

    fireEvent.click(screen.getByRole("button", { name: "Observability guardian" }));

    const selectedCard = getCardByEyebrow("Selected plugin");
    expect(within(selectedCard).getByRole("heading", { name: "Observability guardian" })).toBeTruthy();
    expect(within(selectedCard).getByText("Platform core")).toBeTruthy();
    expect(within(selectedCard).getByText("Moderate review load")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Run active plugin" }));

    const latestRunCard = getCardByEyebrow("Latest run");
    expect(
      within(latestRunCard).getByRole("heading", {
        name: "Inspect telemetry drift before rollout for observability owned by Platform core.",
      }),
    ).toBeTruthy();
    expect(within(latestRunCard).getByText("76%")).toBeTruthy();
    expect(within(latestRunCard).getByText("Needs review")).toBeTruthy();
    expect(within(latestRunCard).getByText("4")).toBeTruthy();
    expect(within(latestRunCard).getByText("Escalate one noisy dashboard panel")).toBeTruthy();

    const activityLogCard = getCardByEyebrow("Activity log");
    expect(
      within(activityLogCard).getByText(
        /Observability guardian: Inspect telemetry drift before rollout for observability owned by Platform core\./i,
      ),
    ).toBeTruthy();
  });
});
