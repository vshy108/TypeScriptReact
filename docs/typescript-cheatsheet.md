# TypeScript Cheatsheet

A quick-reference card for the TypeScript features and patterns demonstrated by this repository. For deeper explanations, see [typescript-terms.md](./typescript-terms.md).

---

## Core Types

```ts
// Primitives
let name: string = 'Alice';
let age: number = 30;
let active: boolean = true;
let id: bigint = 100n;
let sym: symbol = Symbol('key');

// Special
let anything: any;        // opts out of type safety
let unknown: unknown;      // must narrow before use
let nothing: never;        // function never returns / impossible branch
let noReturn: void;        // function returns nothing useful
let missing: undefined;    // value not provided
let empty: null;           // intentionally blank
```

## Object Shapes

```ts
// Interface — extendable object contract
interface User {
  readonly id: string;
  name: string;
  email?: string;               // optional — can be omitted
  status: string | undefined;   // required — but value may be undefined
}

// Type alias — unions, intersections, transformations
type LoadState = 'idle' | 'loading' | 'error' | 'done';
type UserWithRole = User & { role: string };
```

### type vs interface

| Feature | `type` | `interface` |
|---|---|---|
| Object shapes | Yes | Yes |
| Unions / intersections | Yes | No |
| Mapped / conditional types | Yes | No |
| Declaration merging | No | Yes |
| `extends` / `implements` | Via `&` | Native |

**Rule of thumb:** Use `interface` for object contracts, `type` for everything else.

## Utility Types

| Utility | Effect |
|---|---|
| `Partial<T>` | All properties optional |
| `Required<T>` | All properties required |
| `Readonly<T>` | All properties readonly |
| `Pick<T, K>` | Keep only keys `K` |
| `Omit<T, K>` | Remove keys `K` |
| `Record<K, V>` | Object with keys `K` and values `V` |
| `ReturnType<F>` | Return type of function `F` |
| `Parameters<F>` | Tuple of parameter types |
| `Awaited<T>` | Unwrap a `Promise<T>` |
| `Extract<T, U>` | Members of `T` assignable to `U` |
| `Exclude<T, U>` | Members of `T` not assignable to `U` |
| `NonNullable<T>` | Remove `null` and `undefined` |

## Narrowing & Guards

```ts
// typeof
if (typeof x === 'string') { /* x is string */ }

// truthiness
if (x) { /* x is truthy (excludes null, undefined, 0, '', false) */ }

// in operator
if ('name' in obj) { /* obj has name */ }

// instanceof
if (err instanceof Error) { /* err is Error */ }

// discriminated union
type Result = { ok: true; value: string } | { ok: false; error: Error };
function handle(r: Result) {
  if (r.ok) { r.value; } else { r.error; }
}

// custom type guard
function isString(x: unknown): x is string {
  return typeof x === 'string';
}

// assertion function (throws on failure, narrows after return)
function assertNonNull<T>(val: T): asserts val is NonNullable<T> {
  if (val == null) throw new Error('Unexpected null');
}
```

## typeof vs keyof

```ts
// typeof — extracts the type from a runtime value
const config = { port: 3000, host: 'localhost' };
type Config = typeof config;  // { port: number; host: string }

const fn = (x: number) => x > 0;
type Fn = typeof fn;          // (x: number) => boolean

// keyof — extracts the union of property keys from a type
interface User { id: string; name: string; age: number }
type UserKey = keyof User;    // 'id' | 'name' | 'age'

// Combined — the most common real-world pattern
const THEMES = { light: '#fff', dark: '#000' } as const;
type ThemeKey = keyof typeof THEMES;  // 'light' | 'dark'
```

| | `typeof` | `keyof` |
|---|---|---|
| Operand | A runtime value | A type |
| Returns | The type of that value | Union of property key names |
| Use when | You have a value and need its type | You have a type and need its keys |
| Combine as | `keyof typeof value` to get keys from a value | — |

**Gotcha:** `typeof` in a type position (TypeScript, compile-time, erased) is different from `typeof` in a value position (JavaScript, runtime, returns `"string"`, `"number"`, etc.).

## Generics

```ts
// Generic function
function identity<T>(value: T): T {
  return value;
}

// Generic with constraint
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

// Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
}

// Generic component (React)
function List<T extends { id: string }>(props: { items: T[]; render: (item: T) => React.ReactNode }) {
  return <>{props.items.map(item => <div key={item.id}>{props.render(item)}</div>)}</>;
}
```

## as const & satisfies

```ts
// as const — preserves literal types and readonly
const LANES = ['UI', 'API', 'Data'] as const;
// type: readonly ['UI', 'API', 'Data']

// satisfies — validates shape, keeps narrow inference
const config = {
  port: 3000,
  host: 'localhost',
} satisfies Record<string, string | number>;
// config.port is number (not string | number)

// as const satisfies — best of both
const FEATURES = {
  search: { label: 'Search', enabled: true },
  filter: { label: 'Filter', enabled: false },
} as const satisfies Record<string, { label: string; enabled: boolean }>;
// FEATURES.search.label is 'Search' (literal), shape is validated
```

