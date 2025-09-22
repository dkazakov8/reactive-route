# Server-Side Rendering

For server-side rendering, you need to initialize the router store on both the server and the client.
Use `renderToString` and `hydrate` from you framework, as well as `escapeAllStrings` and `unescapeAllStrings` -
for example, from `lodash`. These utilities are not included in `reactive-route`.

### Server

```tsx
// server.tsx
import { getRouter } from './router';
import { StoreContext } from './StoreContext';
import { RedirectError } from 'reactive-route';

express()
  .get('*', async (req, res) => {
    const template = fs.readFileSync(templatePath, 'utf-8');

    const router = getRouter();

    try {
      await router.restoreFromURL({ pathname: req.originalUrl });
    } catch (error: any) {
      // The redirects on server-side are made manually, because
      // we can't manipulate the browser's url and history
      if (error instanceof RedirectError) {
        // error.message is a full new path here
        return res.redirect(error.message);
      }

      console.error(error);

      return res.status(500).send('Unexpected error');
    }

    const htmlMarkup = renderToString(
      <StoreContext.Provider value={{ router }}>
        <App />
      </StoreContext.Provider>
    );
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
import { getRouter } from './router';
import { StoreContext } from './StoreContext';

const router = getRouter();
const initialData = unescapeAllStrings(window.INITIAL_DATA);

await router.restoreFromServer(initialData.router);

hydrate(
  document.getElementById('app'),
  <StoreContext.Provider value={{ router }}>
    <App />
  </StoreContext.Provider>
);
```
