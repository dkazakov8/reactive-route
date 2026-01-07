import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { pluginInjectPreload } from '@espcom/esbuild-plugin-inject-preload';
import { pluginReplace } from '@espcom/esbuild-plugin-replace';
import { pluginWebpackAnalyzer } from '@espcom/esbuild-plugin-webpack-analyzer';
import { BuildOptions, context } from 'esbuild';
import express from 'ultimate-express';

import { generateSolidModifier } from './plugins';

const reloadScript = (port: number) => `(function refresh() {
  let attempt = 0;
  const maxAttempts = 5;
  const socketUrl = window.location.origin.replace(/(^http(s?):\\/\\/)(.*:)(.*)/,${`'ws$2://$3${port}`}');

  function websocketWaiter() {
    if (attempt > maxAttempts) return console.warn('[page-reload] has stopped due to reconnection issues');
  
    const socket = new WebSocket(socketUrl);

    socket.onopen = () => { attempt = 0; }
    socket.onmessage = (msg) => { if (msg.data === 'reload') { socket.close(); window.location.reload(); } };
    socket.onclose = () => { setTimeout(websocketWaiter, 1000); attempt++; };
  }

  window.addEventListener('load', websocketWaiter);
})();`;

const REACTIVITY_SYSTEM: 'solid' | 'kr-observable' | 'mobx' = process.argv[2] as any;
const SSR_ENABLED = process.argv[3] === 'ssr';
const PORT = Number(process.argv[4] || '8000');
const IS_E2E = process.argv[5] === 'test';

const __dirname = import.meta.dirname;
const outdirPath = path.resolve(__dirname, `dist_${PORT}`);
const publicPath = path.resolve(outdirPath, 'public');
const templatePath = path.resolve(outdirPath, 'template.html');
const serverBundlePath = path.resolve(outdirPath, 'server.js');

const watchPort = PORT + 100;
const analyzerPort = PORT + 101;

let reloadSocket: WebSocket | undefined;
let serverSign = '';

const activeProcesses = new Set<'server' | 'client'>();

function compareServerSignature() {
  // when only styles changed esbuild triggers server rebuild,
  // but the server file is not modified and node --watch is not triggered, so this hack is needed
  try {
    const stats = fs.statSync(serverBundlePath);
    const newSign = `${stats.size}:${stats.mtimeMs}`;

    // in the real app only styles refresh needed, not full reload
    if (newSign === serverSign) {
      return true;
    }

    serverSign = newSign;
  } catch (_e) {
    // noop
  }

  return false;
}

function sendReload(reason: string) {
  if (!reloadSocket) return;

  const socket = reloadSocket;

  setTimeout(() => {
    if (activeProcesses.size !== 0 || socket !== reloadSocket) return;

    socket.send('reload');

    console.log(`[page-reload]`, reason);
  }, 0);
}

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
    pluginReplace([generateSolidModifier(true)]),
    {
      name: 'plugin-parallel',
      setup(build) {
        build.onStart(() => {
          compareServerSignature();
          activeProcesses.add('server');
        });

        build.onEnd(() => {
          if (compareServerSignature()) {
            activeProcesses.delete('server');
            sendReload('server was rebuilt last');
          }
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
  splitting: true,
  platform: 'browser',
  target: 'es2022',
  packages: 'bundle',
  plugins: [
    pluginReplace([generateSolidModifier(false)]),
    {
      name: 'plugin-parallel',
      setup(build) {
        build.onStart(() => activeProcesses.add('client'));
        build.onEnd(() => {
          activeProcesses.delete('client');
          sendReload('client was rebuilt last');
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
            ? `<script src="${filePath}" type="module"></script><script>${reloadScript(watchPort)}</script>`
            : undefined,
      },
    ]),
    !IS_E2E && pluginWebpackAnalyzer({ port: analyzerPort, extensions: ['.js', '.ts', '.tsx'] }),
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
  // start a websocket server to reload browser on changes
  express()
    .uwsApp.ws('/*', {
      open: (ws) => (reloadSocket = ws as any),
      close: (ws) => {
        if (reloadSocket === (ws as any)) reloadSocket = undefined;
      },
    })
    .listen(watchPort, () => undefined);

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

    sendReload(`server was restarted`);
  }
});
serverProcess.stderr?.on('data', (msg: Buffer) => console.error(msg.toString().trim()));

process.on('exit', () => serverProcess?.kill());
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
