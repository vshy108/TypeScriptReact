import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RefTimingSample from "../samples/RefTimingSample";

function getCard(label: string) {
  const card = screen.getByText(label).closest("article");

  expect(card).toBeTruthy();
  return card as HTMLElement;
}

describe("ref timing sample", () => {
  it("shows ref timing and callback ref mount-unmount behavior", () => {
    render(<RefTimingSample />);

    expect(screen.getByRole("heading", { name: "Ref timing and callback refs" })).toBeTruthy();

    const refTimingCard = getCard("Ref timing");
    expect(within(refTimingCard).getByText(/Status: attached after commit/i)).toBeTruthy();
    expect(within(refTimingCard).getByText(/ref.current is <div>\. DOM is now available\./i)).toBeTruthy();
    expect(
      within(refTimingCard).getByText(
        /ref.current cannot be read during render — it is only available after commit\./i,
      ),
    ).toBeTruthy();

    const callbackCard = getCard("Callback refs");
    expect(within(callbackCard).getByText(/Callback ref \(mount\)/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Unmount element" }));
    expect(within(callbackCard).getByText(/Callback ref \(unmount\)/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Mount element" }));
    expect(within(callbackCard).getAllByText(/Callback ref \(mount\)/i).length).toBeGreaterThan(0);
  });

  it("uses the imperative handle methods from the parent", () => {
    render(<RefTimingSample />);

    const imperativeCard = getCard("useImperativeHandle");
    const input = screen.getByLabelText("Imperative input") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "hello refs" } });
    fireEvent.click(screen.getByRole("button", { name: "getValue()" }));
    expect(within(imperativeCard).getByText(/Returned: "hello refs"/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "focus()" }));
    expect(document.activeElement).toBe(input);
    expect(within(imperativeCard).getByText(/Called from parent via ref\./i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "clear()" }));
    expect(input.value).toBe("");
    expect(within(imperativeCard).getByText(/Cleared input via ref\./i)).toBeTruthy();
  });
});
