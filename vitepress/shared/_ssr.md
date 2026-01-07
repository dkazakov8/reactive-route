import fs from 'node:fs';

import express from 'express';
import { RedirectError } from 'reactive-route';

import { App } from 'components/App';

const app = express();

app.get('*', async (req, res) => {
  const template = `
<html>
<body><div id="app"><!-- HTML --></div></body>
</html>`;

  const router = getRouter();

  try {
    await router.init(req.originalUrl);
  } catch (error: unknown) {
    if (error instanceof RedirectError) {
      console.log(`Some beforeEnter redirected to ${error.message}`);

      return res.redirect(error.message);
    }

    return res.status(500).send('Unexpected error');
  }