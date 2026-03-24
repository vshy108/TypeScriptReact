// This sample covers the lesser-used TypeScript runtime features:
// enums, symbols, iterators, generators, decorators (TC39 stage 3), mixins, and namespaces.
// Each section is self-contained and explains when the feature is appropriate versus
// when a simpler alternative (like unions or plain objects) works better.

// ============================================================================
// 1. ENUMS — named constants with reverse mapping
// ============================================================================

// Numeric enums auto-increment and support reverse mapping (value → name).
// Use enums when you need a closed set of values that also appears in compiled output.
// Prefer union types when you only need compile-time checking and no runtime artifact.
enum DeployStage {
  Build = 0,
  Test = 1,
  Staging = 2,
  Production = 3,
}

// String enums are fully opaque at runtime — no reverse mapping.
// They read better in logs and serialized output than numeric enums.
enum NotificationChannel {
  Email = "email",
  Slack = "slack",
  PagerDuty = "pagerduty",
}

// const enums are inlined at compile time and leave no runtime object.
// They are the lightest option but cannot be used with isolatedModules in some configs.
// NOTE: With verbatimModuleSyntax, const enums are preserved as regular enums.
const enum Priority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3,
}

function describeStage(stage: DeployStage): string {
  // Reverse mapping: DeployStage[stage] gives the string name from a numeric value.
  return `Stage ${stage}: ${DeployStage[stage]}`;
}

function formatNotification(
  channel: NotificationChannel,
  message: string,
): string {
  return `[${channel}] ${message}`;
}

const enumOutput = [
  describeStage(DeployStage.Build),
  describeStage(DeployStage.Production),
  formatNotification(NotificationChannel.Slack, "Deploy complete"),
  `Priority value: ${Priority.Critical}`,
];

// ============================================================================
// 2. SYMBOLS — unique property keys and well-known protocols
// ============================================================================

// Symbols create guaranteed-unique property keys, even if two different modules
// happen to use the same string description. They are ideal for internal metadata
// that should not collide with user-facing properties.
const traceIdSymbol = Symbol("traceId");
const versionSymbol = Symbol("version");

interface Traceable {
  readonly [traceIdSymbol]: string;
  readonly [versionSymbol]: number;
}

function createTraceable(traceId: string, version: number): Traceable {
  return {
    [traceIdSymbol]: traceId,
    [versionSymbol]: version,
  };
}

// Symbol.for creates a global symbol shared across realms.
// Use this sparingly — it loses the uniqueness guarantee that makes symbols valuable.
const globalMarker = Symbol.for("app.globalMarker");

const symbolOutput = (() => {
  const record = createTraceable("trace-abc-123", 4);
  return [
    `Trace ID: ${record[traceIdSymbol]}`,
    `Version: ${record[versionSymbol]}`,
    `Global symbol key: ${Symbol.keyFor(globalMarker) ?? "unknown"}`,
    `Symbols are unique: ${Symbol("x") !== Symbol("x")}`,
  ];
})();

// ============================================================================
// 3. ITERATORS AND GENERATORS — custom iteration protocols
// ============================================================================

// A class that implements the iterable protocol lets instances work with for-of,
// spread, and destructuring. The Symbol.iterator well-known symbol connects your
// class to the built-in iteration machinery.

class RingBuffer<T> implements Iterable<T> {
  private readonly items: T[];
  private head = 0;

  constructor(private readonly capacity: number) {
    this.items = [];
  }

  push(item: T): void {
    if (this.items.length < this.capacity) {
      this.items.push(item);
    } else {
      this.items[this.head] = item;
      this.head = (this.head + 1) % this.capacity;
    }
  }

  // The Symbol.iterator method makes this class iterable.
  // It yields items in insertion order starting from the oldest.
  *[Symbol.iterator](): Iterator<T> {
    const len = this.items.length;
    for (let i = 0; i < len; i++) {
      yield this.items[(this.head + i) % len]!;
    }
  }
}

