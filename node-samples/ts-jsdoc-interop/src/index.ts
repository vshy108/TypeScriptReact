// This TypeScript file imports from a JSDoc-typed JavaScript file.
// It demonstrates that allowJs + checkJs lets TypeScript consume JS modules
// with full type safety — the JSDoc annotations in release-notes.js provide
// the same type information that a .d.ts file would.

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { jsdocOutput, formatVersion, sampleNotes } =
  require("./release-notes.js") as typeof import("./release-notes.js");

// TypeScript infers the types from the JSDoc annotations in the .js file.
// If the JS file had a type error in its JSDoc, it would show up here too.
const versionCheck: string = formatVersion(3, 0, 0);

// The ReleaseNote typedef from the JS file is fully visible here.
const firstNote = sampleNotes[0];
const noteTitle: string | undefined = firstNote?.title;

// Build a summary that proves the JS module's types flow through correctly.
export const jsdocInteropSummary = Object.entries(jsdocOutput)
  .map(
    ([section, lines]) =>
      `[${section}]\n${(lines as readonly string[]).join("\n")}`,
  )
  .join("\n\n");

export const jsdocInteropSnapshot = {
  versionCheck,
  noteTitle: noteTitle ?? "missing",
  sectionCount: Object.keys(jsdocOutput).length,
} as const;
