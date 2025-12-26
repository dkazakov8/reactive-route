# Why Reactive Route?

When you use a reactive state management library (either Signals or Proxy-based) it's usually quite 
challenging to integrate existing routing libraries. They are usually hard-linked to the UI (e.g., JSX-based) 
and have their own non-reactive state. Eventually, your project ends up with two routing states 
and the struggle of keeping them in sync.

Also, you may have microfrontends or just several projects using different UI libraries (like React, 
Solid.js, Vue) and different reactivity systems (MobX, Observable, Solid.js signals, Vue reactive). 
It's much easier to have a single routing library with a unified approach across all these apps. 
Developers from one tech stack will feel "at home" when working with others, 
leading to more stable code and faster delivery.

So, we need a reactive-first solution that works with any UI and reactive library.

Reactive Route is battle-proven both for small projects (Solid.js + Reactive Route
are just 8 kb of code, ready for mobile-only projects or landing pages with SSR) and large-scale applications 
(50+ pages on React with partial SSR for an unauthorized zone).

Currently, Reactive Route provides official implementations for:

- React + MobX
- React + Observable
- Preact (no compat) + MobX
- Preact (no compat) + Observable
- Solid.js + Solid.js signals
- Solid.js + MobX
- Solid.js + Observable
- Vue + Vue reactive

and the core is open for your own stack just by passing relevant adapters and a Router component.

### What makes Reactive Route a great choice

- **Lifecycle**: Built-in `beforeEnter` and `beforeLeave` methods allow you to control navigation flow, 
perform authentication checks, load data, fill stores, handle unsaved changes, perform multiple redirects.

- **Dynamic Component Loading**: Async imports (e.g., `() => import('./pages/Home')`) allow JS 
chunks to load on demand (when a user navigates to a specific page or programmatically), improving application performance. 
This feature depends on your bundler's ability to generate separate chunks. 
Microfrontends are also technically supported, though their implementation varies greatly 
from project to project, so Reactive Route does not provide a boilerplate architecture for them.

- **Modular Data Integration**: You can export any data from pages, and it is accessible through 
several built-in methods like `beforeEnter` and `beforeSetPageComponent`. This is essential for SSR 
with modular/domain/per-page stores and serves as a powerful Dependency Injection mechanism.

- **Server-Side Rendering**: An easy-to-use mechanism for pre-rendering pages on the server side with
optional data loading and optional clearing of irrelevant query parameters from the URL.

- **Strict Validation**: Every dynamic parameter from the URL (e.g., `/page/:id/:mode`) and every 
query parameter must have a validator, preventing invalid routes and improving application robustness.

- **TypeScript Integration**: Comprehensive TypeScript support for routes, dynamic parameters, and query parameters, 
providing excellent DX with autocomplete. No more redirects to untyped strings or manual searching during refactoring.

- **Architect's Dream**: The router is a flat, separate layer that works with any framework – or none at all.
No more routing logic buried inside UI components and templates. No need for AST parsing of markup to
find routes, and no polluted component trees. There are also no requirements for folder structure or file naming.

- **Stability**: The library is backed by over 500 unit and E2E tests which run the
[examples](/examples/react) in real browsers. This open-source version was released only after 7 years 
of development, optimization, and battle-testing in dozens of projects.

Ready to give it a try? If you are an experienced developer, you can jump straight into the [examples](/examples/react)
for your favorite stack – the usage is intuitive and straightforward. Or, follow the 
[Getting Started](/guide/getting-started) guide for step-by-step instructions.
