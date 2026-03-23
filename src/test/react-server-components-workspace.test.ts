// @vitest-environment node

import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { implementedSampleArtifacts } from "../implementedSampleArtifacts";

function compileServerComponentsWorkspace() {
  try {
    execFileSync(
      process.execPath,
      [
        "./node_modules/typescript/bin/tsc",
        "-p",
        "node-samples/react-server-components/tsconfig.json",
      ],
      {
        cwd: process.cwd(),
        stdio: "pipe",
      },
    );
  } catch (error) {
    const details =
      error instanceof Error && "stdout" in error
        ? String((error as { stdout?: Buffer | string }).stdout ?? "")
        : "";

    throw new Error(
      `Server components workspace compilation failed:\n${details}`,
    );
  }
}

describe("react server components workspace", () => {
  it("compiles and reports the expected RSC source boundaries", () => {
    const artifact =
      implementedSampleArtifacts["sample-react-server-components"];

    if (!artifact) {
      throw new Error(
        "Missing artifact config for sample-react-server-components.",
      );
    }

    compileServerComponentsWorkspace();

    const output = execFileSync(
      process.execPath,
      [
        "node-samples/react-server-components/dist/src/reportServerComponentBoundaries.js",
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: "pipe",
      },
    );

    const report = JSON.parse(output) as {
      readonly clientComponent: {
        readonly hasUseClientDirective: boolean;
        readonly usesUseStateHook: boolean;
      };
      readonly serverComponent: {
        readonly hasUseClientDirective: boolean;
        readonly defaultExportIsAsync: boolean;
        readonly importsClientComponent: boolean;
        readonly usesServerFunctionAsFormAction: boolean;
      };
      readonly serverFunctions: {
        readonly hasUseServerDirective: boolean;
        readonly exportedAsyncFunctions: readonly string[];
      };
      readonly inlineServerActionPage: {
        readonly inlineServerActions: readonly string[];
      };
      readonly documentedOnlyTopics: readonly string[];
    };

    expect(report.clientComponent.hasUseClientDirective).toBe(true);
    expect(report.clientComponent.usesUseStateHook).toBe(true);

    expect(report.serverComponent.hasUseClientDirective).toBe(false);
    expect(report.serverComponent.defaultExportIsAsync).toBe(true);
    expect(report.serverComponent.importsClientComponent).toBe(true);
    expect(report.serverComponent.usesServerFunctionAsFormAction).toBe(true);

    expect(report.serverFunctions.hasUseServerDirective).toBe(true);
    expect(report.serverFunctions.exportedAsyncFunctions).toContain(
      "createPost",
    );

    expect(report.inlineServerActionPage.inlineServerActions).toContain(
      "updateTheme",
    );
    expect(report.documentedOnlyTopics).toContain(
      "framework-aware bundler split",
    );
  });
});
