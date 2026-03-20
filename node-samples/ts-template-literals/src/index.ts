// Template literal type expansion
// --------------------------------
// Template literal types (TS 4.1+) let you build string literal types from
// other string literal types using the same `${...}` syntax as JavaScript
// template literals. This sample demonstrates:
//
// 1. UNION CARTESIAN PRODUCT — When a template literal contains multiple union
//    positions, TypeScript computes the cartesian product of all combinations.
//
// 2. INTRINSIC STRING MANIPULATION — Built-in Uppercase, Lowercase,
//    Capitalize, and Uncapitalize transform string literal types.
//
// 3. PATTERN MATCHING WITH infer — Template literals combined with `infer`
//    can parse and extract parts of string literal types.
//
// 4. PERFORMANCE LIMITS — Large union cartesian products can explode and
//    cause slow compilation or "Expression produces a union type that is too
//    complex to represent" errors.

// ============================================================================
// 1. BASIC TEMPLATE LITERALS — building string types
// ============================================================================

// A template literal type constructs new string literal types.
type Greeting = `Hello, ${string}!`;

const greet1: Greeting = "Hello, world!";
const greet2: Greeting = "Hello, TypeScript!";

// With a literal union, the template distributes over each member.
type Color = "red" | "green" | "blue";
type Size = "sm" | "md" | "lg";

// Cartesian product: 3 colors × 3 sizes = 9 combinations.
type ColorSize = `${Color}-${Size}`;
// → "red-sm" | "red-md" | "red-lg" | "green-sm" | "green-md" | "green-lg" | "blue-sm" | "blue-md" | "blue-lg"

const cssClass: ColorSize = "blue-md";

// Triple cartesian product.
type Variant = "outlined" | "filled";
type FullToken = `${Variant}-${Color}-${Size}`;
// → 2 × 3 × 3 = 18 combinations

const token: FullToken = "filled-red-lg";

// ============================================================================
// 2. INTRINSIC STRING MANIPULATION TYPES
// ============================================================================

// These are built-in compiler primitives (not implemented in TypeScript itself).
type Upper = Uppercase<"hello">; // "HELLO"
type Lower = Lowercase<"HELLO">; // "hello"
type Cap = Capitalize<"hello">; // "Hello"
type Uncap = Uncapitalize<"Hello">; // "hello"

const upper: Upper = "HELLO";
const lower: Lower = "hello";
const cap: Cap = "Hello";
const uncap: Uncap = "hello";

// Combine with template literals for key transformations.
type EventHandlerName<T extends string> = `on${Capitalize<T>}`;

type ClickHandler = EventHandlerName<"click">; // "onClick"
type FocusHandler = EventHandlerName<"focus">; // "onFocus"

const handler1: ClickHandler = "onClick";
const handler2: FocusHandler = "onFocus";

// Getter/setter pattern.
type Getter<T extends string> = `get${Capitalize<T>}`;
type Setter<T extends string> = `set${Capitalize<T>}`;

type NameGetter = Getter<"name">; // "getName"
type NameSetter = Setter<"name">; // "setName"

export const getter: NameGetter = "getName";
export const setter: NameSetter = "setName";

// ============================================================================
// 3. PATTERN MATCHING WITH infer
// ============================================================================

// Extract parts of a string type using `infer` inside a template literal.

// Extract the event name from an "on..." handler name.
type ExtractEventName<T extends string> = T extends `on${infer E}`
  ? Uncapitalize<E>
  : never;

type FromOnClick = ExtractEventName<"onClick">; // "click"
type FromOnMouseDown = ExtractEventName<"onMouseDown">; // "mouseDown"
type FromInvalid = ExtractEventName<"handleClick">; // never

const event1: FromOnClick = "click";
const event2: FromOnMouseDown = "mouseDown";

// Parse a dot-separated path.
type FirstSegment<T extends string> = T extends `${infer First}.${string}`
  ? First
  : T;

type Seg1 = FirstSegment<"user.address.city">; // "user"
type Seg2 = FirstSegment<"name">; // "name" (no dot, returns whole string)

const seg1: Seg1 = "user";
const seg2: Seg2 = "name";

// Recursive path splitting — extract all segments as a tuple.
type SplitPath<T extends string> = T extends `${infer Head}.${infer Tail}`
  ? [Head, ...SplitPath<Tail>]
  : [T];

type PathParts = SplitPath<"user.address.city">; // ["user", "address", "city"]
type SinglePart = SplitPath<"name">; // ["name"]

const pathParts: PathParts = ["user", "address", "city"];
const singlePart: SinglePart = ["name"];

// ============================================================================
// 4. PRACTICAL PATTERN — type-safe route parameters
// ============================================================================

