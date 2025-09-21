import fs from 'node:fs';
import path from 'node:path';

import { renderToString } from 'preact-render-to-string';
import { RedirectError } from 'reactive-route';
import express from 'ultimate-express';

import { escapeAllStrings } from '../../shared/utils/escapeAllStrings';
import { App } from './components/App';
import { StoreContext } from './components/StoreContext';
import { getRouterStore } from './router';

const outdirPath = path.resolve(__dirname, '../dist');
const publicPath = path.resolve(outdirPath, 'public');
const templatePath = path.resolve(outdirPath, 'template.html');

const app = express();

app.use(express.static(publicPath, { index: false, etag: true }));

app.get('*', async (req, res) => {
  if (req.originalUrl.includes('.')) return res.sendStatus(404);

  const template = fs.readFileSync(templatePath, 'utf-8');

  if (!SSR_ENABLED) {
    return res.send(template.replace(`<!-- HTML -->`, '').replace('<!-- INITIAL_DATA -->', '{}'));
  }

  const router = await getRouterStore();

  const reactApp = (
    <StoreContext.Provider value={{ router }}>
      <App />
    </StoreContext.Provider>
  );

  try {
    await router.restoreFromURL({ pathname: req.originalUrl });
  } catch (error: any) {
    if (error instanceof RedirectError) {
      console.log('redirect', error.message);

      return res.redirect(error.message);
    }

    console.error(error);

    return res.status(500).send('Unexpected error');
  }

  const htmlMarkup = renderToString(reactApp);
  const storeJS = JSON.parse(JSON.stringify({ router }));

  res.send(
    template
      .replace(`<!-- HTML -->`, htmlMarkup)
      .replace('<!-- INITIAL_DATA -->', JSON.stringify(escapeAllStrings(storeJS)))
  );
});

app.listen(8000, () => {
  console.log(`started on`, `http://localhost:8000`);
});
