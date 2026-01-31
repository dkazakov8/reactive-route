# Config

The general purpose is described in the [Core Concepts](/en/guide/core-concepts) section.

## Configurable Properties

<table>
  <thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead>
  <tbody><tr>
<td><code>path</code></td>
<td class="table-td">

```ts
string
```

</td>
<td>The route's path. It must start with <code>/</code> and can include dynamic segments prefixed
with <code>:</code></td>
</tr><tr>
<td><code>loader</code></td>
<td class="table-td">

```ts
() => Promise<{
  default: PageComponent,
  ...otherExports
}>
```

</td>
<td>A function that returns a Promise resolving to an object containing the page component in the
<strong>default</strong> export</td>
</tr><tr>
<td><code>props?</code></td>
<td class="table-td">

```ts
Record<string, any>
```

</td>
<td>Static props to be passed to the page component</td>
</tr><tr>
<td><code>params?</code></td>
<td class="table-td">

```ts
Record<
  TypeExtractParams<TPath>,
  (value: string) => boolean
>
```

</td>
<td>Validators for dynamic path segments</td>
</tr><tr>
<td><code>query?</code></td>
<td class="table-td">

```ts
Record<
  string,
  (value: string) => boolean
>
```

</td>
<td>Validators for query parameters</td>
</tr><tr>
<td><code>beforeEnter?</code></td>
<td class="table-td">

```ts
(data: TypeLifecycleConfig) => 
  Promise<void>
```

</td>
<td>A lifecycle function called before a navigation to this page</td>
</tr><tr>
<td><code>beforeLeave?</code></td>
<td class="table-td">

```ts
(data: TypeLifecycleConfig) => 
  Promise<void>
```

</td>
<td>A lifecycle function called before navigating away from this page</td>
  </tr></tbody>
</table>

## Auto Properties

These are automatically added by the library and should not be specified manually.

<table>
  <thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead>
  <tbody><tr>
<td><code>name</code></td>
<td class="table-td">

```ts
string
```

</td>
<td>Matches the key used in the routes object</td>
</tr><tr>
<td><code>component?</code></td>
<td class="table-td">

```ts
any
```

</td>
<td>The <code>default</code> export returned by the <code>loader</code></td>
</tr><tr>
<td><code>otherExports?</code></td>
<td class="table-td">

```ts
Record<string, any>
```

</td>
<td>All exports returned by the <code>loader</code> except for <code>default</code></td>
  </tr></tbody>
</table>

## Static vs. Dynamic Routes

There are two main `Config` variants — `Static` and `Dynamic` (which contain path segments prefixed
with a colon):

<!-- @include: @snippets/config/static-dynamic.md -->

Validators for dynamic path segments are **mandatory**. TypeScript automatically extracts these
keys from your path string to provide accurate autocomplete in the `params` object.

If a validator returns `false` (for example, if a numeric ID is expected but `/user/abc` is
visited) and no other matching route is found, the user will be redirected to the `notFound`
route.

Once a page component is rendered, you can be certain that all path parameters have been
validated and are available in `router.state[name].params`.

## Query Parameters

Both route variants can define expected query parameters:

<!-- @include: @snippets/config/query.md -->

If a query parameter validator returns `false`, that parameter will be `undefined` in
`router.state[name].query`. Consequently, all query parameters are treated as optional, and
their absence or invalidity will not trigger a redirect to `notFound`.

If your application logic requires certain query parameters to be mandatory, you can verify
them within `beforeEnter` and perform an imperative redirect to `notFound` or another
appropriate route.

## Lifecycle Functions

::: warning
Both lifecycle functions are triggered when navigating to a new `Config` or when dynamic
parameters change. They are **not** triggered by query parameter changes within the same route.

Currently, the router does not support automated data loading based solely on query changes. If
you need this functionality, you should load data by reacting to changes in
`router.state[name].query` within your component or store.
:::

The async `beforeEnter` is ideal for authentication checks, data prefetching, or
redirecting to a different route.

The async `beforeLeave` can be used to interrupt navigation (e.g., to confirm unsaved
changes).

Both functions receive an object with the following properties as their first argument:

<table>
  <thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead>
  <tbody><tr>
<td><code>nextState</code></td>
<td class="table-td">

```ts
TypeState
```

</td>
<td>The intended next <code>State</code></td>
</tr><tr>
<td><code>currentState?</code></td>
<td class="table-td">

```ts
TypeState
```

</td>
<td>The currently active <code>State</code> (<code>undefined</code> during the initial navigation)</td>
</tr><tr>
</tr><tr>
<td><code>preventRedirect</code></td>
<td class="table-td">

```ts
() => void
```

</td>
<td>A method to stop the current navigation</td>
</tr><tr>
<td><code>redirect</code></td>
<td class="table-td">

```ts
(payload: TypePayload) => 
  void
```

</td>
<td>A method to perform a redirect from within the lifecycle. Since <code>createRoutes</code> is
called before the router is initialized, you must use this instead of
<code>router.redirect</code></td>
  </tr></tbody>
</table>

Example usage:

<!-- @include: @snippets/config/lifecycle.md -->

Always use `return` with `redirect` and `preventRedirect` to ensure predictable navigation logic.

::: warning
The `redirect` method within lifecycle functions does not have full TypeScript coverage for
payloads. Use it with care, as TS will not catch errors if you rename routes during
refactoring.
:::

Uncaught errors in lifecycle functions will trigger the `internalError` route. It is essential to
handle potential errors using `try-catch` blocks or `Promise.catch()`.

## Types

### TypeConfigConfigurable 

The object structure expected by `createRoutes`.

<<< @/../packages/core/types.ts#type-config-configurable{typescript}

### TypeConfig

The internal enriched object used by the router.

<<< @/../packages/core/types.ts#type-config{typescript}
