<script setup>
import { data } from '@/dynamic.data';
</script>

// #region usage-link

# Link component

**Reactive Route** does not provide a ready-made `Link` component for every framework, because that would
significantly limit customization. You can create your own component while preserving full typings, for example
with usage like this:

<!-- @include: @shared/usage/link-usage.md -->

To make the component easier to write, you can define inferred types for the passed arguments in `router.ts`.

<!-- @include: @shared/usage/link.md -->

::: info
These examples are not an official implementation, but correct behavior has been verified across all current
combinations of reactivity system and UI framework.
:::

// #endregion usage-link

// #region usage-dynamic-components

# Dynamic components

The most suitable demonstration is an example with a Layout component that changes
the app layout and overall design depending on the current page.

When using reactive approaches, there are three main ways to work with dynamic components:

1. Outside the Router component, using `router.activeName`

<!-- @include: @shared/usage/active-state.md -->

2. Inside the page component, reacting to dynamic parameters

<!-- @include: @shared/usage/dashboard.md -->

<!-- @include: @shared/usage/dashboard-example.md -->

3. By assigning the same `loader` to several `Config`. In this case, `beforeComponentChange`
will not be called, but `router.activeName` will still change. This example could have looked like
the previous ones, but let us choose an approach with a reactive function:

<!-- @include: @shared/usage/dashboard-multi.md -->

<!-- @include: @shared/usage/dashboard-multi-example.md -->

These approaches can be combined depending on the task.

// #endregion usage-dynamic-components

// #region usage-redirects-chain

# Redirect chains

**Reactive Route** supports an unlimited number of redirects in CSR and SSR.

In this example, if the user navigates to `/4`, they will be redirected `/4` → `/3` → `/2` → `/1`.
Intermediate redirects are not reflected in browser history, and chunks for them will not be loaded.

<!-- @include: @shared/usage/redirect-chain.md -->

// #endregion usage-redirects-chain

// #region usage-ssr

# Server-side rendering

In server-side rendering, **Reactive Route** acts as a matcher that executes
the lifecycle, redirect chains, and validation of incoming data. For this, it is enough
to call `router.init` and handle redirects.

To build a more complete picture, let us use a full server with Express.js.

## Server

<!-- @include: @shared/usage/server.md -->

In this example, links to js and css files are not inserted into the final HTML; this is usually done
by the bundler. The full code with esbuild setup can be seen in <Link to="examples">Examples</Link>.

## Client

On the client side, only `skipLifecycle: true` is added, because the lifecycle has already been
called on the server, and the corresponding UI framework `hydrate` methods are used.

<!-- @include: @shared/usage/client.md -->

## MPA

The Multi Page Application mode works out of the box if the Link component was created following
the documentation example (that is, it uses the native `href`). When navigating to new pages, the server
will return ready-made HTML, and the application remains functional even with JavaScript disabled in the browser.

Thus, the set of `Config` here acts as a route description with validation and, if necessary,
an async lifecycle for loading data, and in some cases can replace traditionally used
server routing libraries.

// #endregion usage-ssr

// #region usage-limitations

# Limitations

While most routing libraries prefer to copy all the functionality
their competitors have and tie themselves tightly to their own ecosystem, **Reactive Route**
keeps its focus on:

- reactive storage of current page data in `router.state[name]`
- async preparation for opening the next page
- a convenient interface for redirects (because native `window.pushState('/new-path?phone=1234')` is not
  typed, runs synchronously, and does not work on the server or in widgets)
- framework and reactivity-system independence

TypeScript is a positive trend today, so all functionality
that is incompatible with static typing is absent. This includes optional
path parameters, JSX declarations like `<Route path="untyped[?-partial]-string/:id/:id/:id">`,
file routing like `posts/$postId/$/$.tsx`, and other practices
that destroy type safety and structure.

## Nested routes / Dynamic routes

Imagine a configuration that is valid from the perspective of a number of alternative routers,
but that will **never exist in Reactive Route**:

