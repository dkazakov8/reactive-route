import solid from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [solid({ hot: false })],
  resolve: {
    conditions: ['development', 'browser'],
    // alias: {
    //   'solid-js/web': 'solid-js/web/dist/dev.js',
    //   'solid-js/store': 'solid-js/store/dist/dev.js',
    //   'solid-js': 'solid-js/dist/dev.js',
    // },
  },
  // optimizeDeps: {
  //   exclude: [/solid-js/],
  // },
  test: {
    include: ['./test/*.{test,spec}.?(c|m)[jt]s?(x)'],
    server: {
      deps: {
        inline: [/solid-js/],
      },
    },
  },
});
