import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'core-ssr',
    include: ['./test/*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
});
