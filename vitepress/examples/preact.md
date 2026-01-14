# Preact Example

To use it follow these steps:

```shell
npx degit dkazakov8/reactive-route/examples/preact preact-example
cd preact-example
npm install
```

Next, choose the mode and reactivity system to start:

- `npm run mobx` - CSR (Client rendering only) for MobX
- `npm run observable` - CSR (Client rendering only) for Observable
- `npm run ssr-mobx` - SSR for MobX
- `npm run ssr-observable` - SSR for Observable

Note, that wrapping of components in `observer` is made by the ESBuild bundler in this example.
In your own projects, remember to follow the relevant [Framework Integration](/guide/preact).
