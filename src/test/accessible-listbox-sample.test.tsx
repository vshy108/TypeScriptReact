import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AccessibleListboxSample from "../samples/AccessibleListboxSample";

describe("accessible listbox sample", () => {
  it("moves the active option with arrow keys and selects with Enter", () => {
    render(<AccessibleListboxSample />);

    const listbox = screen.getByRole("listbox", { name: "Release handoff lanes" });
    listbox.focus();

    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    fireEvent.keyDown(listbox, { key: "Enter" });

    const option = screen.getByRole("option", { name: /Support approvals lane/i });
    expect(option.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("heading", { level: 4, name: "Jordan" })).toBeTruthy();
  });

  it("supports Home and End keyboard jumps", () => {
    render(<AccessibleListboxSample />);

    const listbox = screen.getByRole("listbox", { name: "Release handoff lanes" });
    listbox.focus();

    fireEvent.keyDown(listbox, { key: "End" });
    expect(listbox.getAttribute("aria-activedescendant")).toMatch(/finance$/i);

    fireEvent.keyDown(listbox, { key: "Home" });
    expect(listbox.getAttribute("aria-activedescendant")).toMatch(/ops$/i);
  });
});