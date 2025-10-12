import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue()],
  test: {
    name: 'core-ssr',
    include: ['./test/*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
});
