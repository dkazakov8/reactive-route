import babel from 'vite-plugin-babel';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    babel({
      filter: /\.tsx?$/,
      babelConfig: {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' }, modules: false }],
          '@babel/preset-typescript',
          'babel-preset-solid',
        ],
      },
    }),
  ],
  resolve: { conditions: ['browser'] },
  test: {
    name: 'solid',
    include: ['./test/*.{test,spec}.?(c|m)[jt]s?(x)'],
    environment: 'jsdom',
    server: { deps: { inline: [/solid-js/, /kr-observable/] } },
  },
});
