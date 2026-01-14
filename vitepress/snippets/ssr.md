import fs from 'node:fs';

import express from 'express';
import { RedirectError } from 'reactive-route';

import { App } from 'components/App';
import { escapeAllStrings } from 'utils/escapeAllStrings';

const app = express();

app.get('*', async (req, res) => {
  const template = `
<!DOCTYPE html>
<html>
<head>
  <script>window.INITIAL_DATA = <!-- INITIAL_DATA -->;</script>
</head>
<body>
<div id="app"><!-- HTML --></div>
</body>
<!-- HYDRATION -->
<!-- ENTRY_CSS --><!-- /ENTRY_CSS -->
<!-- ENTRY_JS --><!-- /ENTRY_JS -->
<!-- HOT_RELOAD --><!-- /HOT_RELOAD -->
</html>
`;

  const router = getRouter();

  try {
    const clearedUrl = await router.hydrateFromURL(req.originalUrl);

    if (req.originalUrl !== clearedUrl) return res.redirect(clearedUrl);
  } catch (error: any) {
    if (error instanceof RedirectError) return res.redirect(error.message);

    return res.status(500).send('Unexpected error');
  }