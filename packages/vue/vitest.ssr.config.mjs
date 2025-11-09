import path from 'node:path';

import pluginVue from 'unplugin-vue';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths(), pluginVue.vite()],
  resolve: {
    alias: { 'reactive-route': path.resolve('packages/core/index.ts') },
  },
  test: {
    name: 'vue-ssr',
    include: ['./test/*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
});
