# Limitations

## Nested Routes

Reactive Route does not, and will not, support nested `Config` objects. The library's core
philosophy is built on type safety and structural simplicity. Consider a configuration like this:

<!-- @include: @/snippets/advanced/nested.md -->

While it's technically possible to resolve naming and validator collisions by significantly
complicating the `Payload` structure, doing so in a way that remains type-safe is extremely
difficult. Furthermore, partial `States` and an ambiguous lifecycle would severely degrade the
DX.

Nested routes introduce numerous edge cases:

- Developers must constantly keep the component tree and its logical links in mind.
- Lifecycle behavior becomes unclear: Should a second-level `beforeEnter` be triggered by a
  third-level `params` or `query` change? Building a reliable data-fetching and authorization flow
  becomes much harder.
- Refactoring becomes a major chore — any change to the route hierarchy requires manual updates to
  component structures, data-fetching logic, and internal links, all without reliable help from
  TypeScript.
- Tooling suffers: limited support for "Find Usages", IDE navigation, autocomplete, and a lack of
  type safety for string-based redirects.

However, nested routes do excel at automatic breadcrumb generation. If your project relies heavily
on breadcrumbs, a router with native nesting support might be a better fit. That said, Reactive
Route handles Layouts — the other primary use case for nesting — with ease, as shown in
[Use Cases](/guide/advanced#layouts).

## Hash

Hash parameters are not supported and are automatically stripped during redirects. Reactive Route is built around modern browser History API standards and is not suitable for applications that require hash-based routing (e.g., older versions of Electron).

The library provides two powerful mechanisms for dynamic parameters: `query` and `params`. They are fully type-safe, integrated into route lifecycles, and validated. These mechanisms can effectively handle use cases where hashes were traditionally used, such as scrolling to an `#anchor` or managing UI state. Adding a third mechanism would only complicate the design and lead to a fragmented application state.
