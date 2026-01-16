# Getting Started

## Installation

The all-in-one package includes everything needed to use Reactive Route. Refer to Framework Integration
sections for required peer dependencies.

<!-- @include: @/snippets/getting-started/install.md -->

## Modules map

<<< @/modulesMap.ts

## Router Store and Routes

First, create a router store using the `createRouter` function and your routes configuration using 
the `createRoutes` function. 

Routes `notFound` and `internalError` are required for error handling in the library, their 
configuration is partially customizable (no `params` and `query` are allowed).

The recommended way is to use Context to pass it to UI components to avoid circular dependencies,
multiple instances and add the possibility of SSR.

<!-- @include: @/snippets/getting-started/router.md -->

## Router Component and Context providing

In this tutorial we will use CSR (client-only rendering) by using [router.hydrateFromURL](/ru/guide/router-api.html#router-hydratefromurl) function.
[SSR](/guide/ssr) version is very similar, but uses `router.hydrateFromServer` and relevant `hydrate` functions from
UI frameworks.

<!-- @include: @/snippets/getting-started/render.md -->

Everything has been set up and is ready to use. In the future, you will only edit the routes configuration
to add new pages or change existing ones.