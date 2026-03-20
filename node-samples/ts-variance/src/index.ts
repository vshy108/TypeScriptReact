// Variance and assignability
// --------------------------
// This sample demonstrates TypeScript's type variance rules — the conditions
// under which one type can be assigned to another when generics are involved.
//
// 1. COVARIANCE (output position) — If Cat extends Animal, then
//    Producer<Cat> is assignable to Producer<Animal>. Return types and
//    readonly properties are covariant.
//
// 2. CONTRAVARIANCE (input position) — If Cat extends Animal, then
//    Consumer<Animal> is assignable to Consumer<Cat>. Function parameters
//    are contravariant (under strict mode).
//
// 3. INVARIANCE (both positions) — Mutable properties are both input and
//    output. Array<Cat> is NOT assignable to Array<Animal> in a sound system,
//    but TypeScript's built-in Array is covariant for ergonomics (a known
//    unsoundness).
//
// 4. EXPLICIT VARIANCE ANNOTATIONS (TS 4.7+) — `in`, `out`, and `in out`
//    on type parameters document and enforce variance, enabling faster type
//    checking and catching unsound assignments.

// ============================================================================
// 1. COVARIANCE — output/producer position
// ============================================================================

// A simple class hierarchy.
class Animal {
  constructor(readonly name: string) {}
  move(): string {
    return `${this.name} moves`;
  }
}

class Cat extends Animal {
  purr(): string {
    return `${this.name} purrs`;
  }
}

class Dog extends Animal {
  bark(): string {
    return `${this.name} barks`;
  }
}

// A producer is covariant in T — it only outputs T, never consumes it.
// The `out` annotation makes the variance explicit (TS 4.7+).
interface Producer<out T> {
  produce(): T;
}

// Cat extends Animal, so Producer<Cat> is assignable to Producer<Animal>.
// The producer of a more specific type can substitute for a less specific one.
const catProducer: Producer<Cat> = {
  produce: () => new Cat("Whiskers"),
};
const animalProducer: Producer<Animal> = catProducer; // ✅ covariant

console.log(animalProducer.produce().move()); // "Whiskers moves"

// But not the other way: Producer<Animal> is NOT assignable to Producer<Cat>.
// const badCatProducer: Producer<Cat> = animalProducer; // ❌ compile error

// ============================================================================
// 2. CONTRAVARIANCE — input/consumer position
// ============================================================================

// A consumer is contravariant in T — it only takes T as input.
// The `in` annotation makes the variance explicit.
interface Consumer<in T> {
  consume(item: T): void;
}

// Animal extends-direction reverses: Consumer<Animal> is assignable to Consumer<Cat>.
// A consumer that handles any animal can substitute for one that handles cats.
const animalConsumer: Consumer<Animal> = {
  consume: (item) => console.log(`Feeding ${item.name}`),
};
const catConsumer: Consumer<Cat> = animalConsumer; // ✅ contravariant

catConsumer.consume(new Cat("Luna")); // "Feeding Luna"

// But not the other way: Consumer<Cat> is NOT assignable to Consumer<Animal>.
// A cat-only consumer might call .purr(), which dogs don't have.
// const badAnimalConsumer: Consumer<Animal> = catConsumer; // ❌ compile error

// ============================================================================
// 3. INVARIANCE — both positions (mutable property)
// ============================================================================

// When T appears in both input and output positions, the type is invariant:
// neither super- nor sub-type substitution is sound.
interface MutableBox<in out T> {
  get(): T; // output (covariant)
  set(value: T): void; // input (contravariant)
}

function fillWithAnimal(box: MutableBox<Animal>): void {
  box.set(new Dog("Rex")); // writes an Animal (Dog)
}

// If MutableBox<Cat> were assignable to MutableBox<Animal>, we could do:
//   const catBox: MutableBox<Cat> = { ... };
//   fillWithAnimal(catBox);  // writes a Dog into a Cat box!
//   catBox.get().purr();     // runtime error — Dog has no purr()
//
// TypeScript correctly prevents this: MutableBox<Cat> is NOT assignable
// to MutableBox<Animal> because the type is invariant.

// ============================================================================
// 4. THE ARRAY UNSOUNDNESS — TypeScript's pragmatic tradeoff
// ============================================================================

// TypeScript's built-in Array<T> is COVARIANT, even though arrays are mutable.
// This is a deliberate unsoundness for ergonomics — strict invariance would
// make common patterns like `function printAll(items: Animal[])` unusable
// with Cat[] arguments.

const cats: Cat[] = [new Cat("Whiskers"), new Cat("Luna")];

// This assignment is allowed (covariant) but technically unsound:
const animals: Animal[] = cats; // ✅ allowed — but unsound!

