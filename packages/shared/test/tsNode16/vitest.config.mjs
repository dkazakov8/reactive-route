import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: 'tsNode16',
    include: ['./*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
});