<!-- @include: @shared/introduction/createConfigsNestedDynamic.md -->

Collisions of names and validators cannot be resolved at the static analysis level, and redirects
become complex and unreliable, without a clear lifecycle.

In routers that use such patterns, you have to resolve collisions at runtime, keep the entire
component structure and its dynamics in your head, and refactoring requires completely rewriting
redirect logic based on partial path strings without TypeScript assistance.

It is also extremely difficult to make data loading and permission checks flow in a stable way.
Will the second-level `beforeEnter` be called when third-level `params` or `query` change, and vice versa?

Naturally, DX suffers too: there is no support for "Find Usages" or fast IDE navigation,
autocomplete support is limited, there are no hints when describing redirects, and when
using AI during refactoring, you have to pass the entire project code because the route
structure is built at runtime.

Thus, the code above immediately becomes **legacy** and requires expert knowledge of the
project, radically complicating codebase evolution, parallel team work, and transparency.

## Hash / History State

URL hash and History State are **not supported in Reactive Route**, and they are forcibly cleared during redirects.
Using them complicates design and makes the application state fragmented.

The library has two powerful mechanisms for dynamic parameters — optional `query` and
required `params`. They are typed, participate in lifecycles, are validated, and can effectively solve tasks for
which `hash` was traditionally used.

Also, **Reactive Route** is not tied to the History API, which allows it to be used for embedded
widgets or microfrontends with full async routing isolated from other parts of the application, on any framework.

## Non-string params and query

Since the browser URL contains only string values, **Reactive Route** does not include utilities for
automatic conversion to different data types.

<!-- @include: @shared/introduction/noStringConversion.md -->

In this example, string values are checked with `validators.numeric`, which is either project-specific
or taken from any of the hundreds of validation libraries. It is assumed that it has
already checked the value for `NaN`, `Infinite`, `-0` and confirmed that
the string becomes a valid number when passed to `Number(params.id)`.

But conversion itself to `Number / Boolean / Object / Array` is not built into the library and, as in the example
above, is the developer's responsibility. This makes it possible
to use structures of any complexity through custom deserialization mechanisms.

Some libraries have built-in utilities for converting values to a specific type, which creates the 
illusion that a URL can store and process more than just strings. Validation
approaches become incorrect, which is especially noticeable when trying to make the router automatically
convert to `Object / Array / Date` and parse complex structures.

## Untyped beforeEnter / beforeLeave

TypeScript 5 still cannot recursively infer types for `beforeEnter` and `beforeLeave`, so
the `currentState`, `nextState`, and `redirect` arguments have simplified types. You should describe
logic in them carefully — TS will not highlight errors during refactoring.

This limitation only affects the lifecycle; in all other scenarios, full and strict typing remains.
This compromise had to be made because moving lifecycle functions
outside `createConfigs` causes page logic to spread out and worsens DX.

// #endregion usage-limitations

// #region usage-widget

# Widget mode

**Reactive Route** can be detached from `window.history` and used in widget mode, fully
embedding into websites without iframes. Here, the Solid.js variant from <Link to="examples">Examples</Link>
was taken, replacing `await router.init(location.href)` with this code:

<!-- @include: @shared/usage/widgetProject.md -->

You only need to listen for the `'storage'` event if you plan to control the widget from outside:
it is enough to write a new URL to `localStorage` and in some cases trigger this event manually
according to the browser specification. Thus, the two buttons below are native VitePress (Vue)
buttons and on click execute the following code:

<!-- @include: @shared/usage/widgetButtons.md -->

<WidgetPreview :widget-urls="data.widgetUrls" />

The compressed js bundle size for this widget is <span style="color:var(--docsearch-focus-color)">{{ data.metrics.widgetSize }}</span>, 
while it still contains a full
reactivity and rendering system plus **Reactive Route**. Naturally, you can embed several widgets
on different stacks, and even large websites and admin panels, as well as design microfrontends.
The main thing is to ensure isolation of styles and variables by configuring the bundler correctly.

// #endregion usage-widget
