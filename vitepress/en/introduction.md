<script setup>
import { data } from '@/dynamic.data';
</script>

// #region introduction-overview

# Overview and purpose

<br>
<Badge type="warning">{{ data.version }}</Badge>
<Badge type="info">Size (core + integration): <span style="color:var(--docsearch-focus-color)">{{ data.sizeForLabel }}</span></Badge>
<Badge type="info">Coverage: <span style="color:var(--docsearch-focus-color)">{{ data.metrics.coverage }}</span> in <span style="color:var(--docsearch-focus-color)">{{ data.passedTests }}</span> tests</Badge>

When using MobX, Vue reactivity, Solid.js signals, and other reactive systems,
it is difficult to maintain synchronization with non-reactive routers, which are often tied to the UI
or file structure.

To solve this problem, **Reactive Route** was created. It works with any
reactive libraries and frameworks, which greatly simplifies working with different stacks. 

Ready-made integrations are available for:

- React + [MobX](https://mobx.js.org/)
- React + [Observable](https://observable.ru/)
- Preact (without compat) + MobX
- Preact (without compat) + Observable
- Solid.js + [Solid.js reactivity](https://docs.solidjs.com/concepts/intro-to-reactivity)
- Solid.js + MobX
- Solid.js + Observable
- Vue + [Vue reactivity](https://vuejs.org/guide/extras/reactivity-in-depth)

## Advantages

The library follows a strict philosophy — minimum size, maximum typing,
mandatory validation of URL parameters, fault tolerance, and support for SSR / Widget / MPA modes.

**Reactive Route** is a separate routing layer that encourages you not to scatter configuration
across files and components. It has no redirects by partial paths or nested routes,
which makes it possible to use TypeScript static analysis (and therefore automatic refactoring,
fast navigation and autocomplete + stable generation with AI models).

The component tree in the project remains clean, and there are no restrictions
on folder structure or file names.

Async `beforeEnter` and `beforeLeave` methods let you control access
and load data into stores, while `beforeComponentChange` lets you design modular architectures
with code-splitting support not only for page components, but also for other entities (and
"destroy" them when navigating to other pages), with seamless SSR support.

Carefully designed reactivity support lets you build applications with granular rerenders,
without running into inconsistencies in how reactions and UI framework mount / unmount
mechanisms are triggered when route state changes.

## Browser support

**Reactive Route** uses Dual Packaging (CJS and ESM are selected automatically based on the
project configuration) for maximum compatibility. To work without polyfills, you need at least
**Chrome 49**, **Firefox 29**, **Safari 10.1**, and **Node.js 10** if SSR is used,
due to the requirement for [URLSearchParams](https://caniuse.com/mdn-api_urlsearchparams).

You can go straight to <Link to="examples">Examples</Link> for your stack or to the next
documentation section to get familiar with how the library works.

// #endregion introduction-overview

// #region introduction-first-setup

# Installation and setup

<!-- @include: @shared/introduction/installPackage.md -->

**Reactive Route** is an npm package without any dependencies, with separate
module imports for seamless integration with an existing reactivity system
on any framework (React, Preact, Solid, Vue). There is no need to configure tree-shaking.

:::info Peer dependencies
If the framework's built-in reactivity is not used, the appropriate
reactive libraries must be installed (see <Link to="integration">Integrations</Link>).
:::

<Accordion title="Module map">

<<< @/modulesMap.ts

</Accordion>

## Creating configuration

In **Reactive Route** terminology, the description of a route and its behavior is called `Config`
and is passed to `createConfigs`:

<!-- @include: @shared/introduction/createRouterSingleton.md -->

`loader` expects the page component to be in the `default` export.

If necessary, you can declare `path` with variables like `/:id/:name`; in that case, each
variable requires a validator. Never trust data coming from the URL, especially if SSR is involved.

:::info Not recommended
to pass the component directly as `loader: () => Promise.resolve({ default: HomePage })`
to avoid cyclic imports
:::

<Accordion title="Passing configuration as an object is more type-safe">

<!-- @include: ./accordion/objectConfigBetter.md -->

</Accordion>

<Accordion title="Using async import expands capabilities">

<!-- @include: ./accordion/asyncLoaderBetter.md -->

</Accordion>

## Export

It is recommended to use the Context API to pass the router into components.

:::info But you can choose the approach yourself
Exporting via the Singleton pattern (as in the previous example) is simpler
and is suitable for CSR projects.

In SSR, however, several users can open different pages at the same time,
and a Singleton will render HTML markup from the latest current state rather than the one needed for a specific
user, so isolation via contexts or another form of DI is required.
:::

<!-- @include: @shared/introduction/createRouterContext.md -->

<Accordion title="`notFound` and `internalError` are required">

<!-- @include: ./accordion/errorPages.md -->

</Accordion>

## Launch

The router is ready to work; all that remains is to find the initial `Config`
that matches the browser URL and render the page component.

<!-- @include: @shared/introduction/renderApp.md -->

// #endregion introduction-first-setup

// #region introduction-how-works

# How it works

**Reactive Route** has strong typing, well-thought-out redirect logic, and fault tolerance
that are extremely hard to "break". For most scenarios, it is enough to define the configurations
and use `router.redirect`; TS will guide you through the rest.

When working with the router, there are only two main structures:

## Config

Contains all page logic

<!-- @include: @shared/introduction/extendedUserConfig.md -->

<Accordion title="Config typing tests">

<<< @/../units/tsCheck/createConfigs.test.ts

</Accordion>

## State

Contains the current values of a specific `Config`

<!-- @include: @shared/introduction/stateInComponents.md -->

:::info
The "non-null assertion" operator is safe if only one `Config` uses this page component.
:::

<Accordion title="State typing tests">

<<< @/../units/tsCheck/state.test.ts

</Accordion>

<Accordion title="Type Narrowing for State">

<<< @/../units/tsCheck/stateNarrowing.test.ts

</Accordion>

This is a normalized structure in which `params` and `query` objects are always present. However,
if they are not described in the corresponding configuration, their type will be `Record<never, string>`.
This is done to protect runtime behavior, because a developer might add `ts-ignore` somewhere and, without
default values, the code would crash with `Cannot read property of undefined`.

However, for the redirect mechanism it is more convenient to work with more strict types, and for this purpose
`StateDynamic` was created, which completely forbids passing `params` and `query` if they were not present
in the page configuration.

<Accordion title="StateDynamic typing tests">

<<< @/../units/tsCheck/redirect.test.ts

</Accordion>

## Decoding

The browser works with URLs in an [encoded format](https://developers.google.com/maps/url-encoding),
so **Reactive Route** has built-in encoding and decoding mechanisms.
Let us look at the initialization process of the first redirect (if all validators are replaced with
`() => true`):

<!-- @include: @shared/introduction/initEncoded.md -->

The router does not understand the string format, because it is absent from the structures described above.

For conversion, there is the <Link to="api#router-urltostate">router.urlToState</Link> method,
which cleans the URL of unnecessary parts, decodes values, runs validators, and returns a `State`
that the router understands, and the redirect is then called with it:

<!-- @include: @shared/introduction/initDecodedRedirect.md -->

:::tip Important
Validators receive **decoded** values for convenience when working with non-English URLs:

`id: (value) => console.log(value)` will print not `with%20space`, but `with space`

`phone: (value) => console.log(value)` will print not `and%26symbols`, but `and&symbols`
:::

## Redirect flow

- the redirect reason is investigated. In this case, `reason = 'new_config'`
- `beforeLeave` of the previous `Config` is executed (in this case there was none, so it is skipped)
- `beforeEnter` of the next `Config` is executed, including any redirect chain
- the js chunk is loaded (if code-splitting is enabled) with the component and other exports
- the normalized `State` is written to the corresponding `router.state[config.name]`, in this case `router.state.user`
- if synchronization with the History API is enabled (by default it is enabled for the browser environment),
  native `pushState / replaceState` are called

// #endregion introduction-how-works

// #region introduction-comparison

# Comparison

<SizeComparisonChart :data="data" />

:::info Configuration
`esbuild` is used with minification and with the participating libraries' `peerDependencies` excluded.
With tree shaking enabled in real projects, sizes may be smaller.

<!-- @include: @shared/introduction/comparisonBuildScript.md -->
:::

<Accordion title="Input files">

<<< @/../scripts/measureApps/reactive-route.ts
<<< @/../scripts/measureApps/mobx-router.ts
<<< @/../scripts/measureApps/vue-router.ts
<<< @/../scripts/measureApps/kitbag.ts
<<< @/../scripts/measureApps/tanstack.ts
<<< @/../scripts/measureApps/react-router.ts
<<< @/../scripts/measureApps/solid-router.ts

</Accordion>

## Features

<ComparisonTable
:headers="['', 'Reactive Route', 'Most other libraries']"
:rows="[
['**Typing**', 'Full (except beforeEnter / beforeLeave)', 'Partial (because due to dynamic declarations and nesting, TS does not know the actual route tree)'],
['**Reactivity**', 'Any with Proxy', 'Only for one library / absent'],
['**Framework**', 'Any', 'One, with rare exceptions - adapters for similar frameworks (React + Solid.js)'],
['**Lifecycle**', 'Async', 'Sync'],
['**Parameter validation**', 'Required', 'Optional / absent'],
['**SSR**', 'Simple setup', 'Complex setup'],
['**DX convenience**', 'Fast navigation, simple auto-refactoring, clean structure', 'The full structure exists only at runtime, manual redirect control by strings'],
['**File structure**', 'Any', 'Limited in a file-based approach'],
['**Code splitting**', 'Native (for page components and other exports)', 'Partial / via specific utilities'],
['**Ready-made components**', 'Router only', 'Present'],
['**Dev tools**', 'No (but active State is easy to log)', 'Present'],
['**Nested configs**', 'No', 'Yes'],
['**Wildcards**', 'No', 'Yes'],
['**Dynamic routes**', 'No', 'Yes'],
['**Optional path parts**', 'No', 'Yes'],
['**File-based**', 'No', 'Yes'],
['**Hash and URL state support**', 'No', 'Partial'],
['**Type conversion for params and query**', 'No', 'Partial'],
]"
/>

// #endregion introduction-comparison