// Extract path parameters from a route string like "/users/:id/posts/:postId".
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<Rest>
    : T extends `${string}:${infer Param}`
      ? Param
      : never;

type UserPostParams = ExtractParams<"/users/:id/posts/:postId">;
// → "id" | "postId"

type NoParams = ExtractParams<"/about">;
// → never

// Build a params object from the route.
type RouteParams<T extends string> = {
  [K in ExtractParams<T>]: string;
};

type UserPostParamsObj = RouteParams<"/users/:id/posts/:postId">;
// → { id: string; postId: string }

const params: UserPostParamsObj = { id: "42", postId: "7" };
export { params };

type NoParamsObj = RouteParams<"/about">;
// → {} (empty — no params)

// ============================================================================
// 5. PERFORMANCE LIMITS — cartesian product explosion
// ============================================================================

// TypeScript has a hard limit on union size (approximately 100,000 members).
// Cartesian products grow multiplicatively:
//
//   type Alphabet = "a" | "b" | "c" | ... | "z";  // 26 members
//   type TwoLetters = `${Alphabet}${Alphabet}`;     // 26 × 26 = 676 members — OK
//   type ThreeLetters = `${Alphabet}${Alphabet}${Alphabet}`;  // 17,576 — still OK but slow
//   type FourLetters = `${Alphabet}${Alphabet}${Alphabet}${Alphabet}`;  // 456,976 — exceeds limit!
//
// MITIGATION STRATEGIES:
// 1. Keep unions small — prefer branded types or generic constraints over
//    exhaustive string unions when the set is large.
// 2. Use `string & {}` as a fallback — allows any string but still provides
//    autocomplete for known literals.
// 3. Split into smaller composed types instead of one mega-union.

// Demonstrating the "string & {}" autocomplete trick:
type KnownColor = "red" | "green" | "blue" | (string & {});
// The (string & {}) branch allows any string but IDEs still suggest
// "red", "green", "blue" in autocomplete.

const color1: KnownColor = "red"; // autocomplete suggests this
const color2: KnownColor = "purple"; // also valid — any string works

export { color1, color2 };

// ============================================================================
// 6. TEMPLATE LITERAL + MAPPED TYPE COMBINATION
// ============================================================================

// Create a type-safe event emitter from a map of event names to payloads.
interface EventMap {
  click: { x: number; y: number };
  focus: { target: string };
  resize: { width: number; height: number };
}

// Generate handler method names from the event map.
type EventHandlers<T extends object> = {
  [K in keyof T & string as `on${Capitalize<K>}`]: (payload: T[K]) => void;
};

type AppHandlers = EventHandlers<EventMap>;
// → {
//   onClick: (payload: { x: number; y: number }) => void;
//   onFocus: (payload: { target: string }) => void;
//   onResize: (payload: { width: number; height: number }) => void;
// }

const handlers: AppHandlers = {
  onClick: (p) => console.log(`Click at ${p.x},${p.y}`),
  onFocus: (p) => console.log(`Focus on ${p.target}`),
  onResize: (p) => console.log(`Resize to ${p.width}×${p.height}`),
};

handlers.onClick({ x: 10, y: 20 });
handlers.onFocus({ target: "input#name" });
handlers.onResize({ width: 1920, height: 1080 });

// ============================================================================
// Summary output
// ============================================================================

const summary = [
  "=== Template Literal Type Summary ===",
  "",
  `Cartesian product: ${String(3 * 3)} combinations from 3×3 unions`,
  `Intrinsic types: Uppercase<"hello"> = "${upper}"`,
  `Pattern matching: ExtractEventName<"onClick"> = "${event1}"`,
  `Path splitting: SplitPath<"user.address.city"> = ${JSON.stringify(pathParts)}`,
  `Route params: ExtractParams<"/users/:id/posts/:postId"> = id | postId`,
  `Performance: keep unions small, use string & {} for open-ended autocomplete`,
  "",
  "Key takeaway: template literals + infer + mapped types = type-safe",
  "string manipulation without runtime overhead.",
];

for (const line of summary) {
  console.log(line);
}

export {
  greet1,
  greet2,
  cssClass,
  token,
  upper,
  lower,
  cap,
  uncap,
  handler1,
  handler2,
  event1,
  event2,
  seg1,
  seg2,
  pathParts,
  singlePart,
  handlers,
};
export type {
  Greeting,
  NoParams,
  NoParamsObj,
  FromInvalid,
  UserPostParams,
  KnownColor,
  AppHandlers,
  ColorSize,
  FullToken,
  EventHandlerName,
  ExtractEventName,
  SplitPath,
  RouteParams,
  EventHandlers,
};
