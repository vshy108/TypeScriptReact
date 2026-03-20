// Mapped type filtering and remapping
// ------------------------------------
// Mapped types iterate over a set of keys and produce a new type. This sample
// shows three important edge cases:
//
// 1. KEY REMAPPING WITH `as` — TypeScript 4.1+ lets you filter or rename keys
//    in a mapped type using `as NewKey`. Mapping a key to `never` removes it.
//
// 2. VALUE-BASED FILTERING — Select only keys whose values match a constraint,
//    e.g., keep only `string`-valued properties from an object type.
//
// 3. TEMPLATE LITERAL KEY TRANSFORMATIONS — Use template literal types in the
//    `as` clause to rename keys (e.g., `name` → `getName`).

/* eslint-disable @typescript-eslint/no-unused-vars -- type-proof bindings verify
   compile-time results without runtime side effects. */

import { useState } from "react";

// ---------------------------------------------------------------------------
// Section 1: Basic key remapping with `as`
// ---------------------------------------------------------------------------

// A model type to demonstrate filtering and remapping.
interface UserProfile {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly age: number;
  readonly isAdmin: boolean;
}

// Keep only keys whose VALUE TYPE extends the constraint.
// The `as` clause returns `never` for keys that don't match, removing them.
type PickByType<T, ValueType> = {
  [K in keyof T as T[K] extends ValueType ? K : never]: T[K];
};

// Only string-valued properties of UserProfile.
type StringFields = PickByType<UserProfile, string>;
// → { readonly name: string; readonly email: string }

const _checkStringFields: StringFields = { name: "Alice", email: "a@b.com" };

// Only number-valued properties.
type NumberFields = PickByType<UserProfile, number>;
// → { readonly id: number; readonly age: number }

const _checkNumberFields: NumberFields = { id: 1, age: 30 };

// ---------------------------------------------------------------------------
// Section 2: Excluding keys — the complement of PickByType
// ---------------------------------------------------------------------------

type OmitByType<T, ValueType> = {
  [K in keyof T as T[K] extends ValueType ? never : K]: T[K];
};

// Remove all boolean-valued properties.
type NonBooleanFields = OmitByType<UserProfile, boolean>;
// → { readonly id: number; readonly name: string; readonly email: string; readonly age: number }

const _checkNonBoolean: NonBooleanFields = {
  id: 1,
  name: "Bob",
  email: "b@c.com",
  age: 25,
};

// ---------------------------------------------------------------------------
// Section 3: Template literal key transformations
// ---------------------------------------------------------------------------

// Prefix every key with "get" and capitalize the first letter.
type Getters<T> = {
  [K in keyof T & string as `get${Capitalize<K>}`]: () => T[K];
};

type UserGetters = Getters<UserProfile>;
// → { getName: () => string; getEmail: () => string; getId: () => number; ... }

const _checkGetters: UserGetters = {
  getId: () => 1,
  getName: () => "Alice",
  getEmail: () => "a@b.com",
  getAge: () => 30,
  getIsAdmin: () => true,
};

// Prefix "on" for event-like keys — only for string values.
type EventHandlers<T> = {
  [K in keyof T & string as T[K] extends string
    ? `on${Capitalize<K>}Change`
    : never]: (newValue: T[K]) => void;
};

type UserEvents = EventHandlers<UserProfile>;
// → { onNameChange: (newValue: string) => void; onEmailChange: (newValue: string) => void }

const _checkEvents: UserEvents = {
  onNameChange: () => {},
  onEmailChange: () => {},
};

// ---------------------------------------------------------------------------
// Section 4: Intersection with `string` to exclude symbol keys
// ---------------------------------------------------------------------------

// When iterating `keyof T`, symbols are included. Use `K in keyof T & string`
// to restrict to string keys only.
interface WithSymbol {
  readonly [Symbol.iterator]: () => Iterator<number>;
  readonly name: string;
  readonly count: number;
}

// Without `& string`, K includes `typeof Symbol.iterator`.
type AllKeys = keyof WithSymbol; // string | typeof Symbol.iterator

// With `& string`, only string keys remain.
type StringKeysOnly<T> = {
  [K in keyof T & string]: T[K];
};

type CleanObj = StringKeysOnly<WithSymbol>;
// → { readonly name: string; readonly count: number }

const _checkClean: CleanObj = { name: "test", count: 5 };

// ---------------------------------------------------------------------------
// Section 5: Readonly and mutable remapping
// ---------------------------------------------------------------------------

// Remove readonly from all properties (make mutable).
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

type MutableUser = Mutable<UserProfile>;

const _checkMutable: MutableUser = {
  id: 1,
  name: "Alice",
  email: "a@b.com",
  age: 30,
  isAdmin: false,
};
_checkMutable.name = "Bob"; // ✓ no error — now mutable

