import { ESLint } from "eslint";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

interface LintFileReport {
  readonly ruleIds: readonly string[];
  readonly errorCount: number;
  readonly warningCount: number;
}

interface LintWorkspaceReport {
  readonly badFixtures: {
    readonly exhaustiveDeps: LintFileReport;
    readonly rulesOfHooks: LintFileReport;
    readonly onlyExportComponents: LintFileReport;
  };
  readonly goodFixtures: {
    readonly exhaustiveDeps: LintFileReport;
    readonly rulesOfHooks: LintFileReport;
    readonly onlyExportComponents: LintFileReport;
  };
  readonly documentedOnlyRules: readonly string[];
}

const workspaceRoot = resolve(
  fileURLToPath(new URL("../../", import.meta.url)),
);
const repoRoot = resolve(workspaceRoot, "../..");

const fixturePaths = {
  exhaustiveDepsBad: resolve(workspaceRoot, "fixtures/exhaustive-deps.bad.tsx"),
  exhaustiveDepsGood: resolve(
    workspaceRoot,
    "fixtures/exhaustive-deps.good.tsx",
  ),
  rulesOfHooksBad: resolve(workspaceRoot, "fixtures/rules-of-hooks.bad.tsx"),
  rulesOfHooksGood: resolve(workspaceRoot, "fixtures/rules-of-hooks.good.tsx"),
  onlyExportComponentsBad: resolve(
    workspaceRoot,
    "fixtures/only-export-components.bad.tsx",
  ),
  onlyExportComponentsGood: resolve(
    workspaceRoot,
    "fixtures/only-export-components.good.tsx",
  ),
} as const;

function toFileReport(
  messages: readonly { readonly ruleId: string | null }[],
  errorCount: number,
  warningCount: number,
): LintFileReport {
  return {
    ruleIds: messages
      .map((message) => message.ruleId)
      .filter((ruleId): ruleId is string => ruleId !== null),
    errorCount,
    warningCount,
  };
}

async function createReport(): Promise<LintWorkspaceReport> {
  const eslint = new ESLint({
    cwd: repoRoot,
    overrideConfigFile: resolve(repoRoot, "eslint.config.js"),
    errorOnUnmatchedPattern: false,
  });

  const results = await eslint.lintFiles(Object.values(fixturePaths));
  const resultByFileName = new Map(
    results.map((result) => [basename(result.filePath), result]),
  );

  function readFixtureReport(fileName: string) {
    const result = resultByFileName.get(fileName);

    if (!result) {
      throw new Error(`Missing lint result for ${fileName}.`);
    }

    return toFileReport(
      result.messages,
      result.errorCount,
      result.warningCount,
    );
  }

  return {
    badFixtures: {
      exhaustiveDeps: readFixtureReport("exhaustive-deps.bad.tsx"),
      rulesOfHooks: readFixtureReport("rules-of-hooks.bad.tsx"),
      onlyExportComponents: readFixtureReport("only-export-components.bad.tsx"),
    },
    goodFixtures: {
      exhaustiveDeps: readFixtureReport("exhaustive-deps.good.tsx"),
      rulesOfHooks: readFixtureReport("rules-of-hooks.good.tsx"),
      onlyExportComponents: readFixtureReport(
        "only-export-components.good.tsx",
      ),
    },
    documentedOnlyRules: ["react-compiler purity"],
  };
}

const report = await createReport();

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
