// Hash-based routing for mini-samples
// ------------------------------------
// The app uses fragment hashes (#/samples/<slug>) to select a mini-sample
// without a full page navigation. This keeps all samples accessible through
// the command palette and browser back/forward buttons.

import { miniSampleCatalog, type MiniSampleId } from "./sampleCatalog";

const sampleHashPrefix = "#/samples/";

// Strip the "sample-" prefix to produce a human-readable slug for the URL.
// For example, "sample-react-context-theme" becomes "react-context-theme".
function toSampleSlug(id: MiniSampleId) {
  return id.replace(/^sample-/, "");
}

export function toSampleHash(id: MiniSampleId) {
  return `${sampleHashPrefix}${toSampleSlug(id)}`;
}

// Parse the current hash back to a catalog id.
// Returns null when the hash doesn't match the expected prefix or points
// to an unknown sample — the caller falls back to getDefaultSampleId.
export function readSampleIdFromHash(
  hash = window.location.hash,
): MiniSampleId | null {
  if (!hash.startsWith(sampleHashPrefix)) {
    return null;
  }

  const slug = hash.slice(sampleHashPrefix.length);
  const sample = miniSampleCatalog.find(
    (entry) => toSampleSlug(entry.id) === slug,
  );

  return sample?.id ?? null;
}

// The default sample is the first implemented isolated-route entry in the catalog.
// This gives first-time visitors a real working sample instead of a placeholder.
export function getDefaultSampleId(): MiniSampleId {
  const implementedRouteSample = miniSampleCatalog.find(
    (sample) =>
      sample.surface === "isolated-route" && sample.status === "implemented",
  );

  return implementedRouteSample?.id ?? "sample-core-lab";
}
