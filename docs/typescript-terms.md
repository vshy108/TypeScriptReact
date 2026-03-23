# TypeScript Terms

This guide explains the TypeScript terms covered by this repository. It focuses on the features that shape the code in this workspace rather than trying to document the whole language.

## How To Use This Guide

- Start with the core language and config terms if you are reading the main app.
- Use the advanced and edge-case sections while working through the dedicated TypeScript samples.
- Treat this as a learning glossary tied to this repo's implementation choices.

## Core Language And Config Terms

### exactOptionalPropertyTypes

`exactOptionalPropertyTypes` makes optional properties behave more like runtime JavaScript: omitted and explicitly `undefined` are no longer treated as the same thing in every context.

### noUncheckedIndexedAccess

`noUncheckedIndexedAccess` makes indexed lookups include `undefined` unless TypeScript can prove the key exists. It forces safer handling of maps, arrays, and dictionary-like objects.

### template literal ids

Template literal ID types such as ``task-${string}`` constrain strings to a structured pattern. This repo uses them to make domain identifiers more precise than plain `string`.

### assertion functions

Assertion functions refine types by throwing when a condition is not met. They let runtime validation and type narrowing work together cleanly.

### as const

`as const` preserves literal values and readonly-ness instead of widening everything to broad primitives like `string` or `number`.

### satisfies

`satisfies` checks that a value conforms to a target type without discarding the value's narrower inferred literals. It is one of the most useful modern TypeScript operators in this repo.

### generic components

A generic component is a component or helper whose props or return values depend on type parameters. It lets reusable UI stay strongly typed without hard-coding one data shape.

## Type Transformation Terms

### Partial

`Partial<T>` makes every property in `T` optional.

### Pick

`Pick<T, K>` builds a type containing only the selected keys from another type.

### Record

`Record<K, V>` creates an object type whose keys come from `K` and whose values are all `V`.

### ReturnType

`ReturnType<typeof fn>` extracts the return type of a function so you do not have to duplicate it manually.

### keyof

`keyof T` produces the union of property names available on `T`.

### conditional types

Conditional types choose one result type or another based on whether a type relationship holds, usually using the `T extends U ? X : Y` form.

### mapped types

Mapped types transform one object type into another by iterating over keys and computing new property shapes.

### infer

`infer` introduces a type variable inside a conditional type so TypeScript can extract part of a larger type expression.

## Function And Object Modeling Terms

### tuples

Tuples describe fixed-length arrays where each position has a known type and usually a known meaning.

### function overloads

Function overloads let one function expose multiple call signatures while preserving accurate types for each call form.

### call signatures

A call signature describes the shape of something that can be invoked like a function.

### construct signatures

A construct signature describes the shape of something that can be invoked with `new`.

### this typing

`this` typing lets functions declare what `this` must be when the function is called.

### classes

Classes are TypeScript's object-oriented syntax for stateful instances, inheritance, and method-based design.

### access modifiers

Access modifiers such as `public`, `protected`, and `private` control how class members may be accessed.

### abstract classes

Abstract classes define shared behavior plus required members for subclasses without being directly instantiable.

### implements

`implements` checks that a class satisfies an interface contract.

### intersection types

Intersection types combine multiple types into one type that must satisfy all of them.

## Recursive And Structural Terms

### recursive types

Recursive types are types that refer to themselves, directly or indirectly, to model tree-like or nested structures.

### recursive interfaces

A recursive interface is an interface whose fields include the interface again as part of a nested structure.

### recursive type aliases

A recursive type alias uses `type` rather than `interface` to define a self-referential type shape.

### DeepReadonly

`DeepReadonly<T>` is a recursive utility pattern that makes nested properties readonly, not just top-level ones.

### DeepKeyPaths

`DeepKeyPaths<T>` is a pattern for computing nested property-path unions from an object type.

## Interop And Declaration Terms

### .d.ts authoring

Declaration authoring means writing `.d.ts` files that describe the public types of a JavaScript module or library.

### declaration merging

Declaration merging is TypeScript's ability to combine multiple declarations with the same name into one merged type surface.

### module augmentation

Module augmentation adds new type information to an existing external module declaration.

### triple-slash directives

Triple-slash directives are legacy reference comments used to include declaration files or configure certain compiler behaviors in special cases.

### JSDoc-powered typing

This is the practice of using JSDoc comments in JavaScript files so TypeScript can infer and check types without rewriting the code to `.ts`.

### allowJs

`allowJs` lets TypeScript include JavaScript files in the compilation graph.

### checkJs

`checkJs` tells TypeScript to type-check JavaScript files instead of merely allowing them to exist alongside TypeScript.

## Advanced Runtime And Project Terms

### enums

Enums are named sets of constants that compile to runtime JavaScript objects.

### symbols

