import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

let UseResourceSample: (typeof import("../samples/UseResourceSample"))["default"];

function getStat(label: string) {
  const stat = screen.getByText(label).closest("article");

  expect(stat).toBeTruthy();
  return stat as HTMLElement;
}

describe("use resource sample", () => {
  beforeEach(async () => {
    vi.resetModules();
    UseResourceSample = (await import("../samples/UseResourceSample")).default;
  });

  it("shows the fallback and default active resource summary", () => {
    render(<UseResourceSample />);

    expect(screen.getByRole("heading", { name: "Resource loading with use()" })).toBeTruthy();
    expect(screen.getByText("Loading resource...")).toBeTruthy();
    expect(within(getStat("Active brief")).getByText("brief-1")).toBeTruthy();
    expect(within(getStat("Revision")).getByText("1")).toBeTruthy();
    expect(within(getStat("Cached resources")).getByText("1")).toBeTruthy();
  });

  it("creates a fresh revision key when the active resource is refreshed", async () => {
    render(<UseResourceSample />);

    fireEvent.click(screen.getByRole("button", { name: "Refresh active resource" }));

    expect(screen.getByText("Loading resource...")).toBeTruthy();

    await waitFor(() => {
      expect(within(getStat("Active brief")).getByText("brief-1")).toBeTruthy();
      expect(within(getStat("Revision")).getByText("2")).toBeTruthy();
      expect(within(getStat("Cached resources")).getByText("2")).toBeTruthy();
      expect(screen.getByText(/Requested fresh data for brief-1 as revision 2\./i)).toBeTruthy();
    });
  });
});