// A generator function that produces an infinite sequence.
// Generators are lazy — they produce values on demand without allocating the full sequence.
function* fibonacci(): Generator<number, never, undefined> {
  let a = 0;
  let b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

function take<T>(count: number, iterable: Iterable<T>): T[] {
  const result: T[] = [];
  for (const item of iterable) {
    result.push(item);
    if (result.length >= count) break;
  }
  return result;
}

const iteratorOutput = (() => {
  const ring = new RingBuffer<string>(3);
  ring.push("alpha");
  ring.push("bravo");
  ring.push("charlie");
  ring.push("delta"); // Overwrites 'alpha'

  const ringValues = [...ring];
  const fib10 = take(10, fibonacci());

  return [
    `Ring buffer (capacity 3): [${ringValues.join(", ")}]`,
    `Fibonacci first 10: [${fib10.join(", ")}]`,
  ];
})();

// ============================================================================
// 4. DECORATORS — TC39 stage 3 (not legacy experimentalDecorators)
// ============================================================================

// TC39 decorators (stage 3) are now part of TypeScript 5.0+ without the
// experimentalDecorators flag. They receive a standardized context object
// instead of the legacy (target, propertyKey, descriptor) signature.
// Use decorators for cross-cutting concerns like logging, validation, or caching.

function logged<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<
    This,
    (this: This, ...args: Args) => Return
  >,
): (this: This, ...args: Args) => Return {
  const methodName = String(context.name);

  return function (this: This, ...args: Args): Return {
    decoratorLog.push(`→ ${methodName} called with ${args.length} arg(s)`);
    const result = target.call(this, ...args);
    decoratorLog.push(`← ${methodName} returned`);
    return result;
  };
}

// A class field decorator that validates the initial value is non-empty.
function nonEmpty<This>(
  _target: undefined,
  context: ClassFieldDecoratorContext<This, string>,
): (this: This, value: string) => string {
  const fieldName = String(context.name);

  return function (_value: string): string {
    if (!_value.trim()) {
      throw new Error(`${fieldName} must not be empty.`);
    }
    return _value;
  };
}

const decoratorLog: string[] = [];

class AuditService {
  @nonEmpty
  readonly label: string;

  constructor(label: string) {
    this.label = label;
  }

  @logged
  recordEvent(eventName: string): string {
    return `[${this.label}] Event recorded: ${eventName}`;
  }
}

const decoratorOutput = (() => {
  const service = new AuditService("Release audit");
  const result = service.recordEvent("deploy-started");
  return [result, ...decoratorLog];
})();

// ============================================================================
// 5. MIXINS — composing behavior from multiple sources
// ============================================================================

// TypeScript does not support multiple inheritance, but mixins provide a pattern
// for composing behaviors from several sources into one class. Each mixin is a
// function that takes a base class and returns a subclass with added capabilities.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

interface Timestamped {
  readonly createdAt: Date;
  formatCreatedAt(): string;
}

interface Tagged {
  readonly tags: string[];
  addTag(tag: string): void;
  hasTag(tag: string): boolean;
}

function withTimestamp<TBase extends Constructor>(Base: TBase) {
  return class extends Base implements Timestamped {
    readonly createdAt = new Date();

    formatCreatedAt(): string {
      return this.createdAt.toISOString().slice(0, 19);
    }
  };
}

function withTags<TBase extends Constructor>(Base: TBase) {
  return class extends Base implements Tagged {
    readonly tags: string[] = [];

    addTag(tag: string): void {
      if (!this.tags.includes(tag)) {
        this.tags.push(tag);
      }
    }

    hasTag(tag: string): boolean {
      return this.tags.includes(tag);
    }
  };
}

// Compose mixins: Base → Timestamped → Tagged
class BaseRecord {
  constructor(readonly name: string) {}
}

const EnhancedRecord = withTags(withTimestamp(BaseRecord));

const mixinOutput = (() => {
  const record = new EnhancedRecord("Release record");
  record.addTag("platform");
  record.addTag("v2");
  record.addTag("platform"); // Duplicate ignored

  return [
    `Name: ${record.name}`,
    `Created: ${record.formatCreatedAt()}`,
    `Tags: [${record.tags.join(", ")}]`,
    `Has "v2": ${record.hasTag("v2")}`,
    `Has "beta": ${record.hasTag("beta")}`,
  ];
})();

// ============================================================================
// 6. NAMESPACES — organizing related types and values
// ============================================================================

// Namespaces are TypeScript's original module system, predating ES modules.
// In modern code, ES modules replace almost all namespace use cases.
// Namespaces still appear in declaration files (e.g., global augmentations)
// and in legacy codebases. Use them sparingly — prefer ES modules for new code.

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace ReleaseProtocol {
  export interface Step {
    readonly name: string;
    readonly required: boolean;
  }

  export interface Plan {
    readonly steps: readonly Step[];
    readonly owner: string;
  }

  export function summarize(plan: Plan): string {
    const required = plan.steps.filter((s) => s.required).length;
    return `${plan.owner}: ${plan.steps.length} steps (${required} required)`;
  }
}

