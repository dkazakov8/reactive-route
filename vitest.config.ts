import path from 'node:path';

import preact from '@preact/preset-vite';
import { playwright } from '@vitest/browser-playwright';
import vue from 'unplugin-vue';
import babel from 'vite-plugin-babel';
import { defineConfig, TestProjectConfiguration } from 'vitest/config';

import { VitestReporter } from './units/addons/vitestReporter';
import type { TypeOptions } from './units/helpers/types';

process.setMaxListeners(20);

const solidPlugin = babel({
  filter: /\.tsx?$/,
  babelConfig: { presets: ['@babel/preset-typescript', 'babel-preset-solid'] },
});

const preactPlugin = preact({
  devToolsEnabled: false,
  prefreshEnabled: false,
  reactAliasesEnabled: false,
});

function createProject(
  plugins: Array<any>,
  options?: TypeOptions
): Array<TestProjectConfiguration> {
  return [
    {
      plugins,
      extends: true,
      define: { OPTIONS: options },
      test: {
        name: options ? `${options.renderer}-${options.reactivity}` : `core`,
        include: [options ? `units/Router.test.tsx` : `units/*.test.ts`],
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
      plugins,
      extends: true,
      define: { OPTIONS: options },
      test: {
        name: options ? `${options.renderer}-${options.reactivity}-ssr` : `core-ssr`,
        include: [options ? `units/Router.test.tsx` : `units/*.test.ts`],
      },
    },
  ];
}

export default defineConfig({
  optimizeDeps: {
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
      ...createProject([vue.vite()]),
      ...createProject([], { renderer: 'react', reactivity: 'mobx' }),
      ...createProject([], { renderer: 'react', reactivity: 'kr-observable' }),
      ...createProject([preactPlugin], { renderer: 'preact', reactivity: 'mobx' }),
      ...createProject([preactPlugin], { renderer: 'preact', reactivity: 'kr-observable' }),
      ...createProject([solidPlugin], { renderer: 'solid', reactivity: 'mobx' }),
      ...createProject([solidPlugin], { renderer: 'solid', reactivity: 'solid' }),
      ...createProject([solidPlugin], { renderer: 'solid', reactivity: 'kr-observable' }),
      ...createProject([vue.vite()], { renderer: 'vue', reactivity: 'vue' }),
    ],
    reporters: [new VitestReporter()],
    coverage: {
      clean: true,
      enabled: true,
      provider: 'v8',
      reporter: ['text'],
      reportsDirectory: './test-results',
      include: ['packages/*'],
      exclude: ['packages/*/index.ts', 'packages/declarations.d.ts'],
    },
    onConsoleLog(log) {
      if (log.includes('a is not defined')) {
        return false;
      }

      return true;
    },
  },
});
