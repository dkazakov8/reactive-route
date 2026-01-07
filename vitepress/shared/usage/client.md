::: code-group
```tsx [React]
import { hydrateRoot } from 'react';

import { App } from './App';
import { getRouter, RouterContext } from './router';

const router = getRouter();

await router.init(location.href, { 
  skipLifecycle: true
});

hydrateRoot(
  document.getElementById('app')!,
  <RouterContext.Provider value={{ router }}>
    <App />
  </RouterContext.Provider>
);
```
```tsx [Preact]
import { hydrate } from 'preact';

import { App } from './App';
import { getRouter, RouterContext } from './router';

const router = getRouter();

await router.init(location.href, {
  skipLifecycle: true
});

hydrate(
  <RouterContext.Provider value={{ router }}>
    <App />
  </RouterContext.Provider>,
  document.getElementById('app')!
);
```
```tsx [Solid]
import { hydrate } from 'solid-js/web';

import { App } from './App';
import { getRouter, RouterContext } from './router';

const router = getRouter();

await router.init(location.href, {
  skipLifecycle: true
});

hydrate(
  () => (
    <RouterContext.Provider value={{ router }}>
      <App />
    </RouterContext.Provider>
  ),
  document.getElementById('app')!
);
```
```ts [Vue]
import { createSSRApp } from 'vue';

import { App } from './App';
import { getRouter, routerStoreKey } from './router';

const router = getRouter();

await router.init(location.href, {
  skipLifecycle: true
});

createSSRApp(App, { router })
  .provide(routerStoreKey, { router })
  .mount('#app');
```
:::
