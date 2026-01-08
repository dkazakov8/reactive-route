import path from 'node:path';

import preact from '@preact/preset-vite';
import { playwright } from '@vitest/browser-playwright';
import vue from 'unplugin-vue';
import babel from 'vite-plugin-babel';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig, TestProjectConfiguration } from 'vitest/config';

import { VitestReporter } from './scripts/vitestReporter';

const solidPlugin = babel({
  filter: /\.tsx?$/,
  babelConfig: { presets: ['@babel/preset-typescript', 'babel-preset-solid'] },
});

const preactPlugin = preact({
  devToolsEnabled: false,
  prefreshEnabled: false,
  reactAliasesEnabled: false,
});

function createProjectConfig(name: string, plugins: Array<any>): TestProjectConfiguration {
  return {
    plugins: [tsconfigPaths(), ...plugins],
    extends: true,
    test: {
      name,
      include: [`packages/${name.split('-')[0]}/test/*.{test,spec}.?(c|m)[jt]s?(x)`],
      browser: name.split('-')[1]
        ? undefined
        : {
            enabled: true,
            headless: true,
            screenshotFailures: false,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
    },
  };
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
      createProjectConfig('core', [vue.vite()]),
      createProjectConfig('core-ssr', [vue.vite()]),
      createProjectConfig('solid', [solidPlugin]),
      createProjectConfig('solid-ssr', [solidPlugin]),
      createProjectConfig('preact', [preactPlugin]),
      createProjectConfig('preact-ssr', [preactPlugin]),
      createProjectConfig('react', []),
      createProjectConfig('react-ssr', []),
      createProjectConfig('vue', [vue.vite()]),
      createProjectConfig('vue-ssr', [vue.vite()]),
    ],
    reporters: [new VitestReporter()],
    coverage: {
      clean: true,
      enabled: true,
      provider: 'v8',
      reporter: ['text'],
      reportsDirectory: './test-results',
      include: ['packages/*'],
      exclude: [
        'packages/*/test/*',
        'packages/shared',
        'packages/*/index.ts',
        'packages/declarations.d.ts',
      ],
    },
    onConsoleLog(log) {
      if (log.includes('a is not defined')) {
        return false;
      }

      return true;
    },
  },
});
