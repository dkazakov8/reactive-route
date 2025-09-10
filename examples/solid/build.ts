import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path, { parse } from 'node:path';

import { transformAsync } from '@babel/core';
import ts from '@babel/preset-typescript';
import { pluginInjectPreload } from '@espcom/esbuild-plugin-inject-preload';
import { modifierDirname, modifierFilename, pluginReplace } from '@espcom/esbuild-plugin-replace';
import { pluginWebpackAnalyzer } from '@espcom/esbuild-plugin-webpack-analyzer';
import solid from 'babel-preset-solid';
import { runManual } from 'dk-reload-server';
import { BuildOptions, context, Plugin } from 'esbuild';

const __dirname = import.meta.dirname;
const outdirPath = path.resolve(__dirname, 'dist');
const publicPath = path.resolve(outdirPath, 'public');
const templatePath = path.resolve(outdirPath, 'template.html');

const SSR_ENABLED = process.argv[2] === 'ssr';

function generateSolidModifier(ssr: boolean) {
  return {
    filter: /\.tsx?$/,
    replace: /.*/gs,
    replacer(onLoadArgs) {
      return async (source) => {
        const result = await transformAsync(source, {
          presets: [[solid, { generate: ssr ? 'ssr' : 'dom', hydratable: true }], [ts]],
          filename: parse(onLoadArgs.path).base,
          sourceMaps: 'inline',
        });

        if (result?.code == null) {
          throw new Error('No result was provided from Babel');
        }

        return result.code;
      };
    },
  };
}

async function watch() {
  const { sendReloadSignal } = runManual({ port: 8001 });

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
      PATH_SEP: JSON.stringify(path.sep),
      SSR_ENABLED: JSON.stringify(SSR_ENABLED),
    },
    resolveExtensions: ['.js', '.ts', '.tsx'],
    plugins: [
      pluginReplace([
        modifierDirname({ filter: /\.(tsx?)$/ }),
        modifierFilename({ filter: /\.(tsx?)$/ }),
        generateSolidModifier(true),
      ]),
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
    splitting: true,
    platform: 'browser',
    target: 'es2022',
    packages: 'bundle',
    plugins: [
      pluginReplace([
        modifierDirname({ filter: /\.(tsx?)$/ }),
        modifierFilename({ filter: /\.(tsx?)$/ }),
        generateSolidModifier(false),
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
              setTimeout(sendReloadSignal, 0);
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
              ? `<script src="http://localhost:8001"></script>`
              : undefined,
        },
      ]),
      pluginWebpackAnalyzer({
        port: 8002,
        open: false,
        extensions: ['.js', '.cjs', '.mjs', '.ts', '.tsx', '.json'],
      }),
    ],
  };

  fs.rmSync(outdirPath, { recursive: true, force: true });
  fs.mkdirSync(outdirPath);
  fs.mkdirSync(publicPath);
  fs.cpSync(path.resolve(__dirname, 'src/template.html'), templatePath, { force: true });

  const ctxClient = await context(configClient);
  const ctxServer = await context(configServer);

  await Promise.all([ctxClient.rebuild(), ctxServer.rebuild()]);
  await Promise.all([ctxClient.watch(), ctxServer.watch()]);

  const serverProcess = spawn('node', ['--watch', './dist/server.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  serverProcess.stdout?.on('data', (msg: Buffer) => {
    const message = msg.toString().trim();

    console.log('[server]', message);

    if (message.includes('started on')) {
      activeProcesses.delete('server');

      if (activeProcesses.size === 0) {
        setTimeout(sendReloadSignal, 0);
      }
    }
  });
  serverProcess.stderr?.on('data', (msg: Buffer) => console.error(msg.toString().trim()));

  process.on('exit', () => serverProcess?.kill());
  process.on('SIGINT', () => process.exit(0));
  process.on('SIGTERM', () => process.exit(0));
}

void watch();
