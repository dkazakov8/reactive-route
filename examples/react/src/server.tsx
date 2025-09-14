import fs from 'node:fs';
import path from 'node:path';

import { renderToString } from 'react-dom/server';
import express from 'ultimate-express';

import { escapeAllStrings } from '../../shared/utils/escapeAllStrings';
import { App } from './components/App';
import { StoreContext } from './components/StoreContext';
import { getRouterStore } from './routerStore';

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

  const routerStore = await getRouterStore();

  const reactApp = (
    <StoreContext.Provider value={{ routerStore }}>
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

  const htmlMarkup = renderToString(reactApp);
  const storeJS = JSON.parse(JSON.stringify({ routerStore }));

  res.send(
    template
      .replace(`<!-- HTML -->`, htmlMarkup)
      .replace('<!-- INITIAL_DATA -->', JSON.stringify(escapeAllStrings(storeJS)))
  );
});

app.listen(8000, () => {
  console.log(`started on`, `http://localhost:8000`);
});
