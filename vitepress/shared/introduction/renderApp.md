<Tabs :frameworks="['React', 'Preact', 'Solid', 'Vue']">
<template #React>

::: code-group
```tsx [entry.tsx]
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { getRouter, RouterContext } from './router';

const router = getRouter();

await router.init(location.pathname + location.search);

createRoot(document.getElementById('app')!).render(
  <RouterContext.Provider value={{ router }}>
    <App />
  </RouterContext.Provider>
);
```
```tsx [App.tsx]
import { Router } from 'reactive-route/react';

import { useRouter } from './router';

export function App() {
  const { router } = useRouter();

  return <Router router={router} />;
}
```
:::

</template>
<template #Preact>

::: code-group
```tsx [entry.tsx]
import { render } from 'preact';

import { App } from './App';
import { getRouter, RouterContext } from './router';

const router = getRouter();

await router.init(location.pathname + location.search);

render(
  <RouterContext.Provider value={{ router }}>
    <App />
  </RouterContext.Provider>,
  document.getElementById('app')!
);
```
```tsx [App.tsx]
import { Router } from 'reactive-route/preact';

import { useRouter } from './router';

export function App() {
  const { router } = useRouter();

  return <Router router={router} />;
}
```
:::

</template>
<template #Solid>

::: code-group
```tsx [entry.tsx]
import { render } from 'solid-js/web';

import { App } from './App';
import { getRouter, RouterContext } from './router';

const router = getRouter();

await router.init(location.pathname + location.search);

render(
  () => (
    <RouterContext.Provider value={{ router }}>
      <App />
    </RouterContext.Provider>
  ),
  document.getElementById('app')!
);
```
```tsx [App.tsx]
import { Router } from 'reactive-route/solid';

import { useRouter } from './router';

export function App() {
  const { router } = useRouter();

  return <Router router={router} />;
}
```
:::

</template>
<template #Vue>

::: code-group
```ts [entry.ts]
import { createApp } from 'vue';

import App from './App.vue';
import { getRouter, routerStoreKey } from './router';

const router = getRouter();

await router.init(location.pathname + location.search);

createApp(App, { router })
  .provide(routerStoreKey, { router })
  .mount('#app');
```
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
:::

</template>
</Tabs>