const namespaceOutput = (() => {
  const plan: ReleaseProtocol.Plan = {
    owner: "Platform core",
    steps: [
      { name: "Lint check", required: true },
      { name: "Unit tests", required: true },
      { name: "Visual diff", required: false },
      { name: "Deploy canary", required: true },
    ],
  };
  return [
    ReleaseProtocol.summarize(plan),
    `Steps: ${plan.steps.map((s) => s.name).join(", ")}`,
  ];
})();

// ============================================================================
// 7. TEMPORAL — date and time without the legacy Date footguns
// ============================================================================
// The Temporal API (stage 4, shipping in ES2025+) replaces the mutable, timezone-confused
// Date object with immutable value types for instants, plain dates, times, and durations.
// TypeScript 6.0 adds built-in types via esnext.temporal.

const temporalOutput = (() => {
  const lines: string[] = [];

  // Temporal.Now.instant() captures the current moment on the UTC timeline.
  const now = Temporal.Now.instant();
  lines.push(`Current instant: ${now}`);

  // PlainDate represents a calendar date with no time or timezone.
  const releaseDate = Temporal.PlainDate.from("2026-03-15");
  const followUp = releaseDate.add({ days: 7 });
  lines.push(
    `Release: ${releaseDate}, follow-up: ${followUp} (${Temporal.PlainDate.compare(followUp, releaseDate)} days later)`,
  );

  // Duration models a length of time and supports rounding and balancing.
  const sprintLength = Temporal.Duration.from({ weeks: 2 });
  lines.push(`Sprint length: ${sprintLength}`);

  // PlainDateTime for datebook-style scheduling without timezone ambiguity.
  const meeting = Temporal.PlainDateTime.from("2026-03-24T10:30:00");
  const meetingEnd = meeting.add({ hours: 1, minutes: 30 });
  lines.push(`Meeting: ${meeting} → ${meetingEnd}`);

  return lines;
})();

// ============================================================================
// 8. MAP UPSERT — getOrInsert and getOrInsertComputed
// ============================================================================
// The "upsert" proposal (stage 4) adds getOrInsert and getOrInsertComputed to
// Map and WeakMap, replacing the tedious has/get/set pattern.

const mapUpsertOutput = (() => {
  const lines: string[] = [];

  // getOrInsert: return the existing value or insert the default and return it.
  const tagCounts = new Map<string, number>();
  const firstInsert = tagCounts.getOrInsert("deploy", 0);
  tagCounts.set("deploy", tagCounts.getOrInsert("deploy", 0) + 1);
  const afterIncrement = tagCounts.get("deploy");
  lines.push(
    `getOrInsert — first: ${firstInsert}, after increment: ${afterIncrement}`,
  );

  // getOrInsertComputed: the default is lazily computed only when the key is missing.
  const deployLogs = new Map<string, string[]>();
  const logs = deployLogs.getOrInsertComputed("canary", () => []);
  logs.push("Region EU healthy");
  logs.push("Region US healthy");
  lines.push(
    `getOrInsertComputed — logs for canary: [${deployLogs.get("canary")?.join(", ")}]`,
  );

  return lines;
})();

// ============================================================================
// 9. REGEXP.ESCAPE — safe dynamic regex construction
// ============================================================================
// RegExp.escape (stage 4, ES2025) escapes special regex characters in a string
// so it can be safely interpolated into a RegExp pattern.

const regexpEscapeOutput = (() => {
  const lines: string[] = [];

  const userInput = "deploy (v2.0+hotfix)";
  const escaped = RegExp.escape(userInput);
  lines.push(`Raw: "${userInput}" → escaped: "${escaped}"`);

  // Safe whole-word matching with user-supplied text.
  const text =
    "Rollout includes deploy (v2.0+hotfix) for the EU region and deploy (v3.0) for US.";
  const regex = new RegExp(`\\b${escaped}\\b`, "g");
  const matches = text.match(regex);
  lines.push(`Matches in text: ${matches?.length ?? 0}`);

  return lines;
})();

// ============================================================================
// Combined output — proves every feature runs and type-checks
// ============================================================================

export const advancedRuntimeOutput = {
  enums: enumOutput,
  symbols: symbolOutput,
  iterators: iteratorOutput,
  decorators: decoratorOutput,
  mixins: mixinOutput,
  namespaces: namespaceOutput,
  temporal: temporalOutput,
  mapUpsert: mapUpsertOutput,
  regexpEscape: regexpEscapeOutput,
} as const;

export const advancedRuntimeSummary = Object.entries(advancedRuntimeOutput)
  .map(([section, lines]) => `[${section}]\n${lines.join("\n")}`)
  .join("\n\n");
