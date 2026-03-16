import fs from 'node:fs';
import path from 'node:path';

import { pluginReplace } from '@espcom/esbuild-plugin-replace';
import esbuild, { type BuildOptions, type Plugin } from 'esbuild';

import { generateSolidModifier } from '../examples/solid/plugins';
import { getCompressedSize } from './measure';
import { saveMetrics } from './saveMetrics';

const rootDir = path.resolve(import.meta.dirname, '..');
const outdir = path.resolve(rootDir, 'vitepress/public/widget_solid');

const localReactiveStatePlugin: Plugin = {
  name: 'local-reactive-route',
  setup(build) {
    build.onResolve({ filter: /^reactive-route(?:\/.*)?$/ }, (args) => {
      if (args.path === 'reactive-route') {
        return { path: path.resolve(rootDir, 'packages/core/index.ts') };
      }

      if (args.path === 'reactive-route/solid') {
        return { path: path.resolve(rootDir, 'packages/solid/index.ts') };
      }

      const adapterMatch = args.path.match(/^reactive-route\/adapters\/(.+)$/);

      if (adapterMatch) {
        return { path: path.resolve(rootDir, `packages/adapters/${adapterMatch[1]}.ts`) };
      }

      return null;
    });
  },
};

const configClient: BuildOptions = {
  entryPoints: ['examples/solid/src/client.tsx'],
  bundle: true,
  write: true,
  metafile: true,
  treeShaking: true,
  sourcemap: false,
  outdir,
  outbase: 'src',
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  packages: 'bundle',
  splitting: false,
  minify: true,
  entryNames: '[name]-[hash]',
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    SSR_ENABLED: JSON.stringify(false),
    REACTIVITY_SYSTEM: JSON.stringify('solid'),
  },
  resolveExtensions: ['.js', '.ts', '.tsx'],
  plugins: [
    localReactiveStatePlugin,
    pluginReplace([
      generateSolidModifier(false, (source) => {
        return source
          .replace(
            'await router.init(location.href, { skipLifecycle: Boolean(SSR_ENABLED) });',
            `
import { createRenderEffect } from 'solid-js';

router.historySyncStop();

await router.init(localStorage.getItem('WIDGET_URL') || '/');

// save to external storage
createRenderEffect(() => {
  const currentUrl = router.activeName
    ? router.stateToUrl(router.state[router.activeName])
    : '/';

  localStorage.setItem('WIDGET_URL', currentUrl);
});

// restore from external storage
window.addEventListener('storage', (event) => {
  if (event.key === 'WIDGET_URL') {
    router.redirect(router.urlToState(event.newValue || '/'));
  }
});
        `
          )
          .replaceAll('example-app', 'example-app-solid');
      }),
    ]),
  ],
};

export async function buildWidgetSolid() {
  fs.rmSync(outdir, { recursive: true, force: true });
  fs.mkdirSync(outdir, { recursive: true });

  const result = await esbuild.build(configClient);

  for (const outputPath of Object.keys(result.metafile?.outputs || {})) {
    if (outputPath.endsWith('.js')) {
      const compressedSize = await getCompressedSize(outputPath);

      saveMetrics({ key: 'widgetSizeSolid', value: `${compressedSize.compressed} KB` });
    }
  }
}
