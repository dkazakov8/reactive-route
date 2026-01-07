::: code-group
```tsx [React]
import { renderToString } from 'react-dom/server';
import { getRouter, RouterContext } from 'router';

<!-- @include: @shared/_ssr.md -->

  const html = renderToString(
    <RouterContext.Provider value={{ router }}>
      <App />
    </RouterContext.Provider>
  );

  res.send(template.replace(`<!-- HTML -->`, html));
});
```
```tsx [Preact]
import { renderToString } from 'preact-render-to-string';
import { getRouter, RouterContext } from 'router';

<!-- @include: @shared/_ssr.md -->

  const html = renderToString(
    <RouterContext.Provider value={{ router }}>
      <App />
    </RouterContext.Provider>
  );
  
  res.send(template.replace(`<!-- HTML -->`, html));
});
```
```tsx [Solid]
import { generateHydrationScript, renderToString } from 'solid-js/web';
import { getRouter, RouterContext } from 'router';

import fs from 'node:fs';

import express from 'express';
import { RedirectError } from 'reactive-route';

import { App } from 'components/App';

const app = express();

app.get('*', async (req, res) => {
  const template = `
<html>
<body><div id="app"><!-- HTML --></div></body>
<!-- HYDRATION -->
</html>`;

  const router = getRouter();

  try {
    await router.init(req.originalUrl);
  } catch (error: unknown) {
    if (error instanceof RedirectError) {
      console.log(`Some beforeEnter redirected to ${error.message}`);

      return res.redirect(error.message);
    }

    return res.status(500).send('Unexpected error');
  }

  const html = renderToString(() => (
    <RouterContext.Provider value={{ router }}>
      <App />
    </RouterContext.Provider>
  ));
  
  res.send(template
    .replace(`<!-- HTML -->`, html)
    .replace(`<!-- HYDRATION -->`, generateHydrationScript())
  );
});
```
```ts [Vue]
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { getRouter, routerStoreKey } from './router';

<!-- @include: @shared/_ssr.md -->

  const html = await renderToString(
    createSSRApp(App, { router }).provide(routerStoreKey, { router })
  );

  res.send(template.replace(`<!-- HTML -->`, html));
});
```
:::