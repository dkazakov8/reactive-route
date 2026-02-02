::: code-group
```tsx [React]
import { hydrateRoot } from 'react';

import { getRouter, RouterContext } from './router';
<!-- @include: @shared/ssr-client.md -->

hydrateRoot(
  document.getElementById('app')!,
  <RouterContext.Provider value={{ router }}>
    <App />
  </RouterContext.Provider>
);
```
```tsx [Preact]
import { hydrate } from 'preact';

import { getRouter, RouterContext } from './router';
<!-- @include: @shared/ssr-client.md -->

hydrate(
  <RouterContext.Provider value={{ router }}>
    <App />
  </RouterContext.Provider>,
  document.getElementById('app')!
);
```
```tsx [Solid]
import { hydrate } from 'solid-js/web';

import { getRouter, RouterContext } from './router';
<!-- @include: @shared/ssr-client.md -->

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

import { getRouter, routerStoreKey } from './router';
<!-- @include: @shared/ssr-client.md -->

createSSRApp(App, { router })
  .provide(routerStoreKey, { router })
  .mount('#app');
```
:::
