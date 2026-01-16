# Server-Side Rendering

For server-side rendering, you need to initialize the router on both the server and the client.
The `escapeAllStrings` and `unescapeAllStrings` utilities are not provided by this library because if you
use SSR, you already have them - for example, from `lodash`.

### Server

::: code-group
```tsx [React]
import { renderToString } from 'react-dom/server';
import { getRouter, RouterContext } from 'router';

<!-- @include: @/snippets/ssr.md -->

  const htmlMarkup = renderToString(
    <RouterContext.Provider value={{ router }}>
      <App />
    </RouterContext.Provider>
  );

  const routerJS = JSON.parse(JSON.stringify({ router }));

  res.send(
    template
      .replace(`<!-- HTML -->`, htmlMarkup)
      .replace('<!-- INITIAL_DATA -->', JSON.stringify(
        escapeAllStrings(storeJS)
      ))
  );
});
```
```tsx [Preact]
import { renderToString } from 'preact-render-to-string';
import { getRouter, RouterContext } from 'router';

<!-- @include: @/snippets/ssr.md -->

  const htmlMarkup = renderToString(
    <RouterContext.Provider value={{ router }}>
      <App />
    </RouterContext.Provider>
  );

  const routerJS = JSON.parse(JSON.stringify({ router }));

  res.send(
    template
      .replace(`<!-- HTML -->`, htmlMarkup)
      .replace('<!-- INITIAL_DATA -->', JSON.stringify(
        escapeAllStrings(storeJS)
      ))
  );
});
```
```tsx [Solid]
import { generateHydrationScript, renderToString } from 'solid-js/web';
import { getRouter, RouterContext } from 'router';

<!-- @include: @/snippets/ssr.md -->

  const htmlMarkup = renderToString(() => (
    <RouterContext.Provider value={{ router }}>
      <App />
    </RouterContext.Provider>
  ));

  const routerJS = JSON.parse(JSON.stringify({ router }));
  
  res.send(
    template
      .replace(`<!-- HTML -->`, htmlMarkup)
      .replace(`<!-- HYDRATION -->`, generateHydrationScript())
      .replace('<!-- INITIAL_DATA -->', JSON.stringify(
        escapeAllStrings(routerJS)
      ))
  );
});
```
```ts [Vue]
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { getRouter, routerStoreKey } from './router';

<!-- @include: @/snippets/ssr.md -->

  const htmlMarkup = await renderToString(
    createSSRApp(App, { router }).provide(routerStoreKey, { router })
  );
  const storeJS = JSON.parse(JSON.stringify({ router }));

  res.send(
    template
      .replace(`<!-- HTML -->`, htmlMarkup)
      .replace('<!-- INITIAL_DATA -->', JSON.stringify(
        escapeAllStrings(storeJS)
      ))
  );
});
```
:::

### Client

::: code-group
```tsx [React]
import { hydrateRoot } from 'react';

import { App } from './App';
import { getRouter, RouterContext } from './router';
import { unescapeAllStrings } from './utils/unescapeAllStrings';

const router = getRouter();

await router.hydrateFromState(
  unescapeAllStrings(window.INITIAL_DATA).router
);

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
import { unescapeAllStrings } from './utils/unescapeAllStrings';

const router = getRouter();

await router.hydrateFromState(
  unescapeAllStrings(window.INITIAL_DATA).router
);

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
import { unescapeAllStrings } from './utils/unescapeAllStrings';

const router = getRouter();

await router.hydrateFromState(
  unescapeAllStrings(window.INITIAL_DATA).router
);

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
import { getRouter, RouterContext } from './router';
import { unescapeAllStrings } from './utils/unescapeAllStrings';

const router = getRouter();

await router.hydrateFromState(
  unescapeAllStrings(window.INITIAL_DATA).router
);

createSSRApp(App, { router })
  .provide(routerStoreKey, { router })
  .mount('#app');
```
:::

