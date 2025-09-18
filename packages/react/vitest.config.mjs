import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'react',
    include: ['./test/*.{test,spec}.?(c|m)[jt]s?(x)'],
    environment: 'jsdom',
  },
});
