// @vitest-environment node

// These samples are TypeScript workspaces, not browser-rendered demos, so the important contract is
// "does each dedicated tsconfig still type-check?" rather than "can React render it?"

import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { implementedSampleArtifacts } from "../implementedSampleArtifacts";
import { miniSampleCatalog } from "../sampleCatalog";

const implementedNodeOnlySamples = miniSampleCatalog.filter(
  (sample) => sample.status === "implemented" && sample.surface === "node-only",
);

describe("node-only mini-samples", () => {
  it("keeps every implemented node-only sample wired to an artifact definition", () => {
    const missingArtifacts = implementedNodeOnlySamples
      .map((sample) => sample.id)
      .filter((id) => !implementedSampleArtifacts[id]);

    expect(missingArtifacts).toEqual([]);
  });

  it.each(implementedNodeOnlySamples)(
    "type-checks %s through its dedicated project config",
    (sample) => {
      const artifact = implementedSampleArtifacts[sample.id];

      if (!artifact) {
        throw new Error(`Missing node-only artifact config for ${sample.id}.`);
      }

      // Each workspace owns its own tsconfig so this test compiles them in isolation. That catches
      // sample-specific compiler-option regressions instead of hiding them behind the app tsconfig.
      execFileSync(
        process.execPath,
        [
          "./node_modules/typescript/bin/tsc",
          "-p",
          `${artifact.rootDir}/tsconfig.json`,
        ],
        {
          cwd: process.cwd(),
          stdio: "pipe",
        },
      );
    },
  );
});
