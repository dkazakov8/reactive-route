import preact from '@preact/preset-vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    preact({ devToolsEnabled: false, prefreshEnabled: false, reactAliasesEnabled: false }),
  ],
  test: {
    name: 'preact-ssr',
    include: ['./test/*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
  resolve: {
    // react-router-dom specifies "module" field in package.json for ESM entry
    // if it's not mapped, it uses the "main" field which is CommonJS that redirects to CJS preact
    mainFields: ['module'],
  },
});
