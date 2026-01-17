import fs from 'node:fs';
import path from 'node:path';

import { enableObservable } from 'kr-observable/solidjs';
import { Reaction } from 'mobx';
import { RedirectError } from 'reactive-route';
import { enableExternalSource } from 'solid-js';
import { generateHydrationScript, renderToString } from 'solid-js/web';
import express from 'ultimate-express';

import { App } from './components/App';
import { getRouter, RouterContext } from './router';
import { escapeAllStrings } from './utils/escapeAllStrings';

const publicPath = path.resolve(import.meta.dirname, 'public');
const templatePath = path.resolve(import.meta.dirname, 'template.html');

if (REACTIVITY_SYSTEM === 'kr-observable') {
  enableObservable(false);
}

if (REACTIVITY_SYSTEM === 'mobx') {
  let id = 0;

  enableExternalSource((fn, trigger) => {
    const reaction = new Reaction(`mobx@${++id}`, trigger);

    return {
      track: (x) => {
        let next;

        reaction.track(() => (next = fn(x)));

        return next;
      },
      dispose: () => reaction.dispose(),
    };
  });
}

const app = express();

app.use(express.static(publicPath, { index: false, etag: true }));

app.get('*', async (req, res) => {
  if (req.originalUrl.includes('.')) return res.sendStatus(404);

  const template = fs.readFileSync(templatePath, 'utf-8');

  if (!SSR_ENABLED) {
    return res.send(template.replace(`<!-- HTML -->`, '').replace('<!-- ROUTER_STATE -->', '{}'));
  }

  const router = await getRouter();

  try {
    const clearedUrl = await router.hydrateFromURL(req.originalUrl);

    if (req.originalUrl !== clearedUrl) return res.redirect(clearedUrl);
  } catch (error: any) {
    if (error instanceof RedirectError) {
      return res.redirect(error.message);
    }

    return res.status(500).send('Unexpected error');
  }

  const htmlMarkup = renderToString(() => (
    <RouterContext.Provider value={{ router }}>
      <App />
    </RouterContext.Provider>
  ));

  res.send(
    template
      .replace(`<!-- HTML -->`, htmlMarkup)
      .replace(`<!-- HYDRATION -->`, generateHydrationScript())
      .replace(
        '<!-- ROUTER_STATE -->',
        JSON.stringify(escapeAllStrings(JSON.parse(JSON.stringify(router.state))))
      )
  );
});

app.listen(PORT, () => {
  console.log(`started on`, `http://localhost:${PORT}`);
});
