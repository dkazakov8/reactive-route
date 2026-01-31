<script setup>
import { data } from '@/dynamic.data'
</script>

# Why Reactive Route?

<br>
<Badge type="warning">{{ data.version }}</Badge>
<Badge type="info">Size: <span style="color:var(--docsearch-focus-color)">{{ data.metrics.sizes['reactive-route'].compressed }} KB</span></Badge>
<Badge type="info">Coverage: <span style="color:var(--docsearch-focus-color)">{{ data.coverage }}</span> in <span style="color:var(--docsearch-focus-color)">{{ data.passedTests }}</span> tests</Badge>

When using a reactive state management library (based on Signals or Proxy), integrating existing
routing libraries can be a challenge. Most routers are tightly coupled to the UI (e.g.,
JSX-based) or a specific file structure, and they often maintain their own non-reactive state.
This inevitably leads to synchronization headaches between your app state, the routing state
and `window.history`.

Reactive Route was built to solve this. It's a "reactive-first" solution that, through adapters,
works seamlessly with any reactivity library or UI framework. Its tiny footprint and extensive
feature set make it a perfect fit for everything from small projects (only 8KB with Solid.js — ideal
for mobile or SSR landing pages) to large-scale enterprise applications.

## Official Integrations

Reactive Route currently provides official adapters for:

- React + [MobX](https://mobx.js.org/)
- React + [Observable](https://observable.ru/)
- Preact (no compat) + MobX
- Preact (no compat) + Observable
- Solid.js + [Native Reactivity](https://docs.solidjs.com/concepts/intro-to-reactivity)
- Solid.js + MobX
- Solid.js + Observable
- Vue + [Native Reactivity](https://vuejs.org/guide/extras/reactivity-in-depth)

The core is open for any integration — simply provide the relevant adapters and configure your
rendering.

## Key Features

- **Lifecycle Functions**: Built-in async `beforeEnter` and `beforeLeave` methods give you full control
  over navigation. Easily handle authentication, data prefetching, unsaved
  changes, and complex redirect chains.

- **Lazy Loading**: Native support for dynamic imports (e.g., `() => import('pages/home')`) ensures
  JS chunks are only loaded when needed, significantly boosting performance.

> Make sure your bundler is configured to generate chunks for dynamic imports

- **Modular Exports**: Data exported from page files is accessible via `beforeComponentChange`.
  This enables a clean architecture with per-page stores and robust SSR support.

- **Server-Side Rendering (SSR)**: Set up server-side rendering in just a few lines of code,
  complete with async data loading and URL cleanup.

- **Strict Validation**: Every dynamic path segment (e.g., `/page/:id`) and query parameter
  requires a validator, ensuring your application remains stable and predictable.

- **First-Class Type Safety**: Leveraging TypeScript 5, Reactive Route provides deep static
  validation and intelligent autocomplete. Say goodbye to untyped redirect strings or the
  `string | unknown` patterns common in other libraries.

- **Architect's Dream**: Reactive Route is a standalone layer that functions independently of
  your UI. No routing logic buried in components, no fragile AST parsing for route discovery,
  and no bloated component trees. It places zero constraints on your folder structure or file
  naming.

- **Performance-First**: The reactive-first architecture optimizes component re-renders and
  includes a built-in cache to efficiently handle "nested route" patterns.

- **Reliability**: The library is verified by <span style="color:var(--docsearch-focus-color)">{{ data.passedTests }}</span>
  unit and E2E tests, running in real browsers via Playwright.

## Browser Support

Reactive Route uses Dual Packaging (CJS and ESM) for maximum compatibility across environments.

While the library targets modern standards, your bundler can transpile it and add polyfills to
support older browsers.

| Browser     | Supported Versions | Reason for Limitation                                                                                                                      |
|:------------|:-------------------|:-------------------------------------------------------------------------------------------------------------------------------------------|
| **Chrome**  | **> 55**           | `async/await` (v55), `URLSearchParams` (v49) [[1]](https://caniuse.com/async-functions) [[2]](https://caniuse.com/mdn-api_urlsearchparams) |
| **Firefox** | **> 52**           | `async/await` (v52), `URLSearchParams` (v44)                                                                                               |
| **Safari**  | **> 10.1**         | `async/await` (v10.1), `URLSearchParams` (v10.1)                                                                                           |
| **Edge**    | **> 17**           | `async/await` (v15), `URLSearchParams` (v17)                                                                                               |
| **Opera**   | **> 42**           | `async/await` (v42), `URLSearchParams` (v36)                                                                                               |
| **IE**      | **No**             |                                                                                                                                            |
| **Node.js** | **> 10**           |                                                                                                                                            |

Ready to dive in? If you're an experienced developer, check out the [examples](/en/examples/react)
for your stack. Otherwise, follow the step-by-step guide in the next section.
