import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PrivateFieldsSample from "../samples/PrivateFieldsSample";

describe("private fields sample", () => {
  it("shows the runtime privacy comparison by default", () => {
    render(<PrivateFieldsSample />);

    expect(screen.getByRole("heading", { name: "private vs #private fields" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "private (TS) vs #private (JS)" })).toBeTruthy();
    expect(screen.getByText('TS private via bracket: "ts-private-value"')).toBeTruthy();
    expect(screen.getByText("JS #private via bracket: undefined (truly private)")).toBeTruthy();
    expect(screen.getByText("Object.keys(ts): [secret]")).toBeTruthy();
    expect(screen.getByText("Object.keys(js): []")).toBeTruthy();
  });

  it("switches to other class feature sections", () => {
    render(<PrivateFieldsSample />);

    fireEvent.click(screen.getByRole("button", { name: "override keyword" }));

    expect(screen.getByRole("heading", { name: "override keyword" })).toBeTruthy();
    expect(screen.getByText("[STRICT] hello")).toBeTruthy();
    expect(screen.getByText("[WARN] caution")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Field initialization order" }));

    expect(screen.getByRole("heading", { name: "Field initialization order" })).toBeTruthy();
    expect(screen.getByText('first: "initialized first"')).toBeTruthy();
    expect(screen.getByText('second: "depends on first="initialized first""')).toBeTruthy();
    expect(
      screen.getByText(
        'third: "third (first=initialized first, second=depends on first="initialized first")"',
      ),
    ).toBeTruthy();
  });
});
