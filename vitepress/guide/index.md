<script setup>
import { data } from '../dynamic.data'
</script>

# Why Reactive Route?

<br>
<Badge type="warning">{{ data.version }}</Badge>
<Badge type="info">Size: <span style="color:var(--docsearch-focus-color)">{{ data.size }}</span></Badge>
<Badge type="info">Coverage: <span style="color:var(--docsearch-focus-color)">{{ data.coverage }}</span> in <span style="color:var(--docsearch-focus-color)">{{ data.passedTests }}</span> tests</Badge>

When you use a reactive state management library (either Signals or Proxy-based) it's quite 
challenging to integrate existing routing libraries. They are usually hard-linked to the UI 
(e.g., JSX-based) or file structure, and have their own non-reactive state. Eventually, your project 
ends up with two routing states (or three including browser's history) and the struggle of keeping them in sync.

Also, you may have microfrontends or just several projects using different UI libraries (like React, 
Solid.js, Vue) and different reactivity systems (MobX, Observable, Solid.js signals, Vue reactive). 
It's much easier to have a single routing library with a unified approach across all these apps and
feel "at home" when working with other tech stacks.

So, a reactive-first solution that works with any UI and reactive library was born. It is ready for 
small projects (with Solid.js it's about 8 KB and ready for mobile-only projects or landing pages 
with SSR) and large-scale applications.

## Ready for your stack

Currently, Reactive Route provides official implementations for:

- React + [MobX](https://mobx.js.org/)
- React + [Observable](https://observable.ru/)
- Preact (no compat) + MobX
- Preact (no compat) + Observable
- Solid.js + [Solid.js reactivity](https://docs.solidjs.com/concepts/intro-to-reactivity)
- Solid.js + MobX
- Solid.js + Observable
- Vue + [Vue reactivity](https://vuejs.org/guide/extras/reactivity-in-depth)

and the core is open for your own stack just by passing relevant adapters and a Router component.

## Powerful features

- **Lifecycle**: Built-in async `beforeEnter` and `beforeLeave` methods allow you to control navigation flow, 
perform authentication checks, load data, fill stores, handle unsaved changes, perform multiple redirects.

- **Dynamic Component Loading**: Async imports (e.g., `() => import('./pages/Home')`) allow JS 
chunks to load on demand (when a user navigates to a specific page or programmatically), improving application performance. 
This feature depends on your bundler's ability to generate separate chunks.

- **Modular Data Integration**: You can export any data from pages, and it is accessible through 
a method `beforeComponentChange`. This is essential for SSR 
with modular/domain/per-page stores and serves as a powerful Dependency Injection mechanism.

- **Server-Side Rendering**: An easy-to-use mechanism for pre-rendering pages on the server side with
optional data loading and optional clearing of irrelevant query parameters from the URL.

- **Strict Validation**: Every dynamic parameter from the URL (e.g., `/page/:id/:mode`) and every 
query parameter must have a validator, preventing invalid routes and improving application robustness.

- **Type Safety**: Comprehensive TypeScript support for routes, dynamic parameters, and query parameters, 
providing excellent DX with autocomplete. No more redirects to untyped strings or manual searching during refactoring.
It's much better than in many popular routing libraries where "absolute type-safety" means `string | unknown`.

- **Architect's Dream**: The router is a flat, separate layer that works with any framework – or none at all.
No more routing logic buried inside UI components and templates. No need for AST parsing of markup to
find routes, and no polluted component trees. There are also no requirements for folder structure or file naming.

- **Optimization**: The reactive-first solution optimizes component rerenders and has a built-in 
cache for different routes which load the same component (needed for imitating "nested routes" behavior).

- **Stability**: The library is backed by <span style="color:var(--docsearch-focus-color)">{{ data.passedTests }}</span> unit and E2E tests which run 
in real browsers using Playwright.

## Browser Support

Reactive Route is built with Dual Packaging (both CJS and ESM bundles with auto-detect) for maximum compatibility.
This list provides supported browser versions of the distributed code, your bundler may transform it and add polyfills
to increase compatibility.

| Browser     | Version supported | Limiting Feature                                                                                                                           |
|:------------|:------------------|:-------------------------------------------------------------------------------------------------------------------------------------------|
| **Chrome**  | **> 55**          | `async/await` (v55), `URLSearchParams` (v49) [[1]](https://caniuse.com/async-functions) [[2]](https://caniuse.com/mdn-api_urlsearchparams) |
| **Firefox** | **> 52**          | `async/await` (v52), `URLSearchParams` (v44)                                                                                               |
| **Safari**  | **> 10.1**        | `async/await` (v10.1), `URLSearchParams` (v10.1)                                                                                           |
| **Edge**    | **> 17**          | `async/await` (v15), `URLSearchParams` (v17)                                                                                               |
| **Opera**   | **> 42**          | `async/await` (v42), `URLSearchParams` (v36)                                                                                               |
| **IE**      | **None**          |
| **Node.js** | **> 10**          |                                                                                                                                            |

Ready to give it a try? If you are an experienced developer, you can jump straight into the [examples](/examples/react)
for your favorite stack – the usage is intuitive and straightforward. Or, follow the 
[Getting Started](/guide/getting-started) guide for step-by-step instructions.
