import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PortalModalSample from "../samples/PortalModalSample";

function getPortalStat(label: string) {
  const stat = screen.getByText(label).closest("article");

  expect(stat).toBeTruthy();
  return stat as HTMLElement;
}

describe("portal modal sample", () => {
  it("opens the modal portal and reports ready hosts", () => {
    render(<PortalModalSample />);

    expect(screen.getByRole("heading", { name: "Portal-based modal and toast system" })).toBeTruthy();
    expect(within(getPortalStat("Modal state")).getByText("Closed")).toBeTruthy();
    expect(within(getPortalStat("Portal hosts")).getByText("Ready")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Open modal portal" }));

    const dialog = screen.getByRole("dialog", { name: "Release coordination modal" });

    expect(dialog).toBeTruthy();
    expect(within(getPortalStat("Modal state")).getByText("Open")).toBeTruthy();
    expect(screen.getByText(/Render the dialog outside the sample card/i)).toBeTruthy();
  });

  it("tracks batched and flushSync toasts separately", () => {
    render(<PortalModalSample />);

    fireEvent.click(screen.getByRole("button", { name: "Queue batched toast" }));

    expect(within(getPortalStat("Visible toasts")).getByText("1")).toBeTruthy();
    expect(screen.getByText("Batched toast")).toBeTruthy();
    expect(screen.getByText(/Batched enqueue observed count 0 before commit\./i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Queue flushSync toast" }));

    expect(within(getPortalStat("Visible toasts")).getByText("2")).toBeTruthy();
    expect(screen.getByText("flushSync toast")).toBeTruthy();
    expect(screen.getByText(/flushSync observed count 2 right after enqueue\./i)).toBeTruthy();

    const syncToast = screen.getByText("flushSync toast").closest("article");
    expect(syncToast).toBeTruthy();
    fireEvent.click(within(syncToast as HTMLElement).getByRole("button", { name: "Dismiss" }));

    expect(within(getPortalStat("Visible toasts")).getByText("1")).toBeTruthy();
    expect(screen.queryByText("flushSync toast")).toBeNull();
  });
});
