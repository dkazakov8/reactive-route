import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

import express from 'express';
import { renderToString } from 'react-dom/server';
import { getInitialRoute } from 'reactive-route';
import serveStatic from 'serve-static';

import { App } from './components/App';
import { StoreContext } from './components/StoreContext';
import { getRouterStore } from './routerStore';
import { routes } from './routes';
import { escapeAllStrings } from './utils/escapeAllStrings';

const app = express()
  .disable('x-powered-by')
  .use(serveStatic(path.resolve(__dirname, '../dist/public')))
  .get('*splat', async (req, res) => {
    const contextValue = { routerStore: getRouterStore() };

    const reactApp = (
      <StoreContext.Provider value={contextValue}>
        <App />
      </StoreContext.Provider>
    );

    try {
      await contextValue.routerStore.redirectTo(
        getInitialRoute({
          routes,
          pathname: req.originalUrl,
          fallback: 'error404',
        })
      );
    } catch (error: any) {
      if (error.name === 'REDIRECT') {
        console.log('redirect', error.message);

        res.redirect(error.message);

        return;
      }

      console.error(error);

      const template500 = fs.readFileSync(
        path.resolve(__dirname, '../dist/public/template.html'),
        'utf-8'
      );

      res.status(500).send(template500);

      return;
    }

    const htmlMarkup = renderToString(reactApp);
    const storeJS = JSON.parse(JSON.stringify(contextValue));

    res.send(
      fs
        .readFileSync(path.resolve(__dirname, '../dist/public/template.html'), 'utf-8')
        .replace(`<!-- HTML -->`, htmlMarkup)
        .replace('<!-- INITIAL_DATA -->', JSON.stringify(escapeAllStrings(storeJS)))
    );
  });

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
http.createServer(app).listen(8000, () => {
  const link = `http://localhost:8000`;

  console.log(`started on`, link);
});
