import path from 'node:path';

// @ts-expect-error
import { transformAsync } from '@babel/core';
import preact from '@preact/preset-vite';
import solid2 from '@solidjs/vite-plugin';
import { playwright } from '@vitest/browser-playwright';
import vue from 'unplugin-vue';
import { defineConfig, type TestProjectInlineConfiguration } from 'vitest/config';

import { VitestReporter } from './units/addons/vitestReporter.ts';
import type { TypeOptions } from './units/helpers/types.ts';

process.setMaxListeners(20);

function createSolidPlugin() {
  return {
    name: 'solid-babel',
    enforce: 'pre' as const,
    async transform(code: string, id: string) {
      if (!/\.tsx?$/.test(id)) return;

      const result = await transformAsync(code, {
        filename: id,
        presets: ['@babel/preset-typescript', 'babel-preset-solid'],
        sourceMaps: true,
      });

      if (!result) return;

      return { code: result.code ?? code, map: result.map };
    },
  };
}

function createSolid2Plugin() {
  return solid2({
    dev: false,
    refresh: { disabled: true },
    solid: { hydratable: true, moduleName: '@solidjs/web2' },
  });
}

const solid2SsrModuleUrlPlugin = {
  name: 'solid2-ssr-module-url',
  enforce: 'post' as const,
  transform(code: string) {
    const result = code.replace(/\nexport const \$\$moduleUrl = .*;\n?$/, '');

    if (result !== code) return result;
  },
};

const solid2PeerPlugin = {
  name: 'solid2-peer',
  enforce: 'pre' as const,
  transform(code: string, id: string) {
    if (!id.includes('/@solidjs/web/dist/') && !id.includes('/mobx-solid/')) {
      return;
    }

    return code
      .replaceAll(`from 'solid-js'`, `from 'solid-js2'`)
      .replaceAll(`from "solid-js"`, `from "solid-js2"`);
  },
};

function createPreactPlugin() {
  return preact({
    babel: {},
    devToolsEnabled: false,
    prefreshEnabled: false,
    reactAliasesEnabled: false,
  });
}

const solid2plugins = [() => solid2PeerPlugin, createSolid2Plugin, () => solid2SsrModuleUrlPlugin];

function createProject(
  plugins: Array<() => any>,
  options?: TypeOptions
): Array<TestProjectInlineConfiguration> {
  const includeWithOptions = `units/component*.test.ts`;

  const include = [options ? includeWithOptions : `units/*.test.ts`];
  const exclude = [options ? '' : includeWithOptions];

  return [
    {
      plugins: plugins.map((p) => p()),
      extends: true,
      define: { OPTIONS: options },
      test: {
        name: options ? `${options.renderer}-${options.reactivity}` : `core`,
        include,
        exclude,
        browser: {
          enabled: true,
          headless: true,
          screenshotFailures: false,
          provider: playwright(),
          instances: [{ browser: 'chromium' }],
        },
      },
    },
    {
      plugins: plugins.map((p) => p()),
      extends: true,
      define: { OPTIONS: options },
      test: {
        name: options ? `${options.renderer}-${options.reactivity}-ssr` : `core-ssr`,
        environment: 'node',
        include,
        exclude,
      },
    },
  ];
}

export default defineConfig({
  optimizeDeps: {
    exclude: ['@solidjs/web2', 'solid-js2', 'mobx-solid'],
    include: [
      'preact/jsx-dev-runtime',
      'vitest-browser-vue',
      'react/jsx-dev-runtime',
      'vitest-browser-react',
      'vitest-browser-preact',
      '@solidjs/testing-library',
      'react-dom/server',
      'preact-render-to-string',
      'solid-js/web',
      'vue/server-renderer',
      'vue',
      'kr-observable',
      'kr-observable/preact',
      'preact/hooks',
    ],
  },
  resolve: { alias: { 'reactive-route': path.resolve('packages/core/index.ts') } },
  test: {
    projects: [
      // ...createProject([() => vue.vite()]),
      // ...createProject([], { renderer: 'react', reactivity: 'mobx' }),
      // ...createProject([], { renderer: 'react', reactivity: 'kr-observable' }),
      // ...createProject([createPreactPlugin], { renderer: 'preact', reactivity: 'mobx' }),
      // ...createProject([createPreactPlugin], { renderer: 'preact', reactivity: 'kr-observable' }),
      // ...createProject([createSolidPlugin], { renderer: 'solid', reactivity: 'mobx' }),
      // ...createProject([createSolidPlugin], { renderer: 'solid', reactivity: 'solid' }),
      // ...createProject([createSolidPlugin], { renderer: 'solid', reactivity: 'kr-observable' }),
      // ...createProject(solid2plugins, { renderer: 'solid2', reactivity: 'solid2' }),
      ...createProject(solid2plugins, { renderer: 'solid2', reactivity: 'mobx' }),
      // ...createProject(solid2plugins, { renderer: 'solid2', reactivity: 'kr-observable' }),
      // ...createProject([() => vue.vite()], { renderer: 'vue', reactivity: 'vue' }),
    ],
    reporters: [new VitestReporter()],
    coverage: {
      clean: true,
      enabled: true,
      provider: 'v8',
      reporter: ['text'],
      reportsDirectory: './test-results',
      include: ['packages/*'],
      exclude: ['packages/*/index.ts', 'packages/declarations.d.ts', 'packages/core/constants.ts'],
    },
  },
});
