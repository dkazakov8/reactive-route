::: code-group
```tsx [React]
import { renderToString } from 'react-dom/server';
import { getRouter, RouterContext } from 'router';

<!-- @include: @snippets/ssr.md -->

  res.send(
    template
      .replace(
        `<!-- HTML -->`, 
        renderToString(
          <RouterContext.Provider value={{ router }}>
            <App />
          </RouterContext.Provider>
        )
      )
      .replace(
        '<!-- ROUTER_STATE -->',
        JSON.stringify(escapeAllStrings(
          JSON.parse(JSON.stringify(router.state))
        ))
      )
  );
});
```
```tsx [Preact]
import { renderToString } from 'preact-render-to-string';
import { getRouter, RouterContext } from 'router';

<!-- @include: @snippets/ssr.md -->

  res.send(
    template
      .replace(
        `<!-- HTML -->`,
        renderToString(
          <RouterContext.Provider value={{ router }}>
            <App />
          </RouterContext.Provider>
        )
      )
      .replace(
        '<!-- ROUTER_STATE -->',
        JSON.stringify(escapeAllStrings(
          JSON.parse(JSON.stringify(router.state))
        ))
      )
  );
});
```
```tsx [Solid]
import { generateHydrationScript, renderToString } from 'solid-js/web';
import { getRouter, RouterContext } from 'router';

<!-- @include: @snippets/ssr.md -->
  
  res.send(
    template
      .replace(`<!-- HYDRATION -->`, generateHydrationScript())
      .replace(
        `<!-- HTML -->`,
        renderToString(() => (
          <RouterContext.Provider value={{ router }}>
            <App />
          </RouterContext.Provider>
        ))
      )
      .replace(
        '<!-- ROUTER_STATE -->',
        JSON.stringify(escapeAllStrings(
          JSON.parse(JSON.stringify(router.state))
        ))
      )
  );
});
```
```ts [Vue]
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { getRouter, routerStoreKey } from './router';

<!-- @include: @snippets/ssr.md -->

  const html = await renderToString(
    createSSRApp(App, { router }).provide(routerStoreKey, { router })
  );

  res.send(
    template
      .replace(`<!-- HTML -->`, html)
      .replace(
        '<!-- ROUTER_STATE -->',
        JSON.stringify(escapeAllStrings(
          JSON.parse(JSON.stringify(router.state))
        ))
      )
  );
});
```
:::