Symbols are unique primitive values often used for opaque property keys or well-known protocol hooks.

### iterators

Iterators are objects that produce a sequence of values over time, typically via a `next()` method.

### mixins

Mixins are composition patterns that add reusable behavior to classes without requiring a deep inheritance tree.

### decorators

Decorators are annotations applied to classes or members that can transform or augment runtime behavior, depending on the configured proposal support.

### namespaces

Namespaces are an older TypeScript namespacing mechanism that predates ESM module conventions.

### resolveJsonModule

`resolveJsonModule` allows JSON files to be imported with inferred types.

### paths

`paths` configures module path aliases so imports can map to custom logical locations.

### baseUrl

`baseUrl` defines the root used when resolving non-relative module imports.

### composite

`composite` enables project references and stricter output assumptions needed for multi-project builds.

### declarationMap

`declarationMap` emits source maps for declaration files so editors can navigate from `.d.ts` output back to the original source.

### importHelpers

`importHelpers` reuses helper code from `tslib` instead of inlining helpers into every emitted file.

### noPropertyAccessFromIndexSignature

This flag forces indexed access syntax in cases where a property comes from an index signature rather than a known named property.

## Type-System Edge Cases

### distributive conditional types

A conditional type distributes over a union when the checked type parameter appears naked on the left side of `extends`.

### non-distributive [T] extends [U]

Wrapping types in single-element tuples prevents conditional distributivity and forces the check to happen against the union as a whole.

### never empty union

This term refers to the fact that `never` behaves like an empty union in many type-level operations, which can make conditional results look surprising.

### Extract

`Extract<T, U>` filters a union down to the members assignable to `U`.

### Exclude

`Exclude<T, U>` removes from `T` the union members assignable to `U`.

### as clause key remapping

The `as` clause inside mapped types can rename keys or drop them entirely by remapping them to `never`.

### never key removal

In mapped types, remapping a key to `never` removes that property from the resulting type.

### PickByType value filtering

This is a common mapped-type pattern that keeps only the properties whose value types match a target type.

### template literal key transform

This pattern builds new object keys by combining strings and key names with template literal types.

### keyof T & string

This trick narrows a key union to string keys only, which is useful when symbol keys should be excluded from string-based remapping.

### -readonly modifier

The `-readonly` mapped-type modifier removes readonly from properties in the transformed result.

### covariance out

Covariance means a type can vary in a more specific direction for outputs and still remain assignable in certain positions.

### contravariance in

Contravariance means function parameter positions often vary in the opposite direction of assignment intuition.

### invariance in out

Invariance means neither broader nor narrower types are assignable because the type position is both readable and writable.

### Array unsoundness

This refers to the classic pitfall where mutable arrays make apparently reasonable subtype relationships unsafe at runtime.

### strictFunctionTypes

`strictFunctionTypes` tightens function assignability rules, especially around parameter variance.

### variance annotations TS 4.7

Variance annotations such as `in`, `out`, and `in out` make a generic API's intended variance more explicit.

### private keyword (compile-time)

TypeScript's `private` keyword is enforced by the type checker but does not create JavaScript runtime privacy.

### #private fields (runtime)

JavaScript `#private` fields enforce privacy at runtime as part of the language itself.

### override keyword

`override` tells TypeScript that a subclass member intentionally overrides a base-class member and should be checked accordingly.

### constructor parameter properties

Parameter properties let a constructor parameter declare and initialize a class field in one place.

### field initialization order

This term refers to the subtle runtime order in which class fields and constructor logic execute, which can surprise people mixing inheritance and property initialization.

### template literal types

Template literal types build string types from other string types using template syntax.

### union cartesian product

When template literal types combine multiple unions, TypeScript produces the cross-product of all combinations.

### Uppercase Lowercase Capitalize

These are intrinsic string manipulation types that transform string literal types.

### infer in template literals

`infer` inside template literal patterns can extract structured pieces from strings, such as route parameter names.

### route parameter extraction

This is the practical pattern of reading parameter names out of string routes at the type level.

### performance limits

Some advanced type patterns generate very large unions or recursive expansions, which can slow the compiler or make types unreadable.

### partial inference currying

This is the workaround where currying or helper layering is used because TypeScript cannot partially infer some generic parameters while leaving others explicit.

### NoInfer<T>

`NoInfer<T>` is a pattern for preventing TypeScript from inferring a type parameter from a particular position so another source of truth wins.

### overload resolution order

TypeScript checks overloads in order, so overload arrangement can change what calls are accepted and how types are inferred.

### bidirectional contextual typing

This term refers to how TypeScript can use both the expression and the expected target type to infer a better result.

### generic defaults

Generic defaults allow type parameters to fall back to predefined types when callers do not supply them explicitly.

### satisfies operator

The `satisfies` operator verifies compatibility with a target type while keeping more precise inference from the original value.