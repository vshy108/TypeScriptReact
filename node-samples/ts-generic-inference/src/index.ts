// Generic inference failures and workarounds
// --------------------------------------------
// TypeScript's generic type inference is powerful but has known limitations.
// This sample demonstrates the most common inference failure patterns and
// the standard workarounds:
//
// 1. PARTIAL INFERENCE IS IMPOSSIBLE — You cannot specify one type parameter
//    and let TypeScript infer the rest. It's all or nothing.
//
// 2. INFERENCE SITE CONFLICTS — When TypeScript sees the same type parameter
//    in multiple positions, conflicting constraints can cause widening to a
//    union or inference failure.
//
// 3. OVERLOAD + GENERIC RESOLUTION ORDER — Overloaded functions with generics
//    are resolved in declaration order. The first matching overload wins,
//    which may not be the most specific one.
//
// 4. BIDIRECTIONAL CONTEXTUAL TYPING — Type inference flows from usage context
//    (e.g., expected return type) back into the generic. This works in some
//    positions but fails in others.
//
// 5. GENERIC DEFAULT VS INFERENCE — Defaults (T = X) apply when T cannot
//    be inferred, but inference always takes priority over defaults.

// ============================================================================
// 1. PARTIAL INFERENCE IS IMPOSSIBLE
// ============================================================================

// A function with two type parameters where you want to specify one and
// infer the other.
function createPair<K extends string, V>(
  key: K,
  value: V,
): { key: K; value: V } {
  return { key, value };
}

// Full inference works — both K and V are inferred.
const pair1 = createPair("name", 42);
// → { key: "name"; value: number }

// But you CANNOT specify only K and infer V:
// const pair2 = createPair<"age">("age", 30);
// ❌ Error: Expected 2 type arguments, but got 1.

// WORKAROUND 1: Curried function — split type parameters across two calls.
function createPairCurried<K extends string>(key: K) {
  return <V>(value: V) => ({ key, value });
}

const pair2 = createPairCurried("age")(30);
// K is explicitly "age" (from the argument), V is inferred as number.

console.log("Curried pair:", pair2);

// WORKAROUND 2: Use a "dummy" parameter to guide inference.
function createPairGuided<K extends string, V>(
  key: K,
  value: V,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _keyHint?: K, // unused but guides K inference
): { key: K; value: V } {
  return { key, value };
}

const pair3 = createPairGuided("status", true);
console.log("Guided pair:", pair3);

// ============================================================================
// 2. INFERENCE SITE CONFLICTS
// ============================================================================

// When T appears in multiple argument positions, TypeScript tries to find
// a common type. If the arguments have different types, it widens.

function mergeArrays<T>(a: readonly T[], b: readonly T[]): T[] {
  return [...a, ...b];
}

// Same types — inference works perfectly.
const nums = mergeArrays([1, 2], [3, 4]); // T = number ✅

// Different types — TS infers T = number from the first argument, then the
// second argument ["a", "b"] fails to match readonly number[]. You must
// provide the type explicitly to allow the union.
const mixed = mergeArrays<string | number>([1, 2], ["a", "b"]); // T = string | number
// Without the explicit parameter, this would be a compile error.

console.log("Nums:", nums, "Mixed:", mixed);

// WORKAROUND: Use `NoInfer<T>` (TS 5.4+) to prevent inference from one site.
function mergeArraysStrict<T>(a: readonly T[], b: readonly NoInfer<T>[]): T[] {
  return [...a, ...b];
}

// Now the first argument fixes T, and the second must match.
const strictNums = mergeArraysStrict([1, 2], [3, 4]); // T = number ✅
// mergeArraysStrict([1, 2], ["a", "b"]); // ❌ compile error — string not assignable to number

console.log("Strict nums:", strictNums);

// ============================================================================
// 3. OVERLOAD + GENERIC RESOLUTION ORDER
// ============================================================================

// Overloads are resolved in declaration order — the first match wins.
// Put the most specific overloads FIRST.

function parse(input: string): string;
function parse(input: number): number;
function parse(input: string | number): string | number {
  return typeof input === "string" ? input.trim() : input * 2;
}

const parseStr = parse("hello "); // string (first overload)
const parseNum = parse(42); // number (second overload)

console.log("Parsed:", parseStr, parseNum);