### satisfies vs as

| | `satisfies` | `as` |
|---|---|---|
| Validates shape | Yes | No (silences mismatches) |
| Keeps narrow types | Yes | No (widens to target) |
| Use when | Defining object/array literals | Runtime knows more than the type system |

## Template Literal Types

```ts
type TaskId = `task-${string}`;               // constrained string pattern
type EventName = `on${Capitalize<string>}`;   // 'onClick', 'onHover', etc.

// Built-in string transformers
type U = Uppercase<'hello'>;    // 'HELLO'
type L = Lowercase<'HELLO'>;    // 'hello'
type C = Capitalize<'hello'>;   // 'Hello'
type X = Uncapitalize<'Hello'>; // 'hello'
```

## Mapped Types

```ts
// Basic mapped type
type Optional<T> = { [K in keyof T]?: T[K] };

// With key remapping (as clause)
type Getters<T> = { [K in keyof T as `get${Capitalize<K & string>}`]: () => T[K] };

// Remove keys that map to never
type PickByType<T, V> = { [K in keyof T as T[K] extends V ? K : never]: T[K] };

// Remove readonly
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
```

### Mapped Type Modifiers (`+` / `-`)

```ts
// -readonly — remove readonly
type Mutable<T> = { -readonly [K in keyof T]: T[K] };

// +readonly — add readonly (same as bare `readonly`)
type Locked<T> = { +readonly [K in keyof T]: T[K] };

// -? — remove optional (make required) — this is what Required<T> does
type Concrete<T> = { [K in keyof T]-?: T[K] };

// +? — add optional (same as bare `?`) — this is what Partial<T> does
type Relaxed<T> = { [K in keyof T]+?: T[K] };
```

`+` is the default and can be omitted. `-` is the interesting prefix — it *removes* a modifier.

## Type-Level Operators

| Operator | Position | Purpose |
|---|---|---|
| `typeof` | Type | Extract the type from a runtime value |
| `keyof` | Type | Union of property key names |
| `T[K]` | Type | Indexed access — look up property type |
| `T[number]` | Type | Extract array/tuple element type |
| `&` | Type | Intersection |
| `\|` | Type | Union |
| `is` | Return type | Type predicate (`x is string`) |
| `asserts` | Return type | Assertion function (`asserts x is T`) |
| `infer` | Conditional type | Extract/capture a type variable |
| `in` | Mapped type | Iterate over keys |
| `as` | Mapped type / expression | Key remapping / type assertion |
| `-readonly` / `-?` | Mapped type | Remove a modifier |
| `!` | Value expression | Non-null assertion (unsafe — use sparingly) |

### Indexed Access Types

```ts
type User = { name: string; age: number; address: { city: string } };

type Name = User['name'];              // string
type NameOrAge = User['name' | 'age']; // string | number
type City = User['address']['city'];   // string — chained access

// T[number] — extract element type from array/tuple
const ROLES = ['admin', 'user', 'guest'] as const;
type Role = (typeof ROLES)[number];    // 'admin' | 'user' | 'guest'
```

### Non-Null Assertion (`!`)

```ts
const el = document.getElementById('app')!;  // HTMLElement, not HTMLElement | null
```

**Danger:** lies to the compiler — crashes at runtime if actually `null`. Prefer narrowing (`if (el)`) or assertion functions when possible.

## Conditional Types

```ts
type IsString<T> = T extends string ? true : false;

// infer — extract a type from a pattern
type ElementOf<T> = T extends (infer E)[] ? E : never;
type ReturnOf<T> = T extends (...args: any[]) => infer R ? R : never;

// Distributive behavior (T is distributed when naked type param in extends)
type ToArray<T> = T extends unknown ? T[] : never;
// ToArray<string | number> → string[] | number[]

// Non-distributive (wrap in tuple)
type ToArrayND<T> = [T] extends [unknown] ? T[] : never;
// ToArrayND<string | number> → (string | number)[]
```

## Enums & Alternatives

```ts
// Union literal (preferred in this repo)
type Direction = 'north' | 'south' | 'east' | 'west';

// Const enum (inlined at compile time, no runtime object)
const enum Status { Active, Inactive }

// Regular enum (emits a runtime object)
enum Color { Red, Green, Blue }
```

## Function Overloads

```ts
function parse(input: string): number;          // declaration (compile-time only)
function parse(input: number): string;          // declaration (compile-time only)
function parse(input: string | number): string | number {  // implementation (runtime)
  return typeof input === 'string' ? Number(input) : String(input);
}
// Emitted JS has only the implementation — declaration signatures are erased
```

**Key:** Declaration signatures guide the type checker but are completely erased in emitted JS. At runtime only the single implementation function exists.

## Classes

