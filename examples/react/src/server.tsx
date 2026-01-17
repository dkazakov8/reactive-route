import fs from 'node:fs';
import path from 'node:path';

import { renderToString } from 'react-dom/server';
import { RedirectError } from 'reactive-route';
import express from 'ultimate-express';

import { App } from './components/App';
import { getRouter, RouterContext } from './router';
import { escapeAllStrings } from './utils/escapeAllStrings';

const publicPath = path.resolve(import.meta.dirname, 'public');
const templatePath = path.resolve(import.meta.dirname, 'template.html');

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
    if (error instanceof RedirectError) return res.redirect(error.message);

    return res.status(500).send('Unexpected error');
  }

  const htmlMarkup = renderToString(
    <RouterContext.Provider value={{ router }}>
      <App />
    </RouterContext.Provider>
  );

  res.send(
    template
      .replace(`<!-- HTML -->`, htmlMarkup)
      .replace(
        '<!-- ROUTER_STATE -->',
        JSON.stringify(escapeAllStrings(JSON.parse(JSON.stringify(router.state))))
      )
  );
});

app.listen(PORT, () => {
  console.log(`started on`, `http://localhost:${PORT}`);
});
