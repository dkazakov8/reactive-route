# Router API

## createRouter

The `createRouter` function initializes the `router` instance. It accepts an object with the
following properties:

<table>
  <thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead>
  <tbody><tr>
<td><code>routes</code></td>
<td class="table-td">

```ts
ReturnType<typeof createRoutes>
```

</td>
<td>A routes object created via <code>createRoutes</code></td>
</tr><tr>
<td><code>adapters</code></td>
<td class="table-td">

[TypeAdapters](#typeadapters)

</td>
<td>Adapters for your chosen reactivity system</td>
</tr><tr>
<td><code>beforeComponentChange?</code></td>
<td class="table-td">

```ts
(params: {
  prevState?: TypeState;
  prevConfig?: TypeConfig;
  
  currentState: TypeState;
  currentConfig: TypeConfig;
}) => void
```

</td>
<td>A global lifecycle function triggered only when the active page component changes (rather than on
every route change)</td>
  </tr></tbody>
</table>

For the following examples, we'll assume this configuration:

<!-- @include: @snippets/router-api/sample-routes.md -->

## router.redirect

Identifies the `Config` matching the provided `Payload` and returns the resulting `State.url`. If
called in a browser environment, it also updates `window.history`.

You can pass `replace: true` in the `Payload` to disable "Go back" in the browser.

```ts
const clearedUrl = await router.redirect(<!-- @include: @snippets/payload.md -->)
// router.state.user is created and its URL is returned
// '/user/9999?phone=123456'
```

This method is fully type-safe, providing autocomplete and validation for route names, parameters,
and query strings.

```ts
// Valid redirects
redirect({ name: 'home' })
redirect({ name: 'user', params: { id: '123' }})
redirect({ name: 'user', params: { id: '123'}, query: { phone: '321' }})

// TypeScript errors:

// Missing "name"
redirect({});
// Non-existent route name
redirect({ name: 'nonExisting' });
// "home" is a static route; "params" are not allowed
redirect({ name: 'home', params: {} });
// "user" is a dynamic route; "params" are required
redirect({ name: 'user' });
// Required "params.id" is missing
redirect({ name: 'user', params: {} });
// Unrecognized parameter "foo"
redirect({ name: 'user', params: { id: '123', foo: 'bar' } });
// Unrecognized query parameter "foo"
redirect({ name: 'user', params: { id: '123'}, query: { foo: 'bar' } });
```

## router.urlToPayload

Converts a URL (pathname + search) into a `Payload`. If no matching `Config` is found, it returns
the `Payload` for the `notFound` route.

::: info
All unrecognized or non-compliant query parameters are stripped. Additionally, `protocol`,
`host`, `port`, and `hash` are cleared if provided.
:::

```ts
router.urlToPayload(`/user/9999?phone=123456&gtm=value`);
  
<!--@include: @snippets/payload-commented.md -->

router.urlToPayload(`/not-existing/admin?hacker=sql-inject`);

// { 
//  name: 'notFound', 
//  params: {}, 
//  query: {}
// }
```

## router.payloadToState

Converts a `Payload` into a `State` object. Like `router.redirect`, this method is fully type-safe.

```ts
router.payloadToState(<!-- @include: @snippets/payload.md -->);

<!--@include: @snippets/state-commented.md -->
```

## router.init

A shorthand for `router.redirect(router.urlToPayload(url))`. It accepts a URL string and returns the
finalized `State.url`.

::: info
All unrecognized or non-compliant query parameters are stripped. Additionally, `protocol`,
`host`, `port`, and `hash` are cleared if provided.
:::

```ts
const clearedUrl = await router.init(
  `/user/9999?phone=123456&gtm=value`
)
// router.state.user is created and its URL is returned
// '/user/9999?phone=123456'

// Typical Client-Side (CSR) usage:
await router.init(`${location.pathname}${location.search}`)

// Typical Server-Side (SSR) usage (e.g., with Express.js):
const clearedURL = await router.init(req.originalUrl)

// Optional: Redirect the browser to the 
// "cleaned" URL to remove irrelevant query params
if (req.originalUrl !== clearedURL) res.redirect(clearedURL)
```

## router.state

A **reactive** object where keys correspond to `Config.name` and values are the associated `State`.

```ts
console.log(router.state.user);

<!-- @include: @snippets/state-commented.md -->
```

Use this to bind routing data to your UI or to drive logic in effects and reactions. When navigating
to the same route with different parameters or query, the values within `router.state.user` update
reactively without re-rendering the entire page component.

::: tip
The router **does not** discard the previous `State` when navigating to a new route. For example, if
you navigate to `home`, `router.state.user` remains available but its `isActive` property will be
`false`. This ensures stability for any pending async operations or reactions tied to the previous
state.
:::

## router.isRedirecting

A reactive boolean indicating whether a navigation is currently in progress. Useful for displaying
global or local loading indicators:

<!-- @include: @snippets/router-api/loaders.md -->

## router.getActiveState

Returns the currently active `State`, if one exists. This is useful for switching top-level layouts:

<!-- @include: @snippets/router-api/active-state.md -->

It's also helpful for debugging route changes:

```ts
autorun(() => console.log(JSON.stringify(router.getActiveState())))
```

## router.preloadComponent

By default, the router only loads page components during navigation. `preloadComponent` allows you
to manually trigger the `loader` (e.g., when the browser is idle) to fetch JS chunks in advance.

<!-- @include: @snippets/router-api/preload.md -->

## router.getGlobalArguments

Returns the read-only configuration passed to `createRouter`. This is primarily used internally for
synchronization and has limited practical use for most applications.

## beforeComponentChange

This function is triggered only when the active page component changes (as opposed to every route
change). It's particularly useful in modular architectures where pages might export their own
lifecycle-managed stores.

<!-- @include: @snippets/router-api/before-change.md -->

By providing the `globalStore` to your components via Context, you can achieve efficient
code-splitting for both your UI and your business logic (with full SSR support). This function can also
be used to cancel pending API calls or subscriptions.

::: tip
In most cases, you should delay the destruction of the previous store until any related async logic
has finished to avoid potential "missing property" errors.
:::

## Types

### TypeRouter

<<< @/../packages/core/types.ts#type-router{typescript}

### TypeAdapters

Reactive Route is designed to be extensible. You can integrate custom reactivity systems by
providing your own adapters.

<<< @/../packages/core/types.ts#type-adapters{typescript}