// We can now push a Dog into what's really a Cat[]:
animals.push(new Dog("Rex")); // no compile error!

// cats[2] is now a Dog at runtime — but TypeScript thinks it's a Cat:
// cats[2]?.purr() would crash at runtime with "purr is not a function"

console.log(
  `Array unsoundness: cats now has ${cats.length} items, last is ${cats[cats.length - 1]?.name}`,
);

// READONLY ARRAYS are sound because they're truly covariant — no mutation:
const readonlyCats: readonly Cat[] = [new Cat("Mittens")];
const readonlyAnimals: readonly Animal[] = readonlyCats; // ✅ sound
console.log(readonlyAnimals[0]?.move());

// ============================================================================
// 5. FUNCTION PARAMETER BIVARIANCE (non-strict mode)
// ============================================================================

// In non-strict mode (`strictFunctionTypes: false`), function parameters are
// BIVARIANT — both covariant and contravariant. This is unsound but was the
// default before TypeScript 2.6 for compatibility with DOM event handlers.
//
// In strict mode (`strictFunctionTypes: true`, which we use), function
// parameters are properly CONTRAVARIANT.

type AnimalHandler = (animal: Animal) => void;
type CatHandler = (cat: Cat) => void;

// Contravariant: AnimalHandler is assignable to CatHandler.
const handleAnimal: AnimalHandler = (a) => console.log(a.move());
const handleCat: CatHandler = handleAnimal; // ✅ contravariant

// Not the other way in strict mode:
// const badHandler: AnimalHandler = ((c: Cat) => c.purr()); // ❌ in strict mode

handleCat(new Cat("Cleo"));

// ============================================================================
// 6. EXPLICIT VARIANCE ANNOTATIONS (TS 4.7+)
// ============================================================================

// The `in` and `out` keywords on type parameters serve two purposes:
// 1. DOCUMENTATION — makes the intended variance clear to readers
// 2. ENFORCEMENT — TypeScript errors if the type parameter is used in a
//    position that contradicts the declared variance
// 3. PERFORMANCE — the compiler can skip structural comparison and check
//    variance directly, which is faster for complex generic types

// `out T` — covariant (T only in output positions)
interface ReadonlyStore<out T> {
  getAll(): readonly T[];
  getById(id: string): T | undefined;
}

// `in T` — contravariant (T only in input positions)
interface Sink<in T> {
  write(item: T): void;
  writeAll(items: readonly T[]): void;
}

// `in out T` — invariant (T in both positions)
interface Registry<in out T> {
  register(item: T): void;
  lookup(id: string): T | undefined;
}

// The compiler enforces the annotation. Uncommenting would error:
// interface BadProducer<out T> {
//   consume(item: T): void;  // ❌ T in input position contradicts `out`
// }

// ============================================================================
// 7. PRACTICAL EXAMPLE — event system with variance
// ============================================================================

interface Event {
  readonly type: string;
  readonly timestamp: number;
}

interface MouseEvent2 extends Event {
  readonly type: "mouse";
  readonly x: number;
  readonly y: number;
}

interface KeyEvent extends Event {
  readonly type: "key";
  readonly key: string;
}

// An event handler is contravariant in its event type.
type EventHandler<in E extends Event> = (event: E) => void;
type KeyHandler = EventHandler<KeyEvent>;

// A general handler works for any event, including mouse and key events.
const generalHandler: EventHandler<Event> = (e) =>
  console.log(`Event at ${e.timestamp}`);

// Contravariant: EventHandler<Event> is assignable to EventHandler<MouseEvent2>.
const mouseHandler: EventHandler<MouseEvent2> = generalHandler; // ✅

mouseHandler({ type: "mouse", x: 10, y: 20, timestamp: Date.now() });

// ============================================================================
// Summary output
// ============================================================================

const summary = [
  "=== Variance and Assignability Summary ===",
  "",
  "Covariance (out):      Producer<Cat> → Producer<Animal>       ✅",
  "Contravariance (in):   Consumer<Animal> → Consumer<Cat>       ✅",
  "Invariance (in out):   MutableBox<Cat> ↛ MutableBox<Animal>   ✅",
  "Array unsoundness:     Cat[] → Animal[] allowed (pragmatic)   ⚠️",
  "Function params:       AnimalHandler → CatHandler (strict)    ✅",
  "Variance annotations:  in, out, in out (TS 4.7+)             ✅",
  "",
  "Key takeaway: use readonly types and explicit variance annotations",
  "to keep your type system sound and your intent clear.",
];

for (const line of summary) {
  console.log(line);
}

export { Animal, Cat, Dog };
export { fillWithAnimal };
export type { Producer, Consumer, MutableBox, ReadonlyStore, Sink, Registry };
export type { KeyHandler };
