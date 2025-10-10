import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: 'react-ssr',
    include: ['./test/*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
});
