# API

## Config

Contains all page logic

<Accordion title="Configurable properties">

<!-- @include: ./accordion/configConfigurable.md -->

</Accordion>

<Accordion title="System properties">

<!-- @include: ./accordion/configSystem.md -->

</Accordion>

### config.params

In **Reactive Route**, there is no explicit split between static and dynamic `Config`; path
segments prefixed with `:` are controlled by validators that allow a page to open with a value from the URL,
and this is reflected in the typings.

<!-- @include: @shared/api/withValidators.md -->

<Accordion title="Config typing tests">

<<< @/../units/tsCheck/createConfigs.test.ts

</Accordion>

:::tip Important
Validators receive **decoded** values for convenience when working with non-English URLs:

`id: (value) => console.log(value)` will print not `with%20space`, but `with space`
:::

This way, **Reactive Route** guarantees that all parameters in `router.state.userDetails.params`
have passed validation and can be used safely.

At runtime, `path` is always the source of truth, and stable matching is guaranteed even with
TS disabled. The declaration order of `Config` does not matter — the router algorithm has only
one rule: when the URL fully matches `path`, that config has the highest priority,
even if it is declared last. In all other scenarios, the first `Config` whose validators all pass wins.

### config.query

They are described in the same format as `params`, as validators:

<!-- @include: @shared/api/queryValidators.md -->

:::tip Important
Validators receive **decoded** values:

`userPrompt: (value) => console.log(value)` will print not `with%20space`, but `with space`
:::

All `query` parameters are optional, and their absence does not cause a redirect to `notFound`.

<!-- @include: @shared/api/queryFromState.md -->

If you need certain `query` parameters to be present, you can check them in `beforeEnter`
and redirect to `notFound` if they are missing from `nextState.query`.

### config.beforeEnter

This async function can be used to redirect to another `Config`, perform
auth checks, and load data. Unhandled errors will lead to
rendering `internalError` without changing the URL in the browser.

<Accordion title="Arguments">

<!-- @include: ./accordion/beforeEnterApi.md -->

</Accordion>

<!-- @include: @shared/api/beforeEnter.md -->

<Accordion title="beforeEnter / beforeLeave typing tests">

<<< @/../units/tsCheck/lifecycle.test.ts

</Accordion>

::: info Limitations
Only in lifecycle functions do `redirect`, `currentState`, and `nextState` have incomplete typings
(`name` is just `string`) due to TypeScript 5 limitations, so TS will not report errors during refactoring.
:::

:::tip
Always use `return` with `redirect` and `preventRedirect` for stable redirect logic.
:::

### config.beforeLeave

This async function can be used to interrupt a redirect. Unhandled errors will lead to
rendering `internalError` without changing the URL in the browser.

<Accordion title="Arguments">

<!-- @include: ./accordion/beforeLeaveApi.md -->

</Accordion>

<!-- @include: @shared/api/beforeLeave.md -->

<Accordion title="beforeEnter / beforeLeave typing tests">

<<< @/../units/tsCheck/lifecycle.test.ts

</Accordion>

::: info Limitations
Only in lifecycle functions do `redirect`, `currentState`, and `nextState` have incomplete typings
(`name` is just `string`) due to TypeScript 5 limitations, so TS will not report errors during refactoring.
:::

:::tip
Always use `return` with `redirect` and `preventRedirect` for stable redirect logic.
:::

## State

A reactive object stored in <Link to="api#router-state">router.state</Link>.

<Accordion title="Properties">

<!-- @include: ./accordion/stateApi.md -->

</Accordion>

<Accordion title="State typing tests">

<<< @/../units/tsCheck/state.test.ts

</Accordion>

<Accordion title="Type Narrowing for State">

<<< @/../units/tsCheck/stateNarrowing.test.ts

</Accordion>

## Router

### createRouter

This function creates `router`.

<Accordion title="Arguments">

<!-- @include: ./accordion/createRouterApi.md -->

</Accordion>

### beforeComponentChange

This function is called only when the rendered component changes and is intended for
use in modular architectures.

<!-- @include: @shared/api/before-change.md -->

<Accordion title="beforeComponentChange typing tests">

<<< @/../units/tsCheck/beforeComponentChange.test.ts

</Accordion>

This way, the `user` page can access its PageStore through `globalStore.pages.user`.
This makes it possible to use code-splitting more efficiently and serialize only `globalStore`
during SSR — it will already contain the data for the required page.

This function can also be used to interrupt async operations and subscriptions.

### router.redirect

Performs the full redirect cycle, described in more detail in the <Link to="introduction/how-works#redirect-flow">how it works</Link> section.
If you pass an additional `replace: true` property, the last browser history entry will be
replaced. Returns a string with the new URL.

The second argument is `skipLifecycle?: boolean` if you need to skip `beforeEnter` and `beforeLeave` calls.

```ts
const newUrl = await router.redirect(<!-- @include: @shared/state.md -->)
// '/user/9999?phone=123456'
```

<Accordion title="StateDynamic typing tests">

<<< @/../units/tsCheck/redirect.test.ts

</Accordion>

### router.urlToState

Accepts a URL and returns `State` with a fallback to `notFound`.

<!-- @include: @shared/api/urlToState.md -->

::: info
Only the described `query` values that pass validation are preserved; in this case, `gtm` does not end up in `State`.
:::

### router.init

Short form of `router.redirect(router.urlToState(url))`. The second argument is
`skipLifecycle?: boolean` if you need to skip `beforeEnter` and `beforeLeave` calls.

<!-- @include: @shared/api/init.md -->

### router.state

**Reactive** object whose keys are `name` and whose values are `State`, for example:

<!-- @include: @shared/api/routerState.md -->

Intended for displaying values in the UI and for describing logic in autoruns/effects. On redirect
with new `params` or `query`, these values will change accordingly in `router.state.user`.

The router **does not destroy** the old `State` when navigating to another `Config`. In this example, if you
navigate to `router.redirect({ name: 'home' })`, `router.state.user` will still be present.
This helps solve the problem of uncleared subscriptions to old state at runtime.

If **Reactive Route** stored only one active `router.getActiveState()`
(_this method does not exist!_), like many non-reactive routers do, then the subscription would start before
component unmount with an incorrect `State` in which these parameters might be missing.

<!-- @include: @shared/usage/reactions.md -->

### router.isRedirecting

**Reactive** `boolean` for displaying loading indicators during redirects. Examples of
global and local display are shown below:

<!-- @include: @shared/api/loaders.md -->

### router.activeName

**Reactive** `name` of the active `State` (`undefined` until the very first redirect).

### router.preloadComponent

**Reactive Route** loads page chunks (executes `loader`) only during redirects.
This function can be used for preloading and accepts `name`

<!-- @include: @shared/api/preload.md -->

### router.getGlobalArguments

Allows you to get the configuration passed to `createRouter`.
