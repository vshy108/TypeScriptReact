// @vitest-environment node

// These tests run in Node because they verify files on disk and compare generated markup outside the
// browser app. JSDOM is only used where we need DOM parsing for the hydration shell alignment check.

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { HydrationMismatchPage } from "../hydration-mismatch/HydrationMismatchApp";
import {
  hydrationMismatchRootId,
  serverRenderedChecksum,
} from "../hydration-mismatch/hydrationMismatchData";
import HydrationHintsApp from "../hydration/HydrationHintsApp";
import { hydrationRootId } from "../hydration/hydrationData";
import { implementedSampleArtifacts } from "../implementedSampleArtifacts";
import { miniSampleCatalog } from "../sampleCatalog";

const implementedSeparateEntrySamples = miniSampleCatalog.filter(
  (sample) =>
    sample.status === "implemented" && sample.surface === "separate-entry",
);

function normalizeTagWhitespace(markup: string) {
  return markup.replace(/\s+/g, " ").replace(/> </g, "><").trim();
}

describe("separate-entry mini-samples", () => {
  it("keeps every implemented separate-entry sample wired to an artifact definition", () => {
    const missingArtifacts = implementedSeparateEntrySamples
      .map((sample) => sample.id)
      .filter((id) => !implementedSampleArtifacts[id]);

    expect(missingArtifacts).toEqual([]);
  });

  it.each(implementedSeparateEntrySamples)(
    "publishes files for %s",
    (sample) => {
      const artifact = implementedSampleArtifacts[sample.id];

      if (!artifact) {
        throw new Error(
          `Missing separate-entry artifact config for ${sample.id}.`,
        );
      }

      expect(existsSync(resolve(process.cwd(), artifact.entryPoint))).toBe(
        true,
      );

      if (artifact.entryHtml) {
        expect(existsSync(resolve(process.cwd(), artifact.entryHtml))).toBe(
          true,
        );
      }

      if (artifact.readmePath) {
        expect(existsSync(resolve(process.cwd(), artifact.readmePath))).toBe(
          true,
        );
      }
    },
  );

  it.each(implementedSeparateEntrySamples)(
    "keeps the HTML entry pointing at the module entry for %s",
    (sample) => {
      const artifact = implementedSampleArtifacts[sample.id];

      if (!artifact?.entryHtml) {
        return;
      }

      const html = readFileSync(
        resolve(process.cwd(), artifact.entryHtml),
        "utf8",
      );
      expect(html).toContain(artifact.entryPoint);
    },
  );

  it("keeps the hydration HTML shell aligned with the React tree", () => {
    const artifact = implementedSampleArtifacts["sample-react-hydration-hints"];

    if (!artifact?.entryHtml) {
      throw new Error("Missing HTML entry for sample-react-hydration-hints.");
    }

    const html = readFileSync(
      resolve(process.cwd(), artifact.entryHtml),
      "utf8",
    );
    const document = new JSDOM(html).window.document;
    const rootElement = document.getElementById(hydrationRootId);
    // Render the React tree to static markup and compare it to the checked-in HTML shell. This guards
    // against the easy-to-miss drift where the server shell stops matching what hydrateRoot expects.
    const expectedDocument = new JSDOM(
      `<div id="${hydrationRootId}">${renderToStaticMarkup(createElement(HydrationHintsApp))}</div>`,
    ).window.document;

    expect(rootElement).toBeTruthy();
    expect(normalizeTagWhitespace(rootElement?.innerHTML ?? "")).toBe(
      normalizeTagWhitespace(
        expectedDocument.getElementById(hydrationRootId)?.innerHTML ?? "",
      ),
    );
  });

  it("keeps the hydration mismatch HTML shell aligned with the intentional server render", () => {
    const artifact =
      implementedSampleArtifacts["sample-react-hydration-mismatch"];

    if (!artifact?.entryHtml) {
      throw new Error(
        "Missing HTML entry for sample-react-hydration-mismatch.",
      );
    }

    const html = readFileSync(
      resolve(process.cwd(), artifact.entryHtml),
      "utf8",
    );
    const document = new JSDOM(html).window.document;
    const rootElement = document.getElementById(hydrationMismatchRootId);
    const expectedDocument = new JSDOM(
      `<div id="${hydrationMismatchRootId}">${renderToStaticMarkup(createElement(HydrationMismatchPage, { renderedChecksum: serverRenderedChecksum }))}</div>`,
    ).window.document;

    expect(rootElement).toBeTruthy();
    expect(normalizeTagWhitespace(rootElement?.innerHTML ?? "")).toBe(
      normalizeTagWhitespace(
        expectedDocument.getElementById(hydrationMismatchRootId)?.innerHTML ??
          "",
      ),
    );
  });
});
