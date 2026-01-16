# Core Concepts

There are only three structures in the library - `Config`, `Payload` and `State`:

## Config

Is a configuration object you pass to the `createRoutes` function for route names.
It usually looks like this:

<!-- @include: @/snippets/core-concepts/config-example.md -->

When you redirect to another route, the library executes `loader` and extends this configuration 
with some other fields like `name`, `component` and `otherExports`, so they can be used in lifecycle
methods and for internal caching.

## Payload

Is an object containing all the relevant information to detect a `Config`
and fill it with values. It usually looks like this:

```ts
<!-- @include: @/snippets/payload.md -->
```

It can be created from a string with [router.locationToPayload](/guide/router-api#router-locationtopayload), 
but usually you will pass it manually to the [router.redirect](/guide/router-api#router-redirect) 
function imperatively:

```tsx
button.onclick = () => router.redirect(<!-- @include: @/snippets/payload.md -->)
```

## State

Is an object containing additional information compared to `Payload`.

```ts
<!-- @include: @/snippets/state.md -->
```

It is kept in `router.state` in a **reactive** way and can be accessed from any UI component like this:

<!-- @include: @/snippets/core-concepts/state-in-components.md -->

Do not worry about the "non-null assertion" operator `!` - the relevant route's state will 
definitely exist if only one route uses this page component. Otherwise, choose the relevant one
like `routeState = router.state.userView || router.state.userEdit`, but there are
better alternatives to this.

This object can also be constructed manually from `Payload` with [router.payloadToState](/guide/router-api#router-payloadtostate).

That is useful for creating `Link` components where you can use `<a href={routeState.url} />` for
better UX and SEO or when JS is disabled in browser.

## Encoding

In Reactive Route the router handles the process of encoding and decoding in this way
(imagine we disabled numeric validation for `id`):

```ts
await router.hydrateFromURL(`/user/with%20space?phone=and%26symbols`);

// under the hood it calls router.locationToPayload to create a Payload
// with decoded values
// {
//   name: 'user', 
//   params: { id: 'with space' },
//   query: { phone: 'and&symbols' }
// }

// during redirect a router.payloadToState is called
// which encodes params back to URL
console.log(router.state.user)
// {
//   name: 'test',
//   params: { id: 'with space' },
//   query: { phone: 'and&symbols' },
//
//   pathname: '/user/with%20space',
//   search: 'phone=and%26symbols',
//   url: '/user/with%20space?phone=and%26symbols',
//
//   props: undefined,
//   isActive: true,
// }
```

So, the process is double-sided. `locationToPayload` validates and decodes, while `payloadToState`
validates and encodes to ensure safety, prevent malformed values and produce correct URLs.