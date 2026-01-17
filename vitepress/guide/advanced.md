# Use Cases

## Redirect Chains

Reactive Route supports an unlimited number of redirects in both CSR and SSR environments.

<!-- @include: @/snippets/redirect-chain.md -->

In this example, if a user navigates to `/4`, they will be redirected sequentially:
`/4` → `/3` → `/2` → `/1`. These intermediate redirects are not recorded in the browser's history,
and the JS chunks for the intermediate pages will not be loaded.

## Reacting to Changes

Since [router.state](/guide/router-api#router-state) is **reactive**, you can easily monitor changes
using your reactivity system's primitives:

<!-- @include: @/snippets/advanced/reactions.md -->

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
Route handles Layouts — the other primary use case for nesting — with ease, as shown below.

## Layouts

There are three primary ways to manage dynamic layouts and components:

1. **Outside the Router Component**: As described in
   [router.getActiveState](/guide/router-api#router-getactivestate).

2. **Within the Page Component**: By reacting to dynamic parameters.

<!-- @include: @/snippets/advanced/dashboard.md -->

<!-- @include: @/snippets/advanced/dashboard-example.md -->

3. **Shared Loaders**: You can assign the same `loader` to multiple `Config` objects. In this
   scenario, `beforeComponentChange` is not triggered, and the page component **will not**
   re-render when navigating between these routes. However, the active `State` will still update,
   allowing you to reactively change layouts:

<!-- @include: @/snippets/advanced/dashboard-multi.md -->

<!-- @include: @/snippets/advanced/dashboard-multi-example.md -->

These approaches address slightly different needs but demonstrate the flexibility of Reactive
Route across various scenarios.