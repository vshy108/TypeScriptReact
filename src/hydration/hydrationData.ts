export const hydrationRootId = "hydration-root";

export type ResourceHintId =
  | "hint-dns"
  | "hint-connection"
  | "hint-image"
  | "hint-style"
  | "hint-module-preload"
  | "hint-module-preinit";

export interface ResourceHintPlan {
  readonly id: ResourceHintId;
  readonly api: string;
  readonly target: string;
  readonly summary: string;
}

// as const satisfies keeps the ids and labels literal while still verifying that every item matches the teaching shape.
export const resourceHintPlans = [
  {
    id: "hint-dns",
    api: "prefetchDNS",
    target: "https://fonts.googleapis.com",
    summary:
      "Resolve the stylesheet host before the server shell asks for remote font CSS.",
  },
  {
    id: "hint-connection",
    api: "preconnect",
    target: "https://fonts.gstatic.com",
    summary:
      "Open the font asset connection early so follow-up requests skip the connection handshake.",
  },
  {
    id: "hint-image",
    api: "preload",
    target: "/hydration/diagram.svg",
    summary:
      "Fetch a concrete image asset while the existing HTML shell is still being hydrated.",
  },
  {
    id: "hint-style",
    api: "preinit",
    target: "/hydration/critical.css",
    summary:
      "Prepare a stylesheet before the hydrated UI reveals the comparison and status panels.",
  },
  {
    id: "hint-module-preload",
    api: "preloadModule",
    target: "/hydration/preview-module.js",
    summary:
      "Start fetching a module graph ahead of a client-only follow-up interaction.",
  },
  {
    id: "hint-module-preinit",
    api: "preinitModule",
    target: "/hydration/preview-module.js",
    summary:
      "Prepare the module script so evaluation can begin immediately once code imports it.",
  },
] as const satisfies readonly ResourceHintPlan[];

export const initialHydrationStatus =
  "Waiting for hydrateRoot() to attach client event handlers to the existing markup.";

export const hydratedStatus =
  "Hydration finished. The original server shell stayed in place and the controls are now interactive.";

export const initialHydrationLog = [
  "Server markup arrived before the client bundle executed.",
  "Resource hints are registered before hydrateRoot() runs.",
] as const;

export function findResourceHintPlan(id: ResourceHintId) {
  // Falling back to the first plan keeps the demo UI renderable even if a caller passes an
  // unexpected id from the URL or future wiring code.
  return (
    resourceHintPlans.find((plan) => plan.id === id) ?? resourceHintPlans[0]
  );
}