// With generics, the resolution can be surprising:
function transform<T extends string>(input: T): Uppercase<T>;
function transform<T extends number>(input: T): T;
function transform(input: string | number): string | number {
  return typeof input === "string"
    ? (input.toUpperCase() as string)
    : input * 2;
}

const upper = transform("hello"); // Uppercase<"hello"> → "HELLO"
const doubled = transform(5); // 5

console.log("Transform:", upper, doubled);

// ============================================================================
// 4. BIDIRECTIONAL CONTEXTUAL TYPING
// ============================================================================

// TypeScript can infer generic types from the expected return type (context).
// But this only works in specific positions.

interface Config<T> {
  value: T;
  validate: (v: T) => boolean;
}

function defineConfig<T>(config: Config<T>): Config<T> {
  return config;
}

// Contextual typing: T is inferred from `value`, then flows into `validate`.
const cfg = defineConfig({
  value: 42,
  validate: (v) => v > 0, // v is inferred as number ✅
});

console.log("Config valid:", cfg.validate(cfg.value));

// But contextual typing FAILS when the inference sites are in different
// call expressions:
function makeValidator<T>(): (v: T) => boolean {
  return () => true;
}

// T cannot be inferred — no argument provides a concrete type.
// const validator = makeValidator();  // T = unknown ← inference failure
// WORKAROUND: provide the type explicitly.
const validator = makeValidator<number>();

console.log("Validator:", validator(42));

// ============================================================================
// 5. GENERIC DEFAULTS VS INFERENCE
// ============================================================================

// Generic defaults (T = X) provide a fallback when inference fails.
// But inference ALWAYS takes priority over defaults.

interface Container<T = string> {
  value: T;
}

// No inference site — default applies.
const defaultContainer: Container = { value: "hello" }; // T = string

// Inference from explicit type — overrides default.
const numberContainer: Container<number> = { value: 42 }; // T = number

function createContainer<T = string>(value: T): Container<T> {
  return { value };
}

// Inference from argument — overrides default.
const inferred = createContainer(42); // T = number (not string)
const defaulted = createContainer("hello"); // T = string (matches default, but inferred)

console.log(
  "Containers:",
  defaultContainer.value,
  numberContainer.value,
  inferred.value,
  defaulted.value,
);

// ============================================================================
// 6. THE `satisfies` OPERATOR AND INFERENCE PRESERVATION
// ============================================================================

// `satisfies` (TS 4.9+) validates a value against a type without widening
// the inferred type. This is a workaround for inference loss with explicit
// type annotations.

interface RouteConfig {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
}

// With explicit type annotation — narrows to RouteConfig (loses literal types).
const routeAnnotated: RouteConfig = { path: "/users", method: "GET" };
// routeAnnotated.method is "GET" | "POST" | "PUT" | "DELETE" — widened

// With satisfies — validates shape but preserves literal type.
const routeSatisfies = { path: "/users", method: "GET" } satisfies RouteConfig;
// routeSatisfies.method is "GET" — literal type preserved!

console.log("Route methods:", routeAnnotated.method, routeSatisfies.method);

// ============================================================================
// Summary output
// ============================================================================

const summary = [
  "=== Generic Inference Failures Summary ===",
  "",
  "1. Partial inference: impossible → use curried functions",
  "2. Inference conflicts: widens to union → use NoInfer<T> (TS 5.4+)",
  "3. Overload order: first match wins → put specific overloads first",
  "4. Contextual typing: works within same expression, fails across calls",
  "5. Defaults vs inference: inference always wins over defaults",
  "6. satisfies: validates without widening — preserves literal types",
  "",
  "Key takeaway: when inference fails, reach for currying, NoInfer<T>,",
  "explicit type parameters, or satisfies — not `as` assertions.",
];

for (const line of summary) {
  console.log(line);
}

export {
  pair1,
  pair2,
  pair3,
  nums,
  mixed,
  strictNums,
  parseStr,
  parseNum,
  upper,
  doubled,
  cfg,
  validator,
  defaultContainer,
  numberContainer,
  inferred,
  defaulted,
  routeAnnotated,
  routeSatisfies,
};
export { createPair, createPairCurried, createPairGuided };
export { mergeArrays, mergeArraysStrict };
export { parse, transform };
export { defineConfig, makeValidator, createContainer };
export type { Config, Container, RouteConfig };
