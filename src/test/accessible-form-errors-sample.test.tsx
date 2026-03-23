import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AccessibleFormErrorsSample from "../samples/AccessibleFormErrorsSample";

describe("accessible form errors sample", () => {
  it("links validation messages semantically and focuses the first invalid field", async () => {
    render(<AccessibleFormErrorsSample />);

    fireEvent.click(screen.getByRole("button", { name: "Submit remediation request" }));

    expect(screen.getByRole("alert")).toBeTruthy();

    const contactInput = screen.getByLabelText("Contact email");
    const summaryInput = screen.getByLabelText("Issue summary");

    expect(contactInput.getAttribute("aria-invalid")).toBe("true");
    expect(summaryInput.getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(contactInput);
    expect(contactInput.getAttribute("aria-describedby")).toMatch(/ /);
  });

  it("submits successfully once both fields are valid", () => {
    render(<AccessibleFormErrorsSample />);

    fireEvent.change(screen.getByLabelText("Contact email"), {
      target: { value: "reviewer@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Issue summary"), {
      target: {
        value: "Rollback completed, but reviewers still need the remediation approval plan before we resume traffic.",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Submit remediation request" }));

    expect(screen.queryByRole("alert")).toBeNull();
    expect(
      screen.getByText(/Submitted the remediation request for reviewer@example.com/i),
    ).toBeTruthy();
  });
});