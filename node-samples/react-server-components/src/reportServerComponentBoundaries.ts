import * as ts from "typescript";
import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

interface ClientComponentReport {
  readonly hasUseClientDirective: boolean;
  readonly usesUseStateHook: boolean;
}

interface ServerComponentReport {
  readonly hasUseClientDirective: boolean;
  readonly defaultExportIsAsync: boolean;
  readonly importsClientComponent: boolean;
  readonly usesServerFunctionAsFormAction: boolean;
}

interface ServerFunctionModuleReport {
  readonly hasUseServerDirective: boolean;
  readonly exportedAsyncFunctions: readonly string[];
}

interface InlineServerActionReport {
  readonly inlineServerActions: readonly string[];
}

interface ServerComponentBoundaryReport {
  readonly clientComponent: ClientComponentReport;
  readonly serverComponent: ServerComponentReport;
  readonly serverFunctions: ServerFunctionModuleReport;
  readonly inlineServerActionPage: InlineServerActionReport;
  readonly documentedOnlyTopics: readonly string[];
}

const workspaceRoot = resolve(
  fileURLToPath(new URL("../../", import.meta.url)),
);

const fixturePaths = {
  clientComponent: resolve(workspaceRoot, "fixtures/components/LikeButton.tsx"),
  serverComponent: resolve(workspaceRoot, "fixtures/app/posts/page.tsx"),
  serverFunctions: resolve(workspaceRoot, "fixtures/actions/posts.ts"),
  inlineServerActionPage: resolve(
    workspaceRoot,
    "fixtures/app/settings/page.tsx",
  ),
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

function getDirectives(sourceFile: ts.SourceFile) {
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

function hasDirective(sourceFile: ts.SourceFile, directive: string) {
  return getDirectives(sourceFile).includes(directive);
}

function findDefaultExportFunction(sourceFile: ts.SourceFile) {
  return sourceFile.statements.find(
    (statement): statement is ts.FunctionDeclaration =>
      ts.isFunctionDeclaration(statement) &&
      statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword,
      ) === true,
  );
}

function findStringLiteralFormActions(sourceFile: ts.SourceFile) {
  const actionNames: string[] = [];

  function visit(node: ts.Node) {
    if (
      ts.isJsxAttribute(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === "action" &&
      node.initializer &&
      ts.isJsxExpression(node.initializer)
    ) {
      const expression = node.initializer.expression;
      if (expression && ts.isIdentifier(expression)) {
        actionNames.push(expression.text);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return actionNames;
}

function readClientComponentReport(
  sourceFile: ts.SourceFile,
): ClientComponentReport {
  let usesUseStateHook = false;

  function visit(node: ts.Node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "useState"
    ) {
      usesUseStateHook = true;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return {
    hasUseClientDirective: hasDirective(sourceFile, "use client"),
    usesUseStateHook,
  };
}

function readServerComponentReport(
  sourceFile: ts.SourceFile,
): ServerComponentReport {
  const defaultExport = findDefaultExportFunction(sourceFile);
  const importsClientComponent = sourceFile.statements.some(
    (statement) =>
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      statement.moduleSpecifier.text.includes("components/LikeButton"),
  );

  return {
    hasUseClientDirective: hasDirective(sourceFile, "use client"),
    defaultExportIsAsync:
      defaultExport?.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword,
      ) === true,
    importsClientComponent,
    usesServerFunctionAsFormAction:
      findStringLiteralFormActions(sourceFile).includes("createPost"),
  };
}

function readServerFunctionModuleReport(
  sourceFile: ts.SourceFile,
): ServerFunctionModuleReport {
  const exportedAsyncFunctions = sourceFile.statements.flatMap((statement) => {
    if (!ts.isFunctionDeclaration(statement) || !statement.name) {
      return [];
    }

    const isExported =
      statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      ) === true;
    const isAsync =
      statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword,
      ) === true;

    return isExported && isAsync ? [statement.name.text] : [];
  });

  return {
    hasUseServerDirective: hasDirective(sourceFile, "use server"),
    exportedAsyncFunctions,
  };
}

function readInlineServerActionReport(
  sourceFile: ts.SourceFile,
): InlineServerActionReport {
  const inlineServerActions: string[] = [];

  function visit(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) && node.name && node.body) {
      const firstStatement = node.body.statements[0];
      const hasInlineUseServerDirective = Boolean(
        firstStatement &&
        ts.isExpressionStatement(firstStatement) &&
        ts.isStringLiteral(firstStatement.expression) &&
        firstStatement.expression.text === "use server",
      );

      if (hasInlineUseServerDirective) {
        inlineServerActions.push(node.name.text);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return { inlineServerActions };
}

function createReport(): ServerComponentBoundaryReport {
  const clientComponent = createSourceFile(fixturePaths.clientComponent);
  const serverComponent = createSourceFile(fixturePaths.serverComponent);
  const serverFunctions = createSourceFile(fixturePaths.serverFunctions);
  const inlineServerActionPage = createSourceFile(
    fixturePaths.inlineServerActionPage,
  );

  return {
    clientComponent: readClientComponentReport(clientComponent),
    serverComponent: readServerComponentReport(serverComponent),
    serverFunctions: readServerFunctionModuleReport(serverFunctions),
    inlineServerActionPage: readInlineServerActionReport(
      inlineServerActionPage,
    ),
    documentedOnlyTopics: [
      "framework-aware bundler split",
      "runtime serialization enforcement",
      `full RSC transport for ${basename(fixturePaths.serverComponent)}`,
    ],
  };
}

process.stdout.write(`${JSON.stringify(createReport(), null, 2)}\n`);
