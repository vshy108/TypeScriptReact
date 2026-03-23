import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ConditionalDistributivitySample from "../samples/ConditionalDistributivitySample";

describe("conditional distributivity sample", () => {
  it("shows the distributive section by default", () => {
    render(<ConditionalDistributivitySample />);

    expect(
      screen.getByRole("heading", { name: "Distributive vs non-distributive" }),
    ).toBeTruthy();
    expect(screen.getByText('IsString<"a" | 42>')).toBeTruthy();
    expect(screen.getByText(/empty union, zero iterations/i)).toBeTruthy();
  });

  it("switches between the filter and infer sections", () => {
    render(<ConditionalDistributivitySample />);

    fireEvent.click(
      screen.getByRole("button", { name: "Extract, Exclude, and custom filters" }),
    );

    expect(
      screen.getByRole("heading", { name: "Extract, Exclude, and custom filters" }),
    ).toBeTruthy();
    expect(screen.getByText('FilterByKind<EventMap, "click">')).toBeTruthy();
    expect(screen.getByText("{ kind: 'click'; x: number; y: number }")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "infer in conditional types" }),
    );

    expect(
      screen.getByRole("heading", { name: "infer in conditional types" }),
    ).toBeTruthy();
    expect(screen.getByText("Awaited2<Promise<Promise<string>>>")).toBeTruthy();
    expect(screen.getByText("1 | 2 | 3")).toBeTruthy();
  });
});