// Make all properties optional and nullable.
type DeepPartialNullable<T> = {
  [K in keyof T]?: T[K] | null;
};

type PatchUser = DeepPartialNullable<UserProfile>;
// → { id?: number | null; name?: string | null; ... }

const _checkPatch: PatchUser = { name: null, age: 25 };

// ---------------------------------------------------------------------------
// Display components
// ---------------------------------------------------------------------------

interface Example {
  readonly id: string;
  readonly label: string;
  readonly typeExpr: string;
  readonly resultKeys: string;
  readonly explanation: string;
}

const filterExamples: readonly Example[] = [
  {
    id: "pick-type",
    label: "PickByType<T, string>",
    typeExpr: "{ [K in keyof T as T[K] extends string ? K : never]: T[K] }",
    resultKeys: "name, email",
    explanation:
      "The `as` clause returns `never` for keys whose value doesn't extend string, removing them from the output type.",
  },
  {
    id: "omit-type",
    label: "OmitByType<T, boolean>",
    typeExpr: "{ [K in keyof T as T[K] extends boolean ? never : K]: T[K] }",
    resultKeys: "id, name, email, age",
    explanation:
      "The complement: keys whose values DO match the constraint map to `never`, removing them instead.",
  },
  {
    id: "string-keys",
    label: "K in keyof T & string",
    typeExpr: "{ [K in keyof T & string]: T[K] }",
    resultKeys: "name, count (no Symbol.iterator)",
    explanation:
      "Intersecting with `string` excludes symbol keys. Essential when iterating objects that implement [Symbol.iterator] or other well-known symbols.",
  },
] as const;

const remapExamples: readonly Example[] = [
  {
    id: "getters",
    label: "Getters<T>",
    typeExpr: "{ [K in keyof T & string as `get${Capitalize<K>}`]: () => T[K] }",
    resultKeys: "getName, getEmail, getId, getAge, getIsAdmin",
    explanation:
      "Template literal types in the `as` clause transform key names. Capitalize<K> uppercases the first letter of each key.",
  },
  {
    id: "events",
    label: "EventHandlers<T>",
    typeExpr:
      "{ [K as T[K] extends string ? `on${Capitalize<K>}Change` : never]: (v: T[K]) => void }",
    resultKeys: "onNameChange, onEmailChange",
    explanation:
      "Combines value-based filtering (only string values) with template literal renaming (on...Change prefix).",
  },
  {
    id: "mutable",
    label: "Mutable<T>",
    typeExpr: "{ -readonly [K in keyof T]: T[K] }",
    resultKeys: "All keys, now writable",
    explanation:
      "The `-readonly` modifier removes the readonly constraint from all properties. The `+` modifier adds it.",
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
            <th>Result keys</th>
          </tr>
        </thead>
        <tbody>
          {examples.map((ex) => (
            <tr key={ex.id}>
              <td>
                <strong>{ex.label}</strong>
                <br />
                <code>{ex.typeExpr}</code>
              </td>
              <td>
                <code>{ex.resultKeys}</code>
                <br />
                <small>{ex.explanation}</small>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}

type SectionKey = "filter" | "remap";

const sections: readonly {
  readonly key: SectionKey;
  readonly title: string;
  readonly examples: readonly Example[];
}[] = [
  { key: "filter", title: "Value-based filtering", examples: filterExamples },
  {
    key: "remap",
    title: "Key remapping and modifiers",
    examples: remapExamples,
  },
];

export default function MappedFilteringSample() {
  const [activeSection, setActiveSection] = useState<SectionKey>("filter");

  const current = sections.find((s) => s.key === activeSection) ?? sections[0];

  return (
    <div className="mapped-filtering-sample">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Mapped type filtering and remapping</h3>
      </div>

      <p className="section-copy">
        Mapped types iterate over keys with{" "}
        <code>[K in keyof T]</code>. The <code>as</code> clause (TS 4.1+) can
        rename keys with template literals or remove them by mapping to{" "}
        <code>never</code>. Combined with value-type checks, this enables
        powerful type-level filtering.
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
            <strong>API layer types</strong> — PickByType extracts only the
            serializable fields from a model, avoiding accidental inclusion of
            functions or symbols in API payloads.
          </li>
          <li>
            <strong>Event systems</strong> — Template literal remapping
            generates handler types like{" "}
            <code>onNameChange</code> automatically from a model's keys,
            keeping event contracts in sync with the data model.
          </li>
          <li>
            <strong>never key removal</strong> — Mapping a key to{" "}
            <code>never</code> in the <code>as</code> clause is the standard
            pattern for conditional key exclusion. It's how the built-in{" "}
            <code>Omit</code> type works internally.
          </li>
        </ul>
      </details>
    </div>
  );
}
