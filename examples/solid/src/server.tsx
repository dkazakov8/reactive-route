import fs from 'node:fs';
import path from 'node:path';

import express from 'express';
import { enableObservable } from 'kr-observable/solidjs';
import { /*disableObservableTracking, */ enableObservableTracking } from 'mobx-solid';
import { RedirectError } from 'reactive-route';
import { generateHydrationScript, renderToString } from 'solid-js/web';

import { App } from './components/App';
import { getRouter, RouterContext } from './router';

const publicPath = path.resolve(import.meta.dirname, 'public');
const templatePath = path.resolve(import.meta.dirname, 'template.html');

if (REACTIVITY_SYSTEM === 'kr-observable') {
  enableObservable(false);
}

express()
  .use(express.static(publicPath, { index: false, etag: true }))
  .get('/{*splat}', async (req, res) => {
    if (req.originalUrl.includes('.')) return res.sendStatus(404);

    const template = fs.readFileSync(templatePath, 'utf-8');

    if (!SSR_ENABLED) {
      return res.send(template.replace(`<!-- HTML -->`, ''));
    }

    const router = getRouter();

    try {
      const clearedUrl = await router.init(req.originalUrl);

      if (req.originalUrl !== clearedUrl) {
        console.log(
          `Server redirected from ${req.originalUrl} to ${clearedUrl} to clear irrelevant query`
        );

        return res.redirect(clearedUrl);
      }
    } catch (error: unknown) {
      if (error instanceof RedirectError) {
        console.log(
          `Some beforeEnter issued a redirect from ${req.originalUrl} to ${error.message}`
        );

        return res.redirect(error.message);
      }

      return res.status(500).send('Unexpected error');
    }

    if (REACTIVITY_SYSTEM === 'mobx') {
      enableObservableTracking();
    }

    const html = renderToString(() => (
      <RouterContext.Provider value={{ router }}>
        <App />
      </RouterContext.Provider>
    ));

    if (REACTIVITY_SYSTEM === 'mobx') {
      // disableObservableTracking();
    }

    res.send(
      template
        .replace(`<!-- HTML -->`, html)
        .replace(`<!-- HYDRATION -->`, generateHydrationScript())
    );
  })
  .listen(PORT, () => console.log(`started on`, `http://localhost:${PORT}`));
