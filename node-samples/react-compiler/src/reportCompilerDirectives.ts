import * as ts from "typescript";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

interface AnnotationModeReport {
  readonly useMemoFunctions: readonly string[];
  readonly unannotatedPascalCaseFunctions: readonly string[];
}

interface EscapeHatchReport {
  readonly moduleUsesNoMemo: boolean;
  readonly useNoMemoFunctions: readonly string[];
}

interface InferModeReport {
  readonly pascalCaseCandidates: readonly string[];
  readonly lowercaseFunctions: readonly string[];
}

interface CompilerDirectiveReport {
  readonly annotationMode: AnnotationModeReport;
  readonly escapeHatches: EscapeHatchReport;
  readonly inferMode: InferModeReport;
  readonly documentedOnlyTopics: readonly string[];
}

const workspaceRoot = resolve(
  fileURLToPath(new URL("../../", import.meta.url)),
);

const fixturePaths = {
  annotationMode: resolve(workspaceRoot, "fixtures/annotationMode.tsx"),
  escapeHatches: resolve(workspaceRoot, "fixtures/escapeHatches.tsx"),
  inferMode: resolve(workspaceRoot, "fixtures/inferMode.tsx"),
} as const;

function createSourceFile(filePath: string) {
  return ts.createSourceFile(
    filePath,
    readFileSync(filePath, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
}

function getSourceFileDirectives(sourceFile: ts.SourceFile) {
  return sourceFile.statements
    .filter((statement): statement is ts.ExpressionStatement =>
      ts.isExpressionStatement(statement),
    )
    .map((statement) => statement.expression)
    .filter((expression): expression is ts.StringLiteral =>
      ts.isStringLiteral(expression),
    )
    .map((expression) => expression.text);
}

function getFunctionBodyDirectives(
  functionDeclaration: ts.FunctionDeclaration,
) {
  return (
    functionDeclaration.body?.statements
      .filter((statement): statement is ts.ExpressionStatement =>
        ts.isExpressionStatement(statement),
      )
      .map((statement) => statement.expression)
      .filter((expression): expression is ts.StringLiteral =>
        ts.isStringLiteral(expression),
      )
      .map((expression) => expression.text) ?? []
  );
}

function listNamedFunctions(sourceFile: ts.SourceFile) {
  return sourceFile.statements.filter(
    (statement): statement is ts.FunctionDeclaration =>
      ts.isFunctionDeclaration(statement) && Boolean(statement.name),
  );
}

function isPascalCase(name: string) {
  return /^[A-Z][A-Za-z0-9]*$/.test(name);
}

function readAnnotationModeReport(
  sourceFile: ts.SourceFile,
): AnnotationModeReport {
  const namedFunctions = listNamedFunctions(sourceFile);

  return {
    useMemoFunctions: namedFunctions
      .filter((declaration) =>
        getFunctionBodyDirectives(declaration).includes("use memo"),
      )
      .map((declaration) => declaration.name?.text ?? ""),
    unannotatedPascalCaseFunctions: namedFunctions
      .filter((declaration) => {
        const name = declaration.name?.text ?? "";
        return (
          isPascalCase(name) &&
          !getFunctionBodyDirectives(declaration).includes("use memo")
        );
      })
      .map((declaration) => declaration.name?.text ?? ""),
  };
}

function readEscapeHatchReport(sourceFile: ts.SourceFile): EscapeHatchReport {
  const namedFunctions = listNamedFunctions(sourceFile);

  return {
    moduleUsesNoMemo:
      getSourceFileDirectives(sourceFile).includes("use no memo"),
    useNoMemoFunctions: namedFunctions
      .filter((declaration) =>
        getFunctionBodyDirectives(declaration).includes("use no memo"),
      )
      .map((declaration) => declaration.name?.text ?? ""),
  };
}

function readInferModeReport(sourceFile: ts.SourceFile): InferModeReport {
  const namedFunctions = listNamedFunctions(sourceFile).map(
    (declaration) => declaration.name?.text ?? "",
  );

  return {
    pascalCaseCandidates: namedFunctions.filter((name) => isPascalCase(name)),
    lowercaseFunctions: namedFunctions.filter((name) => !isPascalCase(name)),
  };
}

function createReport(): CompilerDirectiveReport {
  const annotationMode = createSourceFile(fixturePaths.annotationMode);
  const escapeHatches = createSourceFile(fixturePaths.escapeHatches);
  const inferMode = createSourceFile(fixturePaths.inferMode);

  return {
    annotationMode: readAnnotationModeReport(annotationMode),
    escapeHatches: readEscapeHatchReport(escapeHatches),
    inferMode: readInferModeReport(inferMode),
    documentedOnlyTopics: [
      "babel or swc transform output",
      "generated _c cache slots",
      "react devtools memo badge",
    ],
  };
}

process.stdout.write(`${JSON.stringify(createReport(), null, 2)}\n`);
