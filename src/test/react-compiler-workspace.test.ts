// @vitest-environment node

import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { implementedSampleArtifacts } from "../implementedSampleArtifacts";

describe("react compiler workspace", () => {
  it("compiles and reports the expected compiler directive boundaries", () => {
    const artifact = implementedSampleArtifacts["sample-react-compiler"];

    if (!artifact) {
      throw new Error("Missing artifact config for sample-react-compiler.");
    }

    execFileSync(
      process.execPath,
      [
        "./node_modules/typescript/bin/tsc",
        "-p",
        "node-samples/react-compiler/tsconfig.json",
      ],
      {
        cwd: process.cwd(),
        stdio: "pipe",
      },
    );

    const output = execFileSync(
      process.execPath,
      ["node-samples/react-compiler/dist/src/reportCompilerDirectives.js"],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: "pipe",
      },
    );

    const report = JSON.parse(output) as {
      readonly annotationMode: {
        readonly useMemoFunctions: readonly string[];
        readonly unannotatedPascalCaseFunctions: readonly string[];
      };
      readonly escapeHatches: {
        readonly moduleUsesNoMemo: boolean;
        readonly useNoMemoFunctions: readonly string[];
      };
      readonly inferMode: {
        readonly pascalCaseCandidates: readonly string[];
        readonly lowercaseFunctions: readonly string[];
      };
      readonly documentedOnlyTopics: readonly string[];
    };

    expect(report.annotationMode.useMemoFunctions).toContain(
      "OptimizedDashboard",
    );
    expect(report.annotationMode.unannotatedPascalCaseFunctions).toContain(
      "SimpleHeader",
    );

    expect(report.escapeHatches.moduleUsesNoMemo).toBe(true);
    expect(report.escapeHatches.useNoMemoFunctions).toContain("CanvasRenderer");

    expect(report.inferMode.pascalCaseCandidates).toContain("ComplexDashboard");
    expect(report.inferMode.lowercaseFunctions).toContain("simpleDisplay");

    expect(report.documentedOnlyTopics).toContain("generated _c cache slots");
  });
});
