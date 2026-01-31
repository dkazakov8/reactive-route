# Core Concepts

There are only three core structures in Reactive Route: `Config`, `Payload`, and `State`.

## Config

The `Config` object is passed to the `createRoutes` function under a specific key:

<!-- @include: @snippets/core-concepts/config-example.md -->

When the router initializes, it automatically enriches this object with a `name: 'user'` property
(matching the key). This design prevents typos and ensures route names remain synchronized across all
structures.

During navigation, the `loader` is executed, adding two more properties: `component` (the `default`
export) and `otherExports` (all other exports). These are accessible within the
[beforeComponentChange](/en/guide/router-api.html#beforecomponentchange).

## Payload

A `Payload` is a simple object containing the necessary information to identify a `Config` and
provide it with values:

```ts
<!-- @include: @snippets/payload.md -->
```

Typically, you'll write this manually (with full TS autocomplete) and pass it to
[router.redirect](/en/guide/router-api#router-redirect):

```tsx
button.onclick = () => router.redirect(<!-- @include: @snippets/payload.md -->)
```

## State

The `State` object provides a more detailed structure compared to a `Payload`:

```ts
<!-- @include: @snippets/state.md -->
```

You can manually derive a `State` from a `Payload` using
[router.payloadToState](/en/guide/router-api#router-payloadtostate). Additionally, the current `State`
is stored **reactively** in `router.state[name]` and is accessible anywhere the `router` is
available:

<!-- @include: @snippets/core-concepts/state-in-components.md -->

The non-null assertion operator is safe here as long as only one `Config` uses the `loader` for this
specific page component. If multiple routes share a component, you'll need to handle the logic
accordingly, e.g., `routeState = router.state.userView || router.state.userEdit`.

## Encoding and Decoding

Browsers handle URLs in an [encoded format](https://developers.google.com/maps/url-encoding).
Reactive Route handles the complexity of encoding and decoding for you.

```ts
await router.init(`/user/with%20space?phone=and%26symbols`);

// Internally, router.urlToPayload is called to create a decoded Payload:
<!-- @include: @snippets/core-concepts/payload-decoded.md -->

// Then router.payloadToState is called to generate an encoded State:
// router.state.user
<!-- @include: @snippets/core-concepts/state-decoded.md -->
```

Validators from your `Config` are executed during both encoding and decoding. This bidirectional
process ensures data integrity, prevents malformed values, and guarantees valid URLs.