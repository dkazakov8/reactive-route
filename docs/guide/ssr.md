# Server-Side Rendering

For server-side rendering, you need to initialize the router store on both the server and the client:

### Server

```tsx
// server.tsx
import { getRouter } from './routerStore';
import { StoreContext } from './StoreContext';

express()
  .get('*', async (req, res) => {
    const template = fs.readFileSync(templatePath, 'utf-8');

    const router = getRouter();

    const fullApp = (
      <StoreContext.Provider value={{ router }}>
        <App />
      </StoreContext.Provider>
    );

    try {
      await routerStore.restoreFromURL({ pathname: req.originalUrl });
    } catch (error: any) {
      if (error.name === 'REDIRECT') {
        console.log('redirect', error.message);

        return res.redirect(error.message);
      }

      console.error(error);

      return res.status(500).send('Unexpected error');
    }

    const htmlMarkup = renderToString(fullApp);
    const storeJS = JSON.parse(JSON.stringify({ router }));

    res.send(
      template
        .replace(`<!-- HTML -->`, htmlMarkup)
        .replace('<!-- INITIAL_DATA -->', JSON.stringify(escapeAllStrings(storeJS)))
    );
  })
```

### Client

```tsx
// client.js
import { getRouter } from './routerStore';
import { StoreContext } from './StoreContext';

async function hydrate() {
  const router = getRouter();
  const initialData = unescapeAllStrings(window.INITIAL_DATA);

  await router.restoreFromServer(initialData.router);

  hydrate(
    document.getElementById('app'),
    <StoreContext.Provider value={{ router }}>
      <App />
    </StoreContext.Provider>
  );
}
```

## Next Steps

Now that you understand how to use the router store, you can learn about [Navigation Guards](/guide/navigation-guards) to control the navigation flow in your application.
