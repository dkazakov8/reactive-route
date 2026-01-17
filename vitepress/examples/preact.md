# Preact Example

To get started, clone the example from the repository and install its dependencies:

```shell
npx degit dkazakov8/reactive-route/examples/preact preact-example
cd preact-example
npm install
```

Then, choose the desired rendering mode and reactivity system:

- `npm run mobx` — Client-Side Rendering (CSR) with MobX
- `npm run observable` — Client-Side Rendering (CSR) with Observable
- `npm run ssr-mobx` — Server-Side Rendering (SSR) with MobX
- `npm run ssr-observable` — Server-Side Rendering (SSR) with Observable

Note: In this example, components are automatically wrapped in `observer` via the ESBuild bundler. In
your own projects, be sure to follow the [Preact Integration](/guide/preact) guide.
