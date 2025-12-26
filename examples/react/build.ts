import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { pluginInjectPreload } from '@espcom/esbuild-plugin-inject-preload';
import { modifierMobxObserverFC, pluginReplace } from '@espcom/esbuild-plugin-replace';
import { pluginWebpackAnalyzer } from '@espcom/esbuild-plugin-webpack-analyzer';
import { BuildOptions, context } from 'esbuild';
import express from 'ultimate-express';

const reloadScript = (port: number) => `(function refresh() {
  let attempt = 0;
  const maxAttempts = 5;
  const socketUrl = window.location.origin.replace(/(^http(s?):\\/\\/)(.*:)(.*)/,${`'ws$2://$3${port}`}');

  function websocketWaiter() {
    if (attempt > maxAttempts) return console.warn('[PAGE-RELOAD] has stopped due to reconnection issues');
  
    const socket = new WebSocket(socketUrl);

    socket.onopen = () => { attempt = 0; }
    socket.onmessage = (msg) => { if (msg.data === 'reload') { socket.close(); window.location.reload(); } };
    socket.onclose = () => { setTimeout(websocketWaiter, 1000); attempt++; };
  }

  window.addEventListener('load', websocketWaiter);
})();`;

const REACTIVITY_SYSTEM: 'mobx' | 'kr-observable' = process.argv[2] as any;
const SSR_ENABLED = process.argv[3] === 'ssr';
const PORT = Number(process.argv[4] || '8000');
const IS_E2E = process.argv[5] === 'test';

const __dirname = import.meta.dirname;
const outdirPath = path.resolve(__dirname, `dist_${PORT}`);
const publicPath = path.resolve(outdirPath, 'public');
const templatePath = path.resolve(outdirPath, 'template.html');

const watchPort = PORT + 100;
const analyzerPort = PORT + 101;

async function watch() {
  let reloadSocket: WebSocket;

  if (!IS_E2E) {
    // start a websocket server to reload browser on changes
    express()
      .uwsApp.ws('/*', { open: (ws) => (reloadSocket = ws as any) })
      .listen(watchPort, () => undefined);
  }

  const activeProcesses = new Set<'server' | 'client'>();

  const configServer: BuildOptions = {
    entryPoints: ['src/server.tsx'],
    bundle: true,
    write: true,
    metafile: true,
    treeShaking: true,
    sourcemap: false,
    outdir: outdirPath,
    platform: 'node',
    packages: 'external',
    format: 'esm',
    target: 'node22',
    define: {
      'process.env.NODE_ENV': JSON.stringify('development'),
      PORT: JSON.stringify(PORT),
      SSR_ENABLED: JSON.stringify(SSR_ENABLED),
      REACTIVITY_SYSTEM: JSON.stringify(REACTIVITY_SYSTEM),
    },
    resolveExtensions: ['.js', '.ts', '.tsx'],
    plugins: [
      {
        name: 'plugin-parallel',
        setup(build) {
          build.onStart(() => {
            activeProcesses.add('server');
          });
        },
      },
    ],
  };

  const configClient: BuildOptions = {
    ...configServer,
    entryPoints: ['src/client.tsx'],
    outdir: publicPath,
    publicPath: '/',
    splitting: false,
    platform: 'browser',
    target: 'es2022',
    packages: 'bundle',
    plugins: [
      pluginReplace([
        modifierMobxObserverFC({
          filter: /\.tsx?$/,
          customImport:
            REACTIVITY_SYSTEM === 'mobx'
              ? undefined
              : `import { observer } from 'kr-observable/react';`,
        }),
      ]),
      {
        name: 'plugin-parallel',
        setup(build) {
          build.onStart(() => {
            activeProcesses.add('client');
          });
          build.onEnd(() => {
            activeProcesses.delete('client');

            if (activeProcesses.size === 0) {
              setTimeout(() => reloadSocket?.send('reload'), 0);
            }
          });
        },
      },
      pluginInjectPreload([
        {
          templatePath,
          replace: '<!-- ENTRY_CSS --><!-- /ENTRY_CSS -->',
          as: (filePath) =>
            /client([^.]+)?\.css$/.test(filePath)
              ? `<link rel="stylesheet" type="text/css" href="${filePath}" />`
              : undefined,
        },
        {
          templatePath,
          replace: '<!-- ENTRY_JS --><!-- /ENTRY_JS -->',
          as: (filePath) =>
            /client([^.]+)?\.js$/.test(filePath)
              ? `<script src="${filePath}" type="module"></script>`
              : undefined,
        },
        {
          templatePath,
          replace: '<!-- HOT_RELOAD --><!-- /HOT_RELOAD -->',
          as: (filePath) =>
            /client([^.]+)?\.js$/.test(filePath)
              ? `<script>${reloadScript(watchPort)}</script>`
              : undefined,
        },
      ]),
      !IS_E2E &&
        pluginWebpackAnalyzer({
          port: analyzerPort,
          open: false,
          extensions: ['.js', '.cjs', '.mjs', '.ts', '.tsx', '.json'],
        }),
    ].filter(Boolean),
  };

  fs.rmSync(outdirPath, { recursive: true, force: true });
  fs.mkdirSync(outdirPath);
  fs.mkdirSync(publicPath);
  fs.cpSync(path.resolve(__dirname, './src/template.html'), templatePath, { force: true });

  const ctxClient = await context(configClient);
  const ctxServer = await context(configServer);

  await Promise.all([ctxClient.rebuild(), ctxServer.rebuild()]);

  if (!IS_E2E) {
    await Promise.all([ctxClient.watch(), ctxServer.watch()]);
  }

  const serverProcess = spawn('node', ['--watch', `./dist_${PORT}/server.js`], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  serverProcess.stdout?.on('data', (msg: Buffer) => {
    const message = msg.toString().trim();

    console.log('[server]', message);

    if (message.includes('started on')) {
      activeProcesses.delete('server');

      if (activeProcesses.size === 0) {
        setTimeout(() => reloadSocket?.send('reload'), 0);
      }
    }
  });
  serverProcess.stderr?.on('data', (msg: Buffer) => console.error(msg.toString().trim()));

  process.on('exit', () => serverProcess?.kill());
  process.on('SIGINT', () => process.exit(0));
  process.on('SIGTERM', () => process.exit(0));
}

void watch();
