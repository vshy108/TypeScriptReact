// Conditional type distributivity
// --------------------------------
// This sample demonstrates three key conditional-type behaviors:
//
// 1. DISTRIBUTIVE CONDITIONAL TYPES — When a conditional type receives a naked
//    type parameter that is a union, TypeScript distributes the condition over
//    each union member independently. So `IsString<"a" | 42>` becomes
//    `IsString<"a"> | IsString<42>`, which resolves to `true | false`.
//
// 2. NON-DISTRIBUTIVE (WRAPPED) CONDITIONALS — Wrapping the type parameter
//    in a tuple `[T] extends [U]` prevents distribution: the union is checked
//    as a whole. `[string | number] extends [string]` → false.
//
// 3. PRACTICAL FILTERING — `Extract<T, U>` and `Exclude<T, U>` are built on
//    distributive conditionals. This sample shows how to build custom filters
//    that select union members by shape (e.g., objects with a `kind` field).

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any --
   type-proof bindings verify compile-time results without runtime side effects.
   any[] is required in MyReturnType because function param types are contravariant. */

import { useState } from "react";

// ---------------------------------------------------------------------------
// Type-level playground — all checks verified at compile time
// ---------------------------------------------------------------------------

// Section 1: Distributive behavior — naked type parameter distributes

type IsString<T> = T extends string ? "yes" : "no";

// The type parameter is "naked" here, which is why unions distribute. Wrapping T in another
// structure would change the meaning of the type entirely.

// "a" | 42 distributes: IsString<"a"> | IsString<42> → "yes" | "no"
type DistributiveResult = IsString<"a" | 42>;

// Verify the result is "yes" | "no" (both branches)
const _checkDistributive: DistributiveResult = "yes" as "yes" | "no";

// Section 2: Non-distributive — wrapped type parameter checks as a whole

type IsStringNonDist<T> = [T] extends [string] ? "yes" : "no";

// [string | number] extends [string] → false → "no"
type NonDistResult = IsStringNonDist<string | number>;

const _checkNonDist: NonDistResult = "no";

// Section 3: never is the empty union — distributes to never (no members)

type NeverCase = IsString<never>; // distributes 0 times → never

const _checkNever: NeverCase = undefined as never;

// But wrapped never checks normally: [never] extends [string] → true
type WrappedNever = IsStringNonDist<never>; // "yes" — never extends string

const _checkWrappedNever: WrappedNever = "yes";

// ---------------------------------------------------------------------------
// Practical filtering — Extract, Exclude, and custom filters
// ---------------------------------------------------------------------------

// Extract<T, U> keeps members assignable to U (distributive).
type StringOrNumber = string | number | boolean;
type OnlyStrings = Extract<StringOrNumber, string>; // string

const _checkExtract: OnlyStrings = "hello";

// Exclude<T, U> removes members assignable to U.
type NotStrings = Exclude<StringOrNumber, string>; // number | boolean

const _checkExclude: NotStrings = 42 as number | boolean;

// Custom filter: select union members that have a { kind: K } field.
type EventMap =
  | { kind: "click"; x: number; y: number }
  | { kind: "keypress"; key: string }
  | { kind: "scroll"; offset: number };

type FilterByKind<T, K> = T extends { kind: K } ? T : never;

// Returning never for non-matches is the key trick: distributive conditionals automatically erase
// those never branches from the final union, leaving only the members we want.

// Extracts only the "click" event type from the union.
type ClickEvent = FilterByKind<EventMap, "click">;

const _checkFilter: ClickEvent = { kind: "click", x: 0, y: 0 };

// Extract all kinds as a union of string literals.
type AllKinds = EventMap["kind"]; // "click" | "keypress" | "scroll"

const _checkKinds: AllKinds = "click" as AllKinds;

// ---------------------------------------------------------------------------
// infer in conditional types — extract parts of a type
// ---------------------------------------------------------------------------

// Extract the return type of a function (simplified ReturnType).
// Note: we use `any[]` for the rest parameter (not `unknown[]`) because
// function parameter types are checked contravariantly — a concrete param
// list like [number] doesn't extend `readonly unknown[]` in this position.
type MyReturnType<T> = T extends (...args: any[]) => infer R
  ? R
  : never;

type FnReturn = MyReturnType<(x: number) => string>; // string

const _checkReturn: FnReturn = "result";

// Extract element type from an array.
type ElementOf<T> = T extends readonly (infer E)[] ? E : never;

type ArrElem = ElementOf<readonly [1, 2, 3]>; // 1 | 2 | 3

const _checkElement: ArrElem = 1 as 1 | 2 | 3;

// Extract the resolved type from a Promise.
type Awaited2<T> = T extends Promise<infer R> ? Awaited2<R> : T;

// The recursive branch mirrors how deeply nested Promise types are peeled in practice; this sample
// uses a custom Awaited to show that many built-in utility types are just small conditional patterns.

type DeepPromise = Promise<Promise<string>>;
type Resolved = Awaited2<DeepPromise>; // string

const _checkResolved: Resolved = "done";

// ---------------------------------------------------------------------------
// Display components
// ---------------------------------------------------------------------------

interface Example {
  readonly id: string;
  readonly label: string;
  readonly typeExpr: string;
  readonly result: string;
  readonly explanation: string;
}

