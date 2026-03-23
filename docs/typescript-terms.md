# TypeScript Terms

This guide explains the TypeScript terms covered by this repository. It focuses on the features that shape the code in this workspace rather than trying to document the whole language.

## How To Use This Guide

- Start with the core language and config terms if you are reading the main app.
- Use the advanced and edge-case sections while working through the dedicated TypeScript samples.
- Treat this as a learning glossary tied to this repo's implementation choices.

## Table Of Contents

- [Core Language And Config Terms](#core-language-and-config-terms)
- [Type Transformation Terms](#type-transformation-terms)
- [Function And Object Modeling Terms](#function-and-object-modeling-terms)
- [Recursive And Structural Terms](#recursive-and-structural-terms)
- [Interop And Declaration Terms](#interop-and-declaration-terms)
- [Advanced Runtime And Project Terms](#advanced-runtime-and-project-terms)
- [Type-System Edge Cases](#type-system-edge-cases)

## Core Language And Config Terms

### exactOptionalPropertyTypes

`exactOptionalPropertyTypes` makes optional properties behave more like runtime JavaScript: omitted and explicitly `undefined` are no longer treated as the same thing in every context.

Repo examples: [../tsconfig.app.json](../tsconfig.app.json), [../node-samples/ts-advanced-tsconfig/src/index.ts](../node-samples/ts-advanced-tsconfig/src/index.ts)

### noUncheckedIndexedAccess

`noUncheckedIndexedAccess` makes indexed lookups include `undefined` unless TypeScript can prove the key exists. It forces safer handling of maps, arrays, and dictionary-like objects.

Repo examples: [../tsconfig.app.json](../tsconfig.app.json), [../node-samples/ts-advanced-tsconfig/src/index.ts](../node-samples/ts-advanced-tsconfig/src/index.ts)

### template literal ids

Template literal ID types such as ``task-${string}`` constrain strings to a structured pattern. This repo uses them to make domain identifiers more precise than plain `string`.

Repo example: [../src/catalog.ts](../src/catalog.ts)

### assertion functions

Assertion functions refine types by throwing when a condition is not met. They let runtime validation and type narrowing work together cleanly.

Repo example: [../src/App.tsx](../src/App.tsx)

### as const

`as const` preserves literal values and readonly-ness instead of widening everything to broad primitives like `string` or `number`.

Repo example: [../src/catalog.ts](../src/catalog.ts)

### satisfies

`satisfies` checks that a value conforms to a target type without discarding the value's narrower inferred literals. It is one of the most useful modern TypeScript operators in this repo.

Repo examples: [../src/catalog.ts](../src/catalog.ts), [../src/samples/UtilityMappedSample.tsx](../src/samples/UtilityMappedSample.tsx), [../node-samples/ts-generic-inference/src/index.ts](../node-samples/ts-generic-inference/src/index.ts)

### generic components

A generic component is a component or helper whose props or return values depend on type parameters. It lets reusable UI stay strongly typed without hard-coding one data shape.

Repo example: [../src/components/FeatureGrid.tsx](../src/components/FeatureGrid.tsx)

## Type Transformation Terms

### Partial

`Partial<T>` makes every property in `T` optional.

Repo example: [../src/samples/UtilityMappedSample.tsx](../src/samples/UtilityMappedSample.tsx)

### Pick

`Pick<T, K>` builds a type containing only the selected keys from another type.

Repo example: [../src/samples/UtilityMappedSample.tsx](../src/samples/UtilityMappedSample.tsx)

### Record

`Record<K, V>` creates an object type whose keys come from `K` and whose values are all `V`.

Repo example: [../src/samples/UtilityMappedSample.tsx](../src/samples/UtilityMappedSample.tsx)

### ReturnType

`ReturnType<typeof fn>` extracts the return type of a function so you do not have to duplicate it manually.

Repo example: [../src/samples/UtilityMappedSample.tsx](../src/samples/UtilityMappedSample.tsx)

### keyof

`keyof T` produces the union of property names available on `T`.

Repo example: [../src/samples/UtilityMappedSample.tsx](../src/samples/UtilityMappedSample.tsx)

### conditional types

Conditional types choose one result type or another based on whether a type relationship holds, usually using the `T extends U ? X : Y` form.

Repo examples: [../src/samples/UtilityMappedSample.tsx](../src/samples/UtilityMappedSample.tsx), [../src/samples/ConditionalDistributivitySample.tsx](../src/samples/ConditionalDistributivitySample.tsx)

### mapped types

Mapped types transform one object type into another by iterating over keys and computing new property shapes.

Repo examples: [../src/samples/UtilityMappedSample.tsx](../src/samples/UtilityMappedSample.tsx), [../src/samples/MappedFilteringSample.tsx](../src/samples/MappedFilteringSample.tsx)

### infer

`infer` introduces a type variable inside a conditional type so TypeScript can extract part of a larger type expression.

Repo examples: [../src/samples/UtilityMappedSample.tsx](../src/samples/UtilityMappedSample.tsx), [../src/samples/ConditionalDistributivitySample.tsx](../src/samples/ConditionalDistributivitySample.tsx), [../node-samples/ts-template-literals/src/index.ts](../node-samples/ts-template-literals/src/index.ts)

## Function And Object Modeling Terms

### tuples

Tuples describe fixed-length arrays where each position has a known type and usually a known meaning.

Repo example: [../src/samples/FunctionsTuplesSample.tsx](../src/samples/FunctionsTuplesSample.tsx)

### function overloads

Function overloads let one function expose multiple call signatures while preserving accurate types for each call form.

Repo example: [../src/samples/FunctionsTuplesSample.tsx](../src/samples/FunctionsTuplesSample.tsx)

### call signatures

A call signature describes the shape of something that can be invoked like a function.

Repo example: [../src/samples/FunctionsTuplesSample.tsx](../src/samples/FunctionsTuplesSample.tsx)

### construct signatures

A construct signature describes the shape of something that can be invoked with `new`.

Repo example: [../src/samples/FunctionsTuplesSample.tsx](../src/samples/FunctionsTuplesSample.tsx)

### this typing

`this` typing lets functions declare what `this` must be when the function is called.

Repo example: [../src/samples/FunctionsTuplesSample.tsx](../src/samples/FunctionsTuplesSample.tsx)

### classes

Classes are TypeScript's object-oriented syntax for stateful instances, inheritance, and method-based design.

Repo examples: [../src/samples/ClassesModelsSample.tsx](../src/samples/ClassesModelsSample.tsx), [../src/samples/PrivateFieldsSample.tsx](../src/samples/PrivateFieldsSample.tsx)

### access modifiers

Access modifiers such as `public`, `protected`, and `private` control how class members may be accessed.

Repo examples: [../src/samples/ClassesModelsSample.tsx](../src/samples/ClassesModelsSample.tsx), [../src/samples/PrivateFieldsSample.tsx](../src/samples/PrivateFieldsSample.tsx)

### abstract classes

Abstract classes define shared behavior plus required members for subclasses without being directly instantiable.

Repo example: [../src/samples/ClassesModelsSample.tsx](../src/samples/ClassesModelsSample.tsx)

### implements

`implements` checks that a class satisfies an interface contract.

Repo example: [../src/samples/ClassesModelsSample.tsx](../src/samples/ClassesModelsSample.tsx)

### intersection types

Intersection types combine multiple types into one type that must satisfy all of them.

Repo example: [../src/samples/ClassesModelsSample.tsx](../src/samples/ClassesModelsSample.tsx)

## Recursive And Structural Terms

### recursive types

Recursive types are types that refer to themselves, directly or indirectly, to model tree-like or nested structures.

Repo example: [../src/samples/RecursiveTypesSample.tsx](../src/samples/RecursiveTypesSample.tsx)

### recursive interfaces

A recursive interface is an interface whose fields include the interface again as part of a nested structure.

Repo example: [../src/samples/RecursiveTypesSample.tsx](../src/samples/RecursiveTypesSample.tsx)

### recursive type aliases

A recursive type alias uses `type` rather than `interface` to define a self-referential type shape.

Repo example: [../src/samples/RecursiveTypesSample.tsx](../src/samples/RecursiveTypesSample.tsx)

### DeepReadonly

`DeepReadonly<T>` is a recursive utility pattern that makes nested properties readonly, not just top-level ones.

Repo example: [../src/samples/RecursiveTypesSample.tsx](../src/samples/RecursiveTypesSample.tsx)

### DeepKeyPaths

`DeepKeyPaths<T>` is a pattern for computing nested property-path unions from an object type.

Repo example: [../src/samples/RecursiveTypesSample.tsx](../src/samples/RecursiveTypesSample.tsx)

## Interop And Declaration Terms

### .d.ts authoring

Declaration authoring means writing `.d.ts` files that describe the public types of a JavaScript module or library.

Repo examples: [../node-samples/ts-declarations/vendor/legacy-release-kit.d.ts](../node-samples/ts-declarations/vendor/legacy-release-kit.d.ts), [../node-samples/ts-declarations/src/release-audit.d.ts](../node-samples/ts-declarations/src/release-audit.d.ts)

### declaration merging

Declaration merging is TypeScript's ability to combine multiple declarations with the same name into one merged type surface.

Repo example: [../node-samples/ts-declarations/src/augmentations.d.ts](../node-samples/ts-declarations/src/augmentations.d.ts)

### module augmentation

Module augmentation adds new type information to an existing external module declaration.

Repo example: [../node-samples/ts-declarations/src/augmentations.d.ts](../node-samples/ts-declarations/src/augmentations.d.ts)

### triple-slash directives

Triple-slash directives are legacy reference comments used to include declaration files or configure certain compiler behaviors in special cases.

Repo example: [../node-samples/ts-declarations/src/index.ts](../node-samples/ts-declarations/src/index.ts)

### JSDoc-powered typing

This is the practice of using JSDoc comments in JavaScript files so TypeScript can infer and check types without rewriting the code to `.ts`.

Repo examples: [../node-samples/ts-jsdoc-interop/src/release-notes.js](../node-samples/ts-jsdoc-interop/src/release-notes.js), [../node-samples/ts-jsdoc-interop/src/index.ts](../node-samples/ts-jsdoc-interop/src/index.ts)

### allowJs

`allowJs` lets TypeScript include JavaScript files in the compilation graph.

Repo example: [../node-samples/ts-jsdoc-interop/tsconfig.json](../node-samples/ts-jsdoc-interop/tsconfig.json)

### checkJs

`checkJs` tells TypeScript to type-check JavaScript files instead of merely allowing them to exist alongside TypeScript.

Repo example: [../node-samples/ts-jsdoc-interop/tsconfig.json](../node-samples/ts-jsdoc-interop/tsconfig.json)

## Advanced Runtime And Project Terms

### enums

Enums are named sets of constants that compile to runtime JavaScript objects.

Repo example: [../node-samples/ts-advanced-runtime/src/index.ts](../node-samples/ts-advanced-runtime/src/index.ts)

### symbols

Symbols are unique primitive values often used for opaque property keys or well-known protocol hooks.

Repo example: [../node-samples/ts-advanced-runtime/src/index.ts](../node-samples/ts-advanced-runtime/src/index.ts)

### iterators

Iterators are objects that produce a sequence of values over time, typically via a `next()` method.

Repo example: [../node-samples/ts-advanced-runtime/src/index.ts](../node-samples/ts-advanced-runtime/src/index.ts)

### mixins

Mixins are composition patterns that add reusable behavior to classes without requiring a deep inheritance tree.

Repo example: [../node-samples/ts-advanced-runtime/src/index.ts](../node-samples/ts-advanced-runtime/src/index.ts)

### decorators

Decorators are annotations applied to classes or members that can transform or augment runtime behavior, depending on the configured proposal support.

Repo example: [../node-samples/ts-advanced-runtime/src/index.ts](../node-samples/ts-advanced-runtime/src/index.ts)

### namespaces

Namespaces are an older TypeScript namespacing mechanism that predates ESM module conventions.

Repo example: [../node-samples/ts-advanced-runtime/src/index.ts](../node-samples/ts-advanced-runtime/src/index.ts)

### resolveJsonModule

`resolveJsonModule` allows JSON files to be imported with inferred types.

Repo example: [../node-samples/ts-advanced-tsconfig/tsconfig.json](../node-samples/ts-advanced-tsconfig/tsconfig.json)

### paths

`paths` configures module path aliases so imports can map to custom logical locations.

Repo example: [../node-samples/ts-advanced-tsconfig/tsconfig.json](../node-samples/ts-advanced-tsconfig/tsconfig.json)

### baseUrl

`baseUrl` defines the root used when resolving non-relative module imports.

Repo example: [../node-samples/ts-advanced-tsconfig/tsconfig.json](../node-samples/ts-advanced-tsconfig/tsconfig.json)

### composite

`composite` enables project references and stricter output assumptions needed for multi-project builds.

Repo example: [../node-samples/ts-advanced-tsconfig/tsconfig.json](../node-samples/ts-advanced-tsconfig/tsconfig.json)

### declarationMap

`declarationMap` emits source maps for declaration files so editors can navigate from `.d.ts` output back to the original source.

Repo example: [../node-samples/ts-advanced-tsconfig/tsconfig.json](../node-samples/ts-advanced-tsconfig/tsconfig.json)

### importHelpers

`importHelpers` reuses helper code from `tslib` instead of inlining helpers into every emitted file.

Repo example: [../node-samples/ts-advanced-tsconfig/tsconfig.json](../node-samples/ts-advanced-tsconfig/tsconfig.json)

### noPropertyAccessFromIndexSignature

This flag forces indexed access syntax in cases where a property comes from an index signature rather than a known named property.

Repo examples: [../node-samples/ts-advanced-tsconfig/tsconfig.json](../node-samples/ts-advanced-tsconfig/tsconfig.json), [../node-samples/ts-advanced-tsconfig/src/index.ts](../node-samples/ts-advanced-tsconfig/src/index.ts)

## Type-System Edge Cases

### distributive conditional types

A conditional type distributes over a union when the checked type parameter appears naked on the left side of `extends`.

Repo example: [../src/samples/ConditionalDistributivitySample.tsx](../src/samples/ConditionalDistributivitySample.tsx)

### non-distributive [T] extends [U]

Wrapping types in single-element tuples prevents conditional distributivity and forces the check to happen against the union as a whole.

Repo example: [../src/samples/ConditionalDistributivitySample.tsx](../src/samples/ConditionalDistributivitySample.tsx)

### never empty union

This term refers to the fact that `never` behaves like an empty union in many type-level operations, which can make conditional results look surprising.

Repo example: [../src/samples/ConditionalDistributivitySample.tsx](../src/samples/ConditionalDistributivitySample.tsx)

### Extract

`Extract<T, U>` filters a union down to the members assignable to `U`.

Repo example: [../src/samples/ConditionalDistributivitySample.tsx](../src/samples/ConditionalDistributivitySample.tsx)

### Exclude

`Exclude<T, U>` removes from `T` the union members assignable to `U`.

Repo example: [../src/samples/ConditionalDistributivitySample.tsx](../src/samples/ConditionalDistributivitySample.tsx)

### as clause key remapping

The `as` clause inside mapped types can rename keys or drop them entirely by remapping them to `never`.

Repo example: [../src/samples/MappedFilteringSample.tsx](../src/samples/MappedFilteringSample.tsx)

### never key removal

In mapped types, remapping a key to `never` removes that property from the resulting type.

Repo example: [../src/samples/MappedFilteringSample.tsx](../src/samples/MappedFilteringSample.tsx)

### PickByType value filtering

This is a common mapped-type pattern that keeps only the properties whose value types match a target type.

Repo example: [../src/samples/MappedFilteringSample.tsx](../src/samples/MappedFilteringSample.tsx)

### template literal key transform

This pattern builds new object keys by combining strings and key names with template literal types.

Repo example: [../src/samples/MappedFilteringSample.tsx](../src/samples/MappedFilteringSample.tsx)

### keyof T & string

This trick narrows a key union to string keys only, which is useful when symbol keys should be excluded from string-based remapping.

Repo example: [../src/samples/MappedFilteringSample.tsx](../src/samples/MappedFilteringSample.tsx)

### -readonly modifier

The `-readonly` mapped-type modifier removes readonly from properties in the transformed result.

Repo example: [../src/samples/MappedFilteringSample.tsx](../src/samples/MappedFilteringSample.tsx)

### covariance out

Covariance means a type can vary in a more specific direction for outputs and still remain assignable in certain positions.

Repo example: [../node-samples/ts-variance/src/index.ts](../node-samples/ts-variance/src/index.ts)

### contravariance in

Contravariance means function parameter positions often vary in the opposite direction of assignment intuition.

Repo example: [../node-samples/ts-variance/src/index.ts](../node-samples/ts-variance/src/index.ts)

### invariance in out

Invariance means neither broader nor narrower types are assignable because the type position is both readable and writable.

Repo example: [../node-samples/ts-variance/src/index.ts](../node-samples/ts-variance/src/index.ts)

### Array unsoundness

This refers to the classic pitfall where mutable arrays make apparently reasonable subtype relationships unsafe at runtime.

Repo example: [../node-samples/ts-variance/src/index.ts](../node-samples/ts-variance/src/index.ts)

### strictFunctionTypes

`strictFunctionTypes` tightens function assignability rules, especially around parameter variance.

Repo example: [../node-samples/ts-variance/src/index.ts](../node-samples/ts-variance/src/index.ts)

### variance annotations TS 4.7

Variance annotations such as `in`, `out`, and `in out` make a generic API's intended variance more explicit.

Repo example: [../node-samples/ts-variance/src/index.ts](../node-samples/ts-variance/src/index.ts)

### private keyword (compile-time)

TypeScript's `private` keyword is enforced by the type checker but does not create JavaScript runtime privacy.

Repo example: [../src/samples/PrivateFieldsSample.tsx](../src/samples/PrivateFieldsSample.tsx)

### #private fields (runtime)

JavaScript `#private` fields enforce privacy at runtime as part of the language itself.

Repo example: [../src/samples/PrivateFieldsSample.tsx](../src/samples/PrivateFieldsSample.tsx)

### override keyword

`override` tells TypeScript that a subclass member intentionally overrides a base-class member and should be checked accordingly.

Repo example: [../src/samples/PrivateFieldsSample.tsx](../src/samples/PrivateFieldsSample.tsx)

### constructor parameter properties

Parameter properties let a constructor parameter declare and initialize a class field in one place.

Repo example: [../src/samples/PrivateFieldsSample.tsx](../src/samples/PrivateFieldsSample.tsx)

### field initialization order

This term refers to the subtle runtime order in which class fields and constructor logic execute, which can surprise people mixing inheritance and property initialization.

Repo example: [../src/samples/PrivateFieldsSample.tsx](../src/samples/PrivateFieldsSample.tsx)

### template literal types

Template literal types build string types from other string types using template syntax.

Repo example: [../node-samples/ts-template-literals/src/index.ts](../node-samples/ts-template-literals/src/index.ts)

### union cartesian product

When template literal types combine multiple unions, TypeScript produces the cross-product of all combinations.

Repo example: [../node-samples/ts-template-literals/src/index.ts](../node-samples/ts-template-literals/src/index.ts)

### Uppercase Lowercase Capitalize

These are intrinsic string manipulation types that transform string literal types.

Repo example: [../node-samples/ts-template-literals/src/index.ts](../node-samples/ts-template-literals/src/index.ts)

### infer in template literals

`infer` inside template literal patterns can extract structured pieces from strings, such as route parameter names.

Repo example: [../node-samples/ts-template-literals/src/index.ts](../node-samples/ts-template-literals/src/index.ts)

### route parameter extraction

This is the practical pattern of reading parameter names out of string routes at the type level.

Repo example: [../node-samples/ts-template-literals/src/index.ts](../node-samples/ts-template-literals/src/index.ts)

### performance limits

Some advanced type patterns generate very large unions or recursive expansions, which can slow the compiler or make types unreadable.

Repo example: [../node-samples/ts-template-literals/src/index.ts](../node-samples/ts-template-literals/src/index.ts)

### partial inference currying

This is the workaround where currying or helper layering is used because TypeScript cannot partially infer some generic parameters while leaving others explicit.

Repo example: [../node-samples/ts-generic-inference/src/index.ts](../node-samples/ts-generic-inference/src/index.ts)

### NoInfer<T>

`NoInfer<T>` is a pattern for preventing TypeScript from inferring a type parameter from a particular position so another source of truth wins.

Repo example: [../node-samples/ts-generic-inference/src/index.ts](../node-samples/ts-generic-inference/src/index.ts)

### overload resolution order

TypeScript checks overloads in order, so overload arrangement can change what calls are accepted and how types are inferred.

Repo example: [../node-samples/ts-generic-inference/src/index.ts](../node-samples/ts-generic-inference/src/index.ts)

### bidirectional contextual typing

This term refers to how TypeScript can use both the expression and the expected target type to infer a better result.

Repo example: [../node-samples/ts-generic-inference/src/index.ts](../node-samples/ts-generic-inference/src/index.ts)

### generic defaults

Generic defaults allow type parameters to fall back to predefined types when callers do not supply them explicitly.

Repo example: [../node-samples/ts-generic-inference/src/index.ts](../node-samples/ts-generic-inference/src/index.ts)

### satisfies operator

The `satisfies` operator verifies compatibility with a target type while keeping more precise inference from the original value.

Repo examples: [../src/catalog.ts](../src/catalog.ts), [../node-samples/ts-generic-inference/src/index.ts](../node-samples/ts-generic-inference/src/index.ts)