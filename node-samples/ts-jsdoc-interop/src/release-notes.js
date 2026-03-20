// @ts-check

// This JavaScript file is type-checked by TypeScript through allowJs + checkJs.
// All type information comes from JSDoc comments — no .ts extension, no syntax changes.
// This is the recommended approach for gradually typing an existing JavaScript codebase.

// ============================================================================
// 1. Basic JSDoc types — @param, @returns, @type
// ============================================================================

/**
 * Formats a release version string from its components.
 * TypeScript infers the return type as string, but @returns makes it explicit.
 *
 * @param {number} major - Major version number.
 * @param {number} minor - Minor version number.
 * @param {number} patch - Patch version number.
 */
function formatVersion(major, minor, patch) {
  return `${major}.${minor}.${patch}`
}

/** @type {string} */
const currentVersion = formatVersion(2, 14, 0)

// ============================================================================
// 2. Object shapes with @typedef
// ============================================================================

/**
 * @typedef {object} ReleaseNote
 * @property {string} id - Unique identifier for the note.
 * @property {string} title - Short title for the change.
 * @property {'feature' | 'bugfix' | 'breaking'} kind - The category of change.
 * @property {string} description - Detailed explanation.
 * @property {boolean} [highlighted] - Whether this note is pinned at the top.
 */

/**
 * Creates a release note with default values filled in.
 *
 * @param {Pick<ReleaseNote, 'id' | 'title' | 'kind' | 'description'>} base - Required fields.
 * @returns {ReleaseNote}
 */
function createReleaseNote(base) {
  return {
    highlighted: false,
    ...base,
  }
}

/** @type {readonly ReleaseNote[]} */
const sampleNotes = [
  createReleaseNote({ id: 'note-1', title: 'New hook API', kind: 'feature', description: 'Added useResource for data fetching.' }),
  createReleaseNote({ id: 'note-2', title: 'Fix memo leak', kind: 'bugfix', description: 'Resolved stale closure in useMemo callback.' }),
  createReleaseNote({ id: 'note-3', title: 'Drop legacy export', kind: 'breaking', description: 'Removed createLegacyRoot entry point.' }),
]

// ============================================================================
// 3. Generics with @template
// ============================================================================

/**
 * Groups an array of items by a key derived from each item.
 * Uses generic type parameters declared with JSDoc annotations.
 *
 * @template T
 * @template {string} K
 * @param {readonly T[]} items - The items to group.
 * @param {(item: T) => K} keyFn - A function that extracts the grouping key.
 * @returns {Record<string, T[]>}
 */
function groupBy(items, keyFn) {
  /** @type {Record<string, T[]>} */
  const groups = Object.create(null)

  for (const item of items) {
    const key = keyFn(item)
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
  }

  return groups
}

const notesByKind = groupBy(sampleNotes, (note) => note.kind)

// ============================================================================
// 4. Classes with JSDoc
// ============================================================================

/**
 * A minimal event emitter typed entirely through JSDoc.
 * Shows that class-based patterns work with checkJs just as well as functions.
 *
 * @template {Record<string, unknown[]>} EventMap
 */
class TypedEmitter {
  constructor() {
    /** @type {Map<string, Function[]>} */
    this.listeners = new Map()
  }

  /**
   * Register a listener for an event.
   *
   * @template {keyof EventMap & string} E
   * @param {E} event - The event name.
   * @param {(...args: EventMap[E]) => void} handler - The callback.
   */
  on(event, handler) {
    const existing = this.listeners.get(event) ?? []
    existing.push(handler)
    this.listeners.set(event, existing)
  }

  /**
   * Emit an event, calling all registered handlers.
   *
   * @template {keyof EventMap & string} E
   * @param {E} event - The event name.
   * @param {EventMap[E]} args - Arguments to pass to handlers.
   */
  emit(event, ...args) {
    const handlers = this.listeners.get(event) ?? []
    for (const handler of handlers) {
      handler(...args)
    }
  }
}

/**
 * @typedef {{ deployed: [version: string], rolledBack: [version: string, reason: string] }} ReleaseEvents
 */

/** @type {TypedEmitter<ReleaseEvents>} */
const releaseEmitter = new TypedEmitter()

/** @type {string[]} */
const emitterLog = []

releaseEmitter.on('deployed', (version) => {
  emitterLog.push(`Deployed ${version}`)
})

releaseEmitter.on('rolledBack', (version, reason) => {
  emitterLog.push(`Rolled back ${version}: ${reason}`)
})

releaseEmitter.emit('deployed', currentVersion)
releaseEmitter.emit('rolledBack', '2.13.0', 'Memory regression in staging')

// ============================================================================
// 5. Type imports from .js files — @import tag (TS 5.5+)
// ============================================================================

// In TypeScript 5.5+, you can use the @import tag to import types from other
// files without a runtime import statement. This is equivalent to
// `import type { ... } from '...'` in TypeScript files.
// See the consumer file (index.ts) for usage.

// ============================================================================
// Combined output — proves every feature type-checks and runs
// ============================================================================

/** @type {Record<string, readonly string[]>} */
const jsdocOutput = {
  basics: [
    `Version: ${currentVersion}`,
    `formatVersion return type checked by @returns`,
  ],
  typedef: sampleNotes.map((n) => `[${n.kind}] ${n.title}${n.highlighted ? ' ★' : ''}`),
  generics: Object.entries(notesByKind).map(([kind, notes]) => `${kind}: ${notes.length} note(s)`),
  classes: emitterLog,
}

module.exports = { jsdocOutput, sampleNotes, formatVersion, groupBy, TypedEmitter }