```ts
class Animal {
  readonly species: string;         // readonly after construction
  private _name: string;            // compile-time private
  #age: number;                     // runtime private (ES2022)
  protected sound: string;          // accessible in subclasses

  constructor(species: string, name: string, age: number) {
    this.species = species;
    this._name = name;
    this.#age = age;
    this.sound = '';
  }
}

// Constructor parameter properties (shorthand)
class Point {
  constructor(public x: number, public y: number) {}
}

// Abstract class — cannot be instantiated directly (compile-time enforcement)
abstract class Shape {
  abstract area(): number;          // no body — subclass must implement
  describe() { return `Area: ${this.area()}`; }  // concrete — inherited by subclasses
}
// new Shape()  // ❌ compile error — cannot instantiate abstract class
// At runtime the emitted JS is a normal class — "abstract" is erased
```

## Tuples

```ts
type Pair = [string, number];
type Rest = [string, ...number[]];    // labeled rest
type Named = [first: string, second: number]; // labeled tuple

const [a, b]: Pair = ['hello', 42];
```

## Common Decision Table

| Situation | Use |
|---|---|
| Object contract that may be extended | `interface` |
| Union, intersection, mapped type | `type` |
| Validate literal shape | `satisfies` |
| Cast when type system is missing info | `as` (sparingly) |
| Freeze literals + validate | `as const satisfies` |
| Value must be narrowed | `unknown` |
| Opt out of safety (escape hatch) | `any` |
| Property can be omitted | `field?: Type` |
| Property required but maybe undefined | `field: Type \| undefined` |
| Immutable object contract | `readonly` modifier |
| Immutable value with literal types | `as const` |
| Boolean narrowing in control flow | Type guard (`x is T`) |
| Throw-on-invalid narrowing | Assertion function (`asserts x is T`) |
| Lightweight domain set | Union literal (`'a' \| 'b'`) |
| Runtime enum object needed | `enum` |
| Get type from a value | `typeof value` |
| Get keys from a type | `keyof Type` |
| Get keys from a value | `keyof typeof value` |
| Look up a property type | `T['key']` |
| Get array element type | `T[number]` |
| Remove readonly / optional in mapped type | `-readonly` / `-?` |

## Strict Compiler Options Worth Knowing

| Option | Effect |
|---|---|
| `strict` | Enables all strict checks |
| `exactOptionalPropertyTypes` | Omitted ≠ `undefined` for optional props |
| `noUncheckedIndexedAccess` | Index access includes `undefined` |
| `strictFunctionTypes` | Contravariant function params |
| `noPropertyAccessFromIndexSignature` | Forces bracket notation for index sigs |
| `noUncheckedSideEffectImports` | Ensures side-effect imports are checked |

## Variance Quick Reference

| Keyword | Meaning | Example |
|---|---|---|
| `out T` | Covariant — `T` only in output positions | `Producer<out T>` |
| `in T` | Contravariant — `T` only in input positions | `Consumer<in T>` |
| `in out T` | Invariant — `T` in both positions | `Collection<in out T>` |

## Useful Patterns

```ts
// Exhaustive check
function assertNever(x: never): never {
  throw new Error(`Unexpected: ${x}`);
}

// Branded / nominal types
type USD = number & { __brand: 'USD' };
type EUR = number & { __brand: 'EUR' };
const usd = 100 as USD;

// NoInfer<T> — prevent inference from a specific position
function createFSM<S extends string>(initial: NoInfer<S>, states: S[]) { ... }

// DeepReadonly (recursive type)
type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };

// Record from union
type Flags = Record<'dark' | 'compact' | 'rtl', boolean>;
```

## Recursive Types

```ts
// Tree-shaped data
interface TreeNode {
  label: string;
  children: TreeNode[];
}

// Recursive utility — deep key paths
type DeepKeyPaths<T> = T extends object
  ? { [K in keyof T & string]: K | `${K}.${DeepKeyPaths<T[K]>}` }[keyof T & string]
  : never;
```

**Gotcha:** Deeply recursive types can hit the compiler's depth limit. Keep recursion bounded or add a depth counter type parameter.

## Declaration Files & Module Augmentation

```ts
// vendor.d.ts — type an untyped JS module
declare module 'legacy-lib' {
  export function doStuff(input: string): number;
}

// Module augmentation — extend an existing module
declare module 'express' {
  interface Request {
    userId?: string;
  }
}

// Global augmentation
declare global {
  interface Window {
    analytics: { track(event: string): void };
  }
}
```

Triple-slash `/// <reference types="..." />` pulls in additional declarations before type checking.

## JSDoc Typing (allowJs + checkJs)

```js
// @ts-check

/** @type {string} */
let name = 'Alice';

/**
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function add(a, b) { return a + b; }

/** @typedef {{ id: string; name: string }} User */
/** @type {User} */
const user = { id: '1', name: 'Alice' };
```

- `allowJs` lets TypeScript compile `.js` files.
- `checkJs` turns on type checking for `.js` files.
- A TypeScript file can import a JSDoc-annotated JS module and get full type safety without a `.d.ts`.
