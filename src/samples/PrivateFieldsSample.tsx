// private vs #private fields and class features
// ------------------------------------------------
// This sample demonstrates the critical differences between TypeScript's
// compile-time `private` keyword and JavaScript's runtime `#private` fields,
// along with related class features:
//
// 1. `private` (TS) — Compile-time only. Erased at runtime. Can be accessed
//    via bracket notation or `any` cast. Does NOT provide real encapsulation.
//
// 2. `#field` (JS/TS) — True runtime privacy via WeakMap-based encapsulation.
//    Cannot be accessed from outside the class, even with bracket notation or
//    `any` cast. Part of the ECMAScript standard (ES2022+).
//
// 3. `override` keyword (TS 4.3+) — Explicit annotation when a subclass
//    method overrides a parent method. Catches typos and signature mismatches.
//
// 4. Constructor parameter properties — Shorthand that declares and assigns
//    a property in the constructor parameter list.
//
// 5. Initialization order — Field initializers run in declaration order,
//    before the constructor body. This can cause subtle bugs when one field
//    depends on another.

import { useState } from "react";

// ---------------------------------------------------------------------------
// Section 1: private (TS) vs #private (JS) — runtime behavior
// ---------------------------------------------------------------------------

class TsPrivateExample {
  private secret = "ts-private-value";

  getSecret(): string {
    return this.secret;
  }
}

class JsPrivateExample {
  #secret = "js-private-value";

  getSecret(): string {
    return this.#secret;
  }
}

// Demonstrate the difference at runtime.
function comparePrivacy(): readonly string[] {
  const ts = new TsPrivateExample();
  const js = new JsPrivateExample();

  const results: string[] = [];

  // TS private: accessible via bracket notation at runtime (no real privacy).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tsLeaked = (ts as any)["secret"] as string;
  results.push(`TS private via bracket: "${tsLeaked}"`);

  // #private: NOT accessible via bracket notation — returns undefined.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsLeaked = (js as any)["secret"] as string | undefined;
  results.push(`JS #private via bracket: ${jsLeaked ?? "undefined (truly private)"}`);

  // #private: even Object.keys() doesn't see it.
  results.push(`Object.keys(ts): [${Object.keys(ts).join(", ")}]`);
  results.push(`Object.keys(js): [${Object.keys(js).join(", ")}]`);

  // #private with `in` operator — the only way to check from outside.
  // This is called the "brand check" pattern.
  // Note: TS doesn't allow `#secret in obj` outside the class, so we
  // demonstrate this concept in the explanation only.

  return results;
}

// ---------------------------------------------------------------------------
// Section 2: override keyword (TS 4.3+)
// ---------------------------------------------------------------------------

class BaseLogger {
  log(message: string): string {
    return `[BASE] ${message}`;
  }

  warn(message: string): string {
    return `[WARN] ${message}`;
  }
}

class StrictLogger extends BaseLogger {
  // `override` ensures the parent has a method with this exact name.
  // If the parent renames `log`, this will produce a compile error.
  override log(message: string): string {
    return `[STRICT] ${message}`;
  }

  // Without `override`, a typo would silently create a new method:
  // wran(message: string) { ... }  ← doesn't override `warn`, just adds a new method
  //
  // With `override`:
  // override wran(message: string) { ... }  ← compile error: no `wran` in parent
}

function demonstrateOverride(): readonly string[] {
  const logger = new StrictLogger();
  return [
    logger.log("hello"), // "[STRICT] hello"
    logger.warn("caution"), // "[WARN] caution" — inherited, not overridden
  ];
}

// ---------------------------------------------------------------------------
// Section 3: Constructor parameter properties
// ---------------------------------------------------------------------------

// Shorthand: `readonly name: string` in the constructor parameter list
// declares the property AND assigns it in one step.
class Employee {
  constructor(
    readonly name: string,
    private readonly department: string,
    protected salary: number,
  ) {
    // No manual `this.name = name` needed — the parameter property does it.
  }

  describe(): string {
    return `${this.name} (${this.department}), salary: ${this.salary}`;
  }
}

// Equivalent without parameter properties (more verbose):
class EmployeeVerbose {
  readonly name: string;
  private readonly department: string;
  protected salary: number;

  constructor(name: string, department: string, salary: number) {
    this.name = name;
    this.department = department;
    this.salary = salary;
  }

  describe(): string {
    return `${this.name} (${this.department}), salary: ${this.salary}`;
  }
}

