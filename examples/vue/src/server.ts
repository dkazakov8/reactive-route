import fs from 'node:fs';
import path from 'node:path';

import { RedirectError } from 'reactive-route';
import express from 'ultimate-express';
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';

import App from './components/App.vue';
import { getRouter } from './router';
import { escapeAllStrings } from './utils/escapeAllStrings';

const outdirPath = path.resolve(__dirname, `../dist_${PORT}`);
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

  const router = await getRouter();

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

  const clearedUrl = router.routesHistory[router.routesHistory.length - 1]!;

  if (req.originalUrl !== clearedUrl) {
    console.log('redirect', clearedUrl);

    return res.redirect(clearedUrl);
  }

  const htmlMarkup = await renderToString(createSSRApp(App, { router }));
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
