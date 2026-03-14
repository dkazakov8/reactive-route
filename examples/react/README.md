# Example for React

Since the routing library is a complex integration package that requires a server for SSR and work
with the History API, Live Preview is unavailable. However, you can download and run this example
locally.

## Download

```shell
npx degit dkazakov8/reactive-route/examples/react react-example
cd react-example
npm install
```

## Run

Choose the mode and reactivity system to run:

- `npm run mobx` - CSR (client-side rendering only) for MobX
- `npm run observable` - CSR (client-side rendering only) for Observable
- `npm run ssr-mobx` - SSR for MobX
- `npm run ssr-observable` - SSR for Observable

In this example, wrapping components in `observer` is handled by the ESBuild bundler.
In your own projects, follow the React integration guide from the documentation.
