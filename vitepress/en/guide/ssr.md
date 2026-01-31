# Server-Side Rendering

For server-side rendering (SSR), you must initialize the router on the server and transmit its
`router.state` to the client. Note that string sanitization utilities like `escapeAllStrings` and
`unescapeAllStrings` are not provided by the library.

### Server

<!-- @include: @snippets/ssr/server.md -->

This example focuses on the router logic and doesn't include the injection of JS/CSS assets, which is
typically handled by your bundler. For a complete setup including bundler configuration, refer to
the [examples](/en/examples/react).

To handle redirect chains on the server, we use
`if (error instanceof RedirectError) return res.redirect(error.message)`. This error is thrown when
a `beforeEnter` returns a redirect — for instance, if an unauthenticated user attempts to access
a protected route.

::: tip
`JSON.parse(JSON.stringify(router.state))` is generally sufficient for serialization because
`router.state` is a flat, simple structure. However, if your `Config.props` contain complex or
non-serializable data (such as class instances, functions, or `Date` objects), you should remove
them before server-side serialization. They will be automatically restored on the client when
[router.hydrateFromState](/en/guide/router-api#router-hydratefromstate) is called.
:::

### Client

<!-- @include: @snippets/ssr/client.md -->

