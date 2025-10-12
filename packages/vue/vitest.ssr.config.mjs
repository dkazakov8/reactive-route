import vue from '@vitejs/plugin-vue';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths(), vue()],
  test: {
    name: 'vue-ssr',
    include: ['./test/*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
});
