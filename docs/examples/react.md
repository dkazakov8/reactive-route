# React Example

To use it follow these steps:

```shell
git clone https://github.com/dkazakov8/reactive-route.git
cd ./reactive-route/examples/react
pnpm install
```

This example is configured to use `pnpm` by default, but you may choose your own package manager
by editing `packageManager` field in `package.json`.

Next, choose the mode and reactivity system to start:

- `pnpm run mobx` - CSR (Client rendering only) for MobX
- `pnpm run observable` - CSR (Client rendering only) for Observable
- `pnpm run ssr-mobx` - SSR for MobX
- `pnpm run ssr-observable` - SSR for Observable

Note, that wrapping of components in `observer` is made by the ESBuild bundler in this example.
In your own projects, remember to follow the relevant [Framework Integration](/guide/react).
