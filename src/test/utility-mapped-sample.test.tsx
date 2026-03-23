import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import UtilityMappedSample from "../samples/UtilityMappedSample";

describe("utility mapped sample", () => {
  it("shows the first release with its derived draft and planner data by default", () => {
    render(<UtilityMappedSample />);

    expect(screen.getAllByText("release-1").length).toBeGreaterThan(0);
    expect(screen.getByRole("combobox", { name: "Inspect a keyof field" })).toBeTruthy();
    expect(screen.getByText(/Design systems \+ release reviewer/i)).toBeTruthy();
    expect(screen.getByText(/UI polish release moves from beta to stable/i)).toBeTruthy();
    expect(screen.getByText(/Field metadata stays in sync/i)).toBeTruthy();
  });

  it("updates the focused field explanation and active release details", () => {
    render(<UtilityMappedSample />);

    fireEvent.change(screen.getByRole("combobox", { name: "Inspect a keyof field" }), {
      target: { value: "paused" },
    });

    expect(
      (screen.getByRole("combobox", { name: "Inspect a keyof field" }) as HTMLSelectElement)
        .value,
    ).toBe("paused");
    expect(screen.getByText(/boolean toggle/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Migration support release" }));

    expect(screen.getAllByText("release-3").length).toBeGreaterThan(0);
    expect(screen.getByText(/Developer experience \+ release reviewer/i)).toBeTruthy();
    expect(screen.getByText(/needs-unpause/i)).toBeTruthy();
    expect(screen.getByText(/Migration support release moves from stable to stable/i)).toBeTruthy();
  });
});