import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MappedFilteringSample from "../samples/MappedFilteringSample";

describe("mapped filtering sample", () => {
  it("shows the value-based filtering section by default", () => {
    render(<MappedFilteringSample />);

    expect(
      screen.getByRole("heading", { name: "Value-based filtering" }),
    ).toBeTruthy();
    expect(screen.getByText("PickByType<T, string>")).toBeTruthy();
    expect(screen.getByText("name, email")).toBeTruthy();
    expect(screen.getByText("name, count (no Symbol.iterator)")).toBeTruthy();
  });

  it("switches to the remapping section and shows transformed keys", () => {
    render(<MappedFilteringSample />);

    fireEvent.click(
      screen.getByRole("button", { name: "Key remapping and modifiers" }),
    );

    expect(
      screen.getByRole("heading", { name: "Key remapping and modifiers" }),
    ).toBeTruthy();
    expect(screen.getByText("Getters<T>")).toBeTruthy();
    expect(screen.getByText(/getName, getEmail, getId/i)).toBeTruthy();
    expect(screen.getByText("Mutable<T>")).toBeTruthy();
    expect(screen.getByText(/All keys, now writable/i)).toBeTruthy();
  });
});