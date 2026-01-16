<Tabs :frameworks="['react', 'preact', 'solid', 'vue']">
<template #react>

::: code-group
```tsx [App.tsx]
import { Router } from 'reactive-route/react';

import { useRouter } from './router';

export function App() {
  const { router } = useRouter();

  return <Router router={router} />;
}
```
```tsx [entry.tsx]
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { getRouter, RouterContext } from './router';

const router = getRouter();

await router.hydrateFromURL(location.pathname + location.search);

createRoot(document.getElementById('app')!).render(
  <RouterContext.Provider value={{ router }}>
    <App />
  </RouterContext.Provider>
);
```
:::

</template>
<template #preact>

::: code-group
```tsx [App.tsx]
import { Router } from 'reactive-route/preact';

import { useRouter } from './router';

export function App() {
  const { router } = useRouter();

  return <Router router={router} />;
}
```
```tsx [entry.tsx]
import { render } from 'preact';

import { App } from './App';
import { getRouter, RouterContext } from './router';

const router = getRouter();

await router.hydrateFromURL(location.pathname + location.search);

render(
  <RouterContext.Provider value={{ router }}>
    <App />
  </RouterContext.Provider>,
  document.getElementById('app')!
);
```
:::

</template>
<template #solid>

::: code-group
```tsx [App.tsx]
import { Router } from 'reactive-route/solid';

import { useRouter } from './router';

export function App() {
  const { router } = useRouter();

  return <Router router={router} />;
}
```
```tsx [entry.tsx]
import { render } from 'solid-js/web';

import { App } from './App';
import { getRouter, RouterContext } from './router';

const router = getRouter();

await router.hydrateFromURL(location.pathname + location.search);

render(
  () => (
    <RouterContext.Provider value={{ router }}>
      <App />
    </RouterContext.Provider>
  ),
  document.getElementById('app')!
);
```
:::

</template>
<template #vue>

::: code-group
```vue [App.vue]
<script lang="ts" setup>
  import { Router } from 'reactive-route/vue';

  import { useRouter } from './router';

  const { router } = useRouter();
</script>

<template>
  <Router :router="router" />
</template>
```
```ts [entry.ts]
import { createApp } from 'vue';

import App from './App.vue';
import { getRouter, routerStoreKey } from './router';

const router = getRouter();

await router.hydrateFromURL(location.pathname + location.search);

createApp(App, { router })
  .provide(routerStoreKey, { router })
  .mount('#app');
```
:::

</template>
</Tabs>