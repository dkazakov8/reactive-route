import fs from 'node:fs';
import path from 'node:path';

import { renderToString } from 'react-dom/server';
import { RedirectError } from 'reactive-route';
import express from 'ultimate-express';

import { App } from './components/App';
import { StoreContext } from './components/StoreContext';
import { getRouter } from './router';
import { escapeAllStrings } from './utils/escapeAllStrings';

const publicPath = path.resolve(import.meta.dirname, 'public');
const templatePath = path.resolve(import.meta.dirname, 'template.html');

const app = express();

app.use(express.static(publicPath, { index: false, etag: true }));

app.get('*', async (req, res) => {
  if (req.originalUrl.includes('.')) return res.sendStatus(404);

  const template = fs.readFileSync(templatePath, 'utf-8');

  if (!SSR_ENABLED) {
    return res.send(template.replace(`<!-- HTML -->`, '').replace('<!-- INITIAL_DATA -->', '{}'));
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
});

app.listen(PORT, () => {
  console.log(`started on`, `http://localhost:${PORT}`);
});
