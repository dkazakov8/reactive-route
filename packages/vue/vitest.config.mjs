import vue from '@vitejs/plugin-vue';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths(), vue()],
  resolve: { conditions: ['browser'] },
  test: {
    name: 'vue',
    include: ['./test/*.{test,spec}.?(c|m)[jt]s?(x)'],
    environment: 'jsdom',
  },
});
