# Use Cases

## Link

Reactive Route does not provide a built-in `Link` component for every framework, as it would significantly limit customization. You can create your own component using the approach that best suits your project while maintaining full type safety, just like [router.redirect](/guide/router-api#router-redirect).

To simplify component creation, you can export a helper type for the redirect arguments in your `router.ts` file.

<!-- @include: @/snippets/advanced/link.md -->

::: warning
These examples are not an official implementation. You will likely need to refine
memoization, handle errors, and adapt them to your specific reactivity system.
:::

In the examples above, two components were created: `Link` and `LinkPayload`. The first one accepts props as a flat structure, while the second one uses a `payload` object. Both are fully type-safe and easily extendable.

<!-- @include: @/snippets/advanced/link-usage.md -->

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