import solid from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [solid()],
  resolve: {
    conditions: ['development', 'browser'],
  },
  test: {
    include: ['./test/*.{test,spec}.?(c|m)[jt]s?(x)'],
    server: {
      deps: {
        inline: [/solid-js/],
      },
    },
  },
});
