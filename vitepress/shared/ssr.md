import fs from 'node:fs';

import express from 'express';
import { RedirectError } from 'reactive-route';

import { App } from 'components/App';
import { escapeAllStrings } from 'utils/escapeAllStrings';

const app = express();

app.get('*', async (req, res) => {
  const template = `
<html>
<head><script>window.ROUTER_STATE = <!-- ROUTER_STATE -->;</script></head>
<body><div id="app"><!-- HTML --></div></body>
<!-- HYDRATION -->
</html>
`;

  const router = getRouter();

  try {
    const clearedUrl = await router.init(req.originalUrl);

    if (req.originalUrl !== clearedUrl) return res.redirect(clearedUrl);
  } catch (error: any) {
    if (error instanceof RedirectError) return res.redirect(error.message);

    return res.status(500).send('Unexpected error');
  }