// @vitest-environment node

import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { implementedSampleArtifacts } from "../implementedSampleArtifacts";

describe("react lint rules workspace", () => {
  it("compiles and reports the expected lint violations", () => {
    const artifact = implementedSampleArtifacts["sample-react-lint-rules-demo"];

    if (!artifact) {
      throw new Error(
        "Missing artifact config for sample-react-lint-rules-demo.",
      );
    }

    execFileSync(
      process.execPath,
      [
        "./node_modules/typescript/bin/tsc",
        "-p",
        "node-samples/react-lint-rules/tsconfig.json",
      ],
      {
        cwd: process.cwd(),
        stdio: "pipe",
      },
    );

    const output = execFileSync(
      process.execPath,
      ["node-samples/react-lint-rules/dist/src/reportLintRules.js"],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: "pipe",
      },
    );

    const report = JSON.parse(output) as {
      readonly badFixtures: {
        readonly exhaustiveDeps: { readonly ruleIds: readonly string[] };
        readonly rulesOfHooks: { readonly ruleIds: readonly string[] };
        readonly onlyExportComponents: { readonly ruleIds: readonly string[] };
      };
      readonly goodFixtures: {
        readonly exhaustiveDeps: { readonly ruleIds: readonly string[] };
        readonly rulesOfHooks: { readonly ruleIds: readonly string[] };
        readonly onlyExportComponents: { readonly ruleIds: readonly string[] };
      };
      readonly documentedOnlyRules: readonly string[];
    };

    expect(report.badFixtures.exhaustiveDeps.ruleIds).toContain(
      "react-hooks/exhaustive-deps",
    );
    expect(report.badFixtures.rulesOfHooks.ruleIds).toContain(
      "react-hooks/rules-of-hooks",
    );
    expect(report.badFixtures.onlyExportComponents.ruleIds).toContain(
      "react-refresh/only-export-components",
    );

    expect(report.goodFixtures.exhaustiveDeps.ruleIds).toEqual([]);
    expect(report.goodFixtures.rulesOfHooks.ruleIds).toEqual([]);
    expect(report.goodFixtures.onlyExportComponents.ruleIds).toEqual([]);

    expect(report.documentedOnlyRules).toContain("react-compiler purity");
  });
});
