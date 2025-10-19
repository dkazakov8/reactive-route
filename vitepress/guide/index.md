# What is Reactive Route?

![coverage](https://github.com/dkazakov8/reactive-route/blob/master/assets/coverage.svg)
[![npm](https://img.shields.io/npm/v/reactive-route)](https://www.npmjs.com/package/reactive-route)
![size-core](https://github.com/dkazakov8/reactive-route/blob/master/assets/core.svg)
![size-react](https://github.com/dkazakov8/reactive-route/blob/master/assets/react.svg)
![size-preact](https://github.com/dkazakov8/reactive-route/blob/master/assets/preact.svg)
![size-solid](https://github.com/dkazakov8/reactive-route/blob/master/assets/solid.svg)

Reactive Route is a lightweight, flexible, and reactive router for JavaScript applications.

### Framework and State Management Agnostic

The core routing logic is framework-agnostic, allowing it to be used with different UI frameworks and 
state management solutions. Currently, Reactive Route provides official implementations for:

- React + MobX
- React + Observable
- Preact (no compat) + MobX
- Preact (no compat) + Observable
- Solid.js + Solid.js reactivity
- Solid.js + MobX
- Solid.js + Observable
- Vue + Vue reactivity (package in development)

### Key Advantages

Reactive Route offers several advantages that make it a powerful choice for routing in modern web applications:

- **Lifecycle Hooks**: Built-in `beforeEnter` and `beforeLeave` hooks allow you to control navigation flow, perform authentication checks, load data, and handle unsaved changes.

- **Dynamic Component Loading**: Supports dynamically loaded components through async imports (e.g., `() => import('./pages/Home')`), enabling code splitting and improving application performance.

- **Modular Data Integration**: Supports dynamically loaded modular stores and other data for pages, making state management more organized and efficient.

- **Server-Side Rendering**: Full SSR support for all the supported frameworks, ensuring optimal performance and SEO benefits.

- **Parameter Validation**: Ensures that every dynamic parameter from the URL has a validator, preventing invalid routes and improving application robustness.

- **TypeScript Integration**: Comprehensive TypeScript support for routes, dynamic parameters, and search queries, providing excellent developer experience and type safety.

- **Separation of Concerns**: Functions as a centralized separate layer, eliminating the need for markup like `<Route path="..." />` inside components and keeping your component tree clean.

In the following sections, we'll explore how to install and use Reactive Route in your applications.
