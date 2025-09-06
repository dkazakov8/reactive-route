import fs from 'node:fs';
import path from 'node:path';

import { pluginInjectPreload } from '@espcom/esbuild-plugin-inject-preload';
import { modifierDirname, modifierFilename, pluginReplace } from '@espcom/esbuild-plugin-replace';
// @ts-ignore
import betterSpawn from 'better-spawn';
import { runManual } from 'dk-reload-server';
import { BuildOptions, context, Plugin } from 'esbuild';

const __dirname = import.meta.dirname;

export const createPluginParallel = (callback: () => void) => {
  const activeProcesses = new Set<string>();
  let callbackTimeout: ReturnType<typeof setTimeout>;

  return function pluginParallel(params: { name: string }): Plugin {
    return {
      name: 'plugin-parallel',
      setup(build) {
        build.onStart(() => {
          clearTimeout(callbackTimeout);
          activeProcesses.add(params.name);
        });
        build.onEnd(() => {
          activeProcesses.delete(params.name);

          clearTimeout(callbackTimeout);
          if (activeProcesses.size === 0)
            callbackTimeout = setTimeout(() => {
              callback();
            }, 200);
        });
      },
    };
  };
};

async function watch() {
  const { sendReloadSignal } = runManual({
    port: 8001,
    watchPaths: [path.resolve(__dirname, './dist')],
  });
  const pluginParallel = createPluginParallel(sendReloadSignal);

  const configServer: BuildOptions = {
    entryPoints: ['src/server.tsx'],
    bundle: true,
    write: true,
    metafile: true,
    treeShaking: true,
    sourcemap: false,
    outdir: path.resolve(__dirname, 'dist'),
    platform: 'node',
    packages: 'external',
    format: 'esm',
    target: 'node18',
    define: {
      'process.env.NODE_ENV': JSON.stringify('development'),
      PATH_SEP: JSON.stringify(path.sep),
    },
    resolveExtensions: ['.js', '.ts', '.tsx'],
    plugins: [
      pluginReplace([
        modifierDirname({ filter: /\.(tsx?)$/ }),
        modifierFilename({ filter: /\.(tsx?)$/ }),
      ]),
      pluginParallel({ name: 'server' }),
    ],
  };

  const configClient: BuildOptions = {
    ...configServer,
    entryPoints: ['src/client.tsx'],
    outdir: path.resolve(__dirname, 'dist/public'),
    format: 'esm',
    publicPath: '/',
    splitting: true,
    platform: 'browser',
    target: 'es2020',
    packages: undefined,
    plugins: [
      pluginReplace([
        modifierDirname({ filter: /\.(tsx?)$/ }),
        modifierFilename({ filter: /\.(tsx?)$/ }),
      ]),
      pluginParallel({ name: 'client' }),
      pluginInjectPreload([
        {
          templatePath: path.resolve(__dirname, 'dist/public', 'template.html'),
          replace: '<!-- ENTRY_CSS --><!-- /ENTRY_CSS -->',
          as(filePath) {
            if (/client([^.]+)?\.css$/.test(filePath)) {
              return `<link rel="stylesheet" type="text/css" href="${filePath}" />`;
            }

            return undefined;
          },
        },
        {
          templatePath: path.resolve(__dirname, 'dist/public', 'template.html'),
          replace: '<!-- ENTRY_JS --><!-- /ENTRY_JS -->',
          as(filePath) {
            if (/client([^.]+)?\.js$/.test(filePath)) {
              return `<script src="${filePath}" type="module"></script>`;
            }
          },
        },
        {
          templatePath: path.resolve(__dirname, 'dist/public', 'template.html'),
          replace: '<!-- HOT_RELOAD --><!-- /HOT_RELOAD -->',
          as(filePath) {
            if (/client([^.]+)?\.js$/.test(filePath)) {
              const hotReloadUrl = `http://localhost:8001`;

              return `<script src="${hotReloadUrl}"></script>`;
            }

            return undefined;
          },
        },
      ]),
    ],
  };

  fs.rmSync(path.resolve(__dirname, 'dist'), { recursive: true, force: true });
  fs.mkdirSync(path.resolve(__dirname, 'dist'));
  fs.mkdirSync(path.resolve(__dirname, 'dist/public'));
  fs.cpSync(
    path.resolve(__dirname, 'template.html'),
    path.resolve(path.resolve(__dirname, 'dist/public'), 'template.html'),
    { force: true }
  );

  const ctxClient = await context(configClient);
  const ctxServer = await context(configServer);

  await Promise.all([ctxClient.watch(), ctxServer.watch()]);

  const serverProcess = betterSpawn('node-dev --no-warnings --notify=false ./dist/server.js', {
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  serverProcess.stdout?.on('data', (msg: Buffer) => {
    console.log(msg.toString().trim());
  });
  serverProcess.stderr?.on('data', (msg: Buffer) => console.error(msg.toString().trim()));

  process.on('exit', () => serverProcess?.close());
  process.on('SIGINT', () => process.exit(0));
  process.on('SIGTERM', () => process.exit(0));
}

void watch();
