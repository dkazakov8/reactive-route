# Example for Solid 2

Since the routing library is a complex integration package that requires a server for SSR and work
with the History API, Live Preview is unavailable. However, you can download and run this example
locally.

## Download

```shell
npx degit dkazakov8/reactive-route/examples/solid2 solid2-example
cd solid2-example
npm install
```

## Run

Choose the mode and reactivity system to run:

- `npm run solid2` - CSR (client-side rendering only) for Solid 2 reactivity
- `npm run mobx` - CSR (client-side rendering only) for MobX
- `npm run observable` - CSR (client-side rendering only) for Observable
- `npm run ssr-solid2` - SSR for Solid 2 reactivity
- `npm run ssr-mobx` - SSR for MobX
- `npm run ssr-observable` - SSR for Observable
