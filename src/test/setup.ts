import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  // cleanup() resets the mounted DOM between tests so one sample's rendered tree cannot leak into the next.
  cleanup();
  if (typeof window !== "undefined") {
    // Hash-based sample routing uses window.location.hash, so tests reset it explicitly to keep case order independent.
    window.location.hash = "";
  }
});

if (typeof window !== "undefined") {
  // Many samples read matchMedia for theme or environment-sensitive behavior. The mock keeps those reads
  // deterministic in jsdom without needing a real browser implementation.
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("dark"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}