const distributiveExamples: readonly Example[] = [
  {
    id: "dist-1",
    label: "Distributive",
    typeExpr: 'IsString<"a" | 42>',
    result: '"yes" | "no"',
    explanation:
      'Distributes: IsString<"a"> | IsString<42> → "yes" | "no". Both branches appear because the union has string and non-string members.',
  },
  {
    id: "dist-2",
    label: "Non-distributive",
    typeExpr: "IsStringNonDist<string | number>",
    result: '"no"',
    explanation:
      "Wrapped in tuple: [string | number] extends [string] → false. The union is checked as a whole, not member by member.",
  },
  {
    id: "dist-3",
    label: "never (empty union)",
    typeExpr: "IsString<never>",
    result: "never",
    explanation:
      "never is the empty union. Distributing over 0 members produces never. No branch executes at all.",
  },
  {
    id: "dist-4",
    label: "Wrapped never",
    typeExpr: "IsStringNonDist<never>",
    result: '"yes"',
    explanation:
      "Wrapped: [never] extends [string] → true. Without distribution, never is checked directly as a type, and never extends everything.",
  },
] as const;

const filterExamples: readonly Example[] = [
  {
    id: "filter-1",
    label: "Extract",
    typeExpr: "Extract<string | number | boolean, string>",
    result: "string",
    explanation:
      "Built-in Extract keeps union members assignable to the constraint. Distributive: each member checked independently.",
  },
  {
    id: "filter-2",
    label: "Exclude",
    typeExpr: "Exclude<string | number | boolean, string>",
    result: "number | boolean",
    explanation:
      "Built-in Exclude removes union members assignable to the constraint. The complement of Extract.",
  },
  {
    id: "filter-3",
    label: "Custom filter (FilterByKind)",
    typeExpr: 'FilterByKind<EventMap, "click">',
    result: "{ kind: 'click'; x: number; y: number }",
    explanation:
      "Custom distributive filter: T extends { kind: K } ? T : never. Selects only the union member whose kind matches.",
  },
] as const;

const inferExamples: readonly Example[] = [
  {
    id: "infer-1",
    label: "Return type (infer R)",
    typeExpr: "MyReturnType<(x: number) => string>",
    result: "string",
    explanation:
      "infer R captures the return type from the function signature. This is how the built-in ReturnType<T> works.",
  },
  {
    id: "infer-2",
    label: "Element type (infer E)",
    typeExpr: "ElementOf<readonly [1, 2, 3]>",
    result: "1 | 2 | 3",
    explanation:
      "infer E captures the element type from an array/tuple. For a tuple, the result is a union of all element types.",
  },
  {
    id: "infer-3",
    label: "Recursive Awaited (infer R)",
    typeExpr: "Awaited2<Promise<Promise<string>>>",
    result: "string",
    explanation:
      "Recursive conditional type unwraps nested Promises until a non-Promise is reached. This matches the built-in Awaited<T>.",
  },
] as const;

function ExampleTable({
  title,
  examples,
}: {
  readonly title: string;
  readonly examples: readonly Example[];
}) {
  return (
    <article className="sample-card">
      <h4>{title}</h4>
      <table className="type-table">
        <thead>
          <tr>
            <th>Pattern</th>
            <th>Type expression</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {examples.map((ex) => (
            <tr key={ex.id}>
              <td>
                <strong>{ex.label}</strong>
              </td>
              <td>
                <code>{ex.typeExpr}</code>
              </td>
              <td>
                <code>{ex.result}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}

type SectionKey = "distributive" | "filter" | "infer";

const sections: readonly {
  readonly key: SectionKey;
  readonly title: string;
  readonly examples: readonly Example[];
}[] = [
  {
    key: "distributive",
    title: "Distributive vs non-distributive",
    examples: distributiveExamples,
  },
  {
    key: "filter",
    title: "Extract, Exclude, and custom filters",
    examples: filterExamples,
  },
  {
    key: "infer",
    title: "infer in conditional types",
    examples: inferExamples,
  },
];

export default function ConditionalDistributivitySample() {
  const [activeSection, setActiveSection] = useState<SectionKey>("distributive");

  const current = sections.find((s) => s.key === activeSection) ?? sections[0];

  return (
    <div className="conditional-distributivity-sample">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Conditional type distributivity</h3>
      </div>

      <p className="section-copy">
        When a conditional type <code>T extends U ? A : B</code> receives a
        union for <code>T</code>, TypeScript distributes the check over each
        member. Wrapping in a tuple <code>[T] extends [U]</code> prevents
        distribution. This behavior powers <code>Extract</code>,{" "}
        <code>Exclude</code>, and custom type-level filters.
      </p>

      <nav className="button-row">
        {sections.map((s) => (
          <button
            key={s.key}
            type="button"
            className={
              activeSection === s.key ? "primary-button" : "secondary-button"
            }
            onClick={() => setActiveSection(s.key)}
          >
            {s.title}
          </button>
        ))}
      </nav>

      {current && (
        <ExampleTable title={current.title} examples={current.examples} />
      )}

      <details className="edge-case-note">
        <summary>Why this matters in production</summary>
        <ul className="summary-list">
          <li>
            <strong>Union narrowing</strong> — Distributive conditionals let you
            filter unions at the type level, exactly like <code>.filter()</code>{" "}
            at runtime.
          </li>
          <li>
            <strong>never gotcha</strong> — Passing <code>never</code> to a
            distributive conditional always produces <code>never</code> (empty
            union, zero iterations). This surprises developers who expect a
            boolean result.
          </li>
          <li>
            <strong>Tuple wrapper trick</strong> —{" "}
            <code>[T] extends [string]</code> is the standard way to check a
            type without distributing. Essential when you want to test the whole
            union, not each member.
          </li>
        </ul>
      </details>
    </div>
  );
}
