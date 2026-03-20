// This sample demonstrates advanced tsconfig options beyond the standard strict baseline.
// Each section activates a compiler option and shows what it catches or enables.
// The options are grouped by purpose: safety, output, resolution, and project structure.

// ============================================================================
// 1. noUncheckedIndexedAccess — already in the main project
// ============================================================================
// Forces index signatures to include | undefined, catching unsafe property access.
// Without this, accessing record[key] is assumed non-undefined even though
// the key may not exist at runtime.

interface MetricRegistry {
  readonly [metric: string]: number;
}

function readMetric(registry: MetricRegistry, key: string): number {
  const value = registry[key];
  // With noUncheckedIndexedAccess, `value` is `number | undefined`.
  // This guard is required — without it, TypeScript would error.
  if (value === undefined) {
    return 0;
  }
  return value;
}

// ============================================================================
// 2. noPropertyAccessFromIndexSignature
// ============================================================================
// Forces bracket notation for index-signature properties, making it visually
// clear when you are accessing a string-keyed property that may not exist.
// Without this option, registry.cpuLoad would compile (but might be undefined).

function demonstratePropertyAccess(registry: MetricRegistry): string {
  // This uses bracket notation as required by noPropertyAccessFromIndexSignature.
  // registry.cpuLoad would error because cpuLoad is not a declared property —
  // it comes from the index signature, so bracket access makes the intent explicit.
  const cpu = registry["cpuLoad"];
  return cpu !== undefined ? `CPU: ${cpu}%` : "CPU metric not found";
}

// ============================================================================
// 3. exactOptionalPropertyTypes — already in the main project
// ============================================================================
// Distinguishes between { key?: string } (absent) and { key: string | undefined } (present but undefined).
// This catches bugs where code sets an optional property to undefined when it should omit it entirely.

interface DeployConfig {
  readonly name: string;
  readonly region?: "us-east" | "eu-west" | "ap-south";
}

function createDeployConfig(
  name: string,
  region?: "us-east" | "eu-west" | "ap-south",
): DeployConfig {
  // With exactOptionalPropertyTypes, you CANNOT write: { name, region: undefined }
  // because the type says region is optional (absent), not explicitly undefined.
  // This forces you to conditionally include the property:
  if (region) {
    return { name, region };
  }
  return { name };
}

// ============================================================================
// 4. noFallthroughCasesInSwitch
// ============================================================================
// Prevents accidental fallthrough in switch statements without an explicit break or return.
// This catches a common bug where a missing break silently runs the next case.

type BuildStage = "compile" | "bundle" | "deploy";

function describeBuildStage(stage: BuildStage): string {
  // Every case must end with break, return, or throw.
  // Removing the return here would cause a compile error.
  switch (stage) {
    case "compile":
      return "TypeScript type-checks and transpiles the source.";
    case "bundle":
      return "Vite or Rollup creates optimized output chunks.";
    case "deploy":
      return "Artifacts are pushed to the target environment.";
  }
}

// ============================================================================
// 5. resolveJsonModule
// ============================================================================
// Allows importing .json files as modules with typed shapes.
// TypeScript infers the type from the JSON structure, so you get
// autocomplete and type-checking on JSON data without manual typing.
//
// Example (not executed here because it needs a .json file):
//
//   import packageJson from './package.json'
//   const version: string = packageJson.version
//
// TypeScript infers the full shape: { name: string, version: string, ... }

// ============================================================================
// 6. composite + incremental
// ============================================================================
// composite: true enables project references, letting tsc -b build only what changed.
// incremental: true persists a .tsbuildinfo file so subsequent builds skip unchanged files.
//
// These options are essential for monorepos and multi-package workspaces.
// The main project already uses tsc -b with project references across:
//   - tsconfig.app.json (the Vite app)
//   - tsconfig.node.json (Vite config)
//   - tsconfig.test.json (Vitest tests)
//   - node-samples/*/tsconfig.json (isolated sample projects)
//
// In this tsconfig, composite + incremental are both enabled, so running:
//   tsc -p node-samples/ts-advanced-tsconfig/tsconfig.json
// produces a .tsbuildinfo file and only recompiles what changed on subsequent runs.

// ============================================================================
// 7. declaration + sourceMap
// ============================================================================
// declaration: true emits .d.ts files alongside .js output, making your package
// consumable by other TypeScript projects without distributing source.
// sourceMap: true emits .js.map files that let debuggers step through original .ts code.
//
// These are standard for library authoring. In this sample, noEmit is true
// so no files are written, but the compiler still validates declaration compatibility.

// ============================================================================
// 8. allowArbitraryExtensions
// ============================================================================
// Allows importing files with non-standard extensions (e.g., .css, .svg, .graphql)
// as long as a matching .d.ts declaration file exists.
//
// Example:
//   // widget.css.d.ts
//   declare const styles: { readonly container: string; readonly title: string }
//   export default styles
//
//   // component.ts
//   import styles from './widget.css'  // Works with allowArbitraryExtensions
//
// This is useful in Vite/webpack projects where bundler plugins resolve non-JS imports.

// ============================================================================
// 9. verbatimModuleSyntax — already in the main project
// ============================================================================
// Requires explicit `import type` for type-only imports and prevents TypeScript
// from silently eliding imports that look like values but resolve to types.
//
// Before (with erasableSyntaxOnly or isolatedModules):
//   import { SomeType } from './types'  // Ambiguous — is it a value or type?
//
// After (with verbatimModuleSyntax):
//   import type { SomeType } from './types'  // Explicit — only used at compile time
//   import { someFunction } from './utils'    // Explicit — used at runtime

// ============================================================================
// 10. moduleDetection: "force"
// ============================================================================
// Forces every file to be treated as a module (has its own scope), even if it
// lacks import/export statements. Without this, a file with no imports/exports
// is treated as a global script, which can cause accidental name collisions
// across files.

// ============================================================================
// Combined output — proves every demonstrated option type-checks
// ============================================================================

const registry: MetricRegistry = { cpuLoad: 78, memoryUsage: 62 };

export const advancedTsconfigOutput = {
  indexedAccess: readMetric(registry, "cpuLoad"),
  missingMetric: readMetric(registry, "diskIo"),
  propertyAccess: demonstratePropertyAccess(registry),
  deployConfig: createDeployConfig("staging"),
  deployConfigWithRegion: createDeployConfig("production", "us-east"),
  buildStage: describeBuildStage("bundle"),
} as const;

export const advancedTsconfigSummary = Object.entries(advancedTsconfigOutput)
  .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
  .join("\n");
