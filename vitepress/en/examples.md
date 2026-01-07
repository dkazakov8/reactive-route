<script setup>
import examplesTree from '../tree.json'
</script>

// #region examples-react

# Example for React

Since the routing library is a complex integration package that requires a server for SSR and work
with the History API, Live Preview is unavailable. However, you can download ready-made examples.

### Preview

<CodeView framework="react" :tree="examplesTree" />

### Download

```shell
npx degit dkazakov8/reactive-route/examples/react react-example
cd react-example
npm install
```

Then choose the mode and reactivity system to run:

- `npm run mobx` — CSR (client-side rendering only) for MobX
- `npm run observable` — CSR (client-side rendering only) for Observable
- `npm run ssr-mobx` — SSR for MobX
- `npm run ssr-observable` — SSR for Observable

Note that in this example, wrapping components in `observer` is handled by the ESBuild bundler. 
In your own projects, do not forget to follow the relevant <Link to="integration/react">integration</Link> guide.

// #endregion examples-react

// #region examples-vue

# Example for Vue

Since the routing library is a complex integration package that requires a server for SSR and work
with the History API, Live Preview is unavailable. However, you can download ready-made examples.

### Preview

<CodeView framework="vue" :tree="examplesTree" />

### Download

```shell
npx degit dkazakov8/reactive-route/examples/vue vue-example
cd vue-example
npm install
```

Then choose the mode and reactivity system to run:

- `npm run vue` — CSR (client-side rendering only) for Vue reactivity
- `npm run ssr-vue` — SSR for Vue reactivity

// #endregion examples-vue

// #region examples-solid

# Example for Solid.js

Since the routing library is a complex integration package that requires a server for SSR and work
with the History API, Live Preview is unavailable. However, you can download ready-made examples.

### Preview

<CodeView framework="solid" :tree="examplesTree" />

### Download

```shell
npx degit dkazakov8/reactive-route/examples/solid solid-example
cd solid-example
npm install
```

Then choose the mode and reactivity system to run:

- `npm run solid` — CSR (client-side rendering only) for Solid.js reactivity
- `npm run mobx` — CSR (client-side rendering only) for MobX
- `npm run observable` — CSR (client-side rendering only) for Observable
- `npm run ssr-solid` — SSR for Solid.js reactivity
- `npm run ssr-mobx` — SSR for MobX
- `npm run ssr-observable` — SSR for Observable

// #endregion examples-solid

// #region examples-preact

# Example for Preact

Since the routing library is a complex integration package that requires a server for SSR and work
with the History API, Live Preview is unavailable. However, you can download ready-made examples.

### Preview

<CodeView framework="preact" :tree="examplesTree" />

### Download

```shell
npx degit dkazakov8/reactive-route/examples/preact preact-example
cd preact-example
npm install
```

Then choose the mode and reactivity system to run:

- `npm run mobx` — CSR (client-side rendering only) for MobX
- `npm run observable` — CSR (client-side rendering only) for Observable
- `npm run ssr-mobx` — SSR for MobX
- `npm run ssr-observable` — SSR for Observable

Note that in this example, wrapping components in `observer` is handled by the ESBuild bundler.
In your own projects, do not forget to follow the relevant <Link to="integration/preact">integration</Link> guide.

// #endregion examples-preact