function demonstrateParamProps(): readonly string[] {
  const emp = new Employee("Alice", "Engineering", 120000);
  const empV = new EmployeeVerbose("Bob", "Design", 110000);
  return [emp.describe(), empV.describe()];
}

// ---------------------------------------------------------------------------
// Section 4: Initialization order
// ---------------------------------------------------------------------------

class InitOrderDemo {
  // Field initializers run in declaration order, BEFORE the constructor body.
  first = "initialized first";
  second = this.computeSecond(); // uses `this.first` — it's already set
  third: string; // set in constructor body

  constructor() {
    // By this point, `first` and `second` are already initialized.
    this.third = `third (first=${this.first}, second=${this.second})`;
  }

  private computeSecond(): string {
    return `depends on first="${this.first}"`;
  }

  describe(): readonly string[] {
    return [
      `first: "${this.first}"`,
      `second: "${this.second}"`,
      `third: "${this.third}"`,
    ];
  }
}

function demonstrateInitOrder(): readonly string[] {
  const demo = new InitOrderDemo();
  return demo.describe();
}

// ---------------------------------------------------------------------------
// Display components
// ---------------------------------------------------------------------------

interface DemoSection {
  readonly id: string;
  readonly title: string;
  readonly getResults: () => readonly string[];
  readonly explanation: string;
}

const demoSections: readonly DemoSection[] = [
  {
    id: "privacy",
    title: "private (TS) vs #private (JS)",
    getResults: comparePrivacy,
    explanation:
      "TypeScript's `private` is erased at runtime — bracket notation bypasses it. JS #private fields use WeakMap-based encapsulation that's truly inaccessible from outside.",
  },
  {
    id: "override",
    title: "override keyword",
    getResults: demonstrateOverride,
    explanation:
      "The `override` keyword (TS 4.3+) ensures a subclass method actually overrides a parent method. Without it, typos silently create new methods instead of overriding.",
  },
  {
    id: "param-props",
    title: "Constructor parameter properties",
    getResults: demonstrateParamProps,
    explanation:
      "Adding `readonly`, `private`, `protected`, or `public` to a constructor parameter automatically declares and assigns the property — less boilerplate, same result.",
  },
  {
    id: "init-order",
    title: "Field initialization order",
    getResults: demonstrateInitOrder,
    explanation:
      "Field initializers run top-to-bottom before the constructor body. A field can reference earlier fields via `this`, but accessing a later field gives `undefined`.",
  },
] as const;

type ActiveSection = (typeof demoSections)[number]["id"];

export default function PrivateFieldsSample() {
  const [activeId, setActiveId] = useState<ActiveSection>("privacy");

  const current = demoSections.find((s) => s.id === activeId) ?? demoSections[0];

  return (
    <div className="private-fields-sample">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>private vs #private fields</h3>
      </div>

      <p className="section-copy">
        TypeScript&apos;s <code>private</code> keyword is compile-time only —
        it&apos;s erased in the emitted JavaScript and provides no runtime
        protection. ES2022 <code>#private</code> fields are enforced at runtime
        and cannot be accessed outside the class, even via bracket notation or{" "}
        <code>any</code> cast.
      </p>

      <nav className="button-row">
        {demoSections.map((s) => (
          <button
            key={s.id}
            type="button"
            className={
              activeId === s.id ? "primary-button" : "secondary-button"
            }
            onClick={() => setActiveId(s.id)}
          >
            {s.title}
          </button>
        ))}
      </nav>

      {current && (
        <article className="sample-card">
          <h4>{current.title}</h4>
          <ul className="summary-list">
            {current.getResults().map((line, i) => (
              <li key={`${current.id}-${i}`}>
                <code>{line}</code>
              </li>
            ))}
          </ul>
          <p className="edge-case-note">{current.explanation}</p>
        </article>
      )}

      <details className="edge-case-note">
        <summary>Why this matters in production</summary>
        <ul className="summary-list">
          <li>
            <strong>Security</strong> — If you rely on <code>private</code> for
            access control, any <code>as any</code> cast or bracket access
            bypasses it. Use <code>#private</code> for sensitive data.
          </li>
          <li>
            <strong>API contracts</strong> — <code>override</code> catches
            breaking changes when a parent class renames or removes a method.
          </li>
          <li>
            <strong>Init order bugs</strong> — Referencing a field before its
            initializer runs gives <code>undefined</code>. Common in classes
            with interdependent fields or decorator-based frameworks.
          </li>
        </ul>
      </details>
    </div>
  );
}
