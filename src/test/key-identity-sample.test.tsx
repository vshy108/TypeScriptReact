import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import KeyIdentitySample from "../samples/KeyIdentitySample";

function getSectionByHeading(name: string) {
  const section = screen.getByRole("heading", { name }).closest("div");

  expect(section).toBeTruthy();
  return section as HTMLElement;
}

function getRow(container: HTMLElement, taskTitle: string) {
  const row = within(container).getByText(taskTitle).closest("li");

  expect(row).toBeTruthy();
  return row as HTMLElement;
}

describe("key identity sample", () => {
  it("shows index-key state sticking to position while id-key state follows the task", () => {
    render(<KeyIdentitySample />);

    expect(screen.getByRole("heading", { name: "Key identity and state preservation" })).toBeTruthy();

    const bugList = getSectionByHeading("key={index} Bug");
    const fixList = getSectionByHeading("key={task.id} Fix");

    fireEvent.change(within(getRow(bugList, "Normalize reducer actions")).getByLabelText(/Note for Normalize reducer actions/i), {
      target: { value: "bug note" },
    });
    fireEvent.change(within(getRow(fixList, "Normalize reducer actions")).getByLabelText(/Note for Normalize reducer actions/i), {
      target: { value: "fix note" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Reverse" }));

    expect(
      (within(getRow(bugList, "Profile render bottlenecks")).getByRole("textbox") as HTMLInputElement)
        .value,
    ).toBe("bug note");
    expect(
      (within(getRow(fixList, "Normalize reducer actions")).getByRole("textbox") as HTMLInputElement)
        .value,
    ).toBe("fix note");
  });

  it("resets the form by changing the component key", () => {
    render(<KeyIdentitySample />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Avery" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "avery@example.com" },
    });

    expect(screen.getByText(/Current: name=.*Avery.*email=.*avery@example.com/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Reset via key (current: 0)" }));

    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe("");
    expect(screen.getByText(/Form instance \(key=1\)/i)).toBeTruthy();
    expect(screen.getByText(/Current: name=.*\(empty\).*email=.*\(empty\)/i)).toBeTruthy();
  });
});
