# Getting Started

## Installation

A single package includes everything you need to get started. See the integration sections for
stack-specific peer dependencies.

<!-- @include: @/snippets/getting-started/install.md -->

## Module Map

<<< @/../vitepress/modulesMap.ts

## Creating the Router and Routes

The `notFound` and `internalError` routes are required for the library's error handling. Note that
their configurations do not support `params` or `query`.

It's recommended to use the Context API to provide the router to your components. This prevents circular
dependencies, avoids multiple instances, and enables SSR.

Example `router.ts` (this can be combined with other contexts if needed):

<!-- @include: @/snippets/getting-started/router.md -->

The `loader` expects the page component to be the `default` export. You can also use named exports or
pass components directly via `loader: () => Promise.resolve({ default: MyComponent })` if you aren't
using code splitting. However, using the recommended dynamic import approach helps avoid potential
circular dependency issues.

Even at this stage, you'll benefit from modern TypeScript features: when you define
`path: '/user/:id'`, TS automatically recognizes the `:id` dynamic parameter and guides you through
creating the appropriate validator.

## Rendering and Context Providing

For this example, we'll use Client-Side Rendering (CSR) with
[router.init](/guide/router-api.html#router-init). The [SSR](/guide/ssr) version
is very similar but uses the framework-appropriate `hydrate` method.

<!-- @include: @/snippets/getting-started/render.md -->

You're all set! From here, you'll mainly be adding or editing your route configurations.