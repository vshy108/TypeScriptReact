export const hydrationMismatchRootId = "hydration-mismatch-root";

export const serverRenderedChecksum = "server-seed-2026-03-23T00:00:00.000Z";
export const clientRenderedChecksum = "client-seed-hydration-check";

export const initialMismatchStatus =
  "Waiting for hydrateRoot() to compare the server HTML with the client tree.";

export const recoveredMismatchStatus =
  "React detected the intentional text mismatch, patched the client value, and kept the shell interactive.";

export const initialMismatchLog = [
  "The server shell rendered before the client bundle executed.",
  "One text node is intentionally different so hydration can report a recoverable mismatch.",
] as const;

export const hydrationMismatchFixes = [
  "Move client-only values such as Date.now() and window reads into useEffect.",
  "Use useSyncExternalStore with getServerSnapshot when the server needs a stable fallback value.",
  "Use useId for deterministic ids instead of Math.random() during render.",
  "Use suppressHydrationWarning only for intentional one-off differences such as timestamps.",
] as const;
