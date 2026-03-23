import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ContextThemeSample from "../samples/ContextThemeSample";

describe("context theme sample", () => {
  it("shows the default provider output", () => {
    render(<ContextThemeSample />);

    expect(screen.getByRole("heading", { name: "Context and provider composition" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "sunrise theme" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "sunrise" }).getAttribute("aria-pressed")).toBe("true");
    expect((screen.getByLabelText("Texture overlay") as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText("Telemetry card") as HTMLInputElement).checked).toBe(true);
    expect(screen.getByText("ThemeProvider + FeatureFlagsProvider")).toBeTruthy();
  });

  it("switches themes and toggles feature-flagged output", () => {
    render(<ContextThemeSample />);

    fireEvent.click(screen.getByRole("button", { name: "midnight" }));

    expect(screen.getByRole("heading", { name: "midnight theme" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "midnight" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("#162133")).toBeTruthy();

    fireEvent.click(screen.getByLabelText("Telemetry card"));

    expect(screen.queryByText("Theme consumers")).toBeNull();
    expect(screen.queryByText("Provider depth")).toBeNull();

    fireEvent.click(screen.getByLabelText("Texture overlay"));

    const preview = screen.getByRole("heading", { name: "midnight theme" }).closest("section");
    expect(preview).toBeTruthy();
    expect((preview as HTMLElement).className).not.toContain("context-preview--textured");

    fireEvent.click(screen.getByRole("button", { name: "Cycle theme" }));

    expect(screen.getByRole("heading", { name: "grove theme" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "grove" }).getAttribute("aria-pressed")).toBe("true");
    expect(within(preview as HTMLElement).getByText("#e8f3e5")).toBeTruthy();
  });
});
