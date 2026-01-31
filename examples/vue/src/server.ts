import fs from 'node:fs';
import path from 'node:path';

import { RedirectError } from 'reactive-route';
import express from 'ultimate-express';
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';

import App from './components/App.vue';
import { getRouter, routerStoreKey } from './router';

const publicPath = path.resolve(import.meta.dirname, 'public');
const templatePath = path.resolve(import.meta.dirname, 'template.html');

express()
  .use(express.static(publicPath, { index: false, etag: true }))
  .get('*', async (req, res) => {
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
          `Reactive Route cleared irrelevant query and redirected from ${req.originalUrl} to ${clearedUrl}`
        );

        return res.redirect(clearedUrl);
      }
    } catch (error: any) {
      if (error instanceof RedirectError) {
        console.log(
          `Some Config.beforeEnter redirected from ${req.originalUrl} to ${error.message}`
        );

        return res.redirect(error.message);
      }

      return res.status(500).send('Unexpected error');
    }

    res.send(
      template.replace(
        `<!-- HTML -->`,
        await renderToString(createSSRApp(App, { router }).provide(routerStoreKey, { router }))
      )
    );
  })
  .listen(PORT, () => console.log(`started on`, `http://localhost:${PORT}`));
