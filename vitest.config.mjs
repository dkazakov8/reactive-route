import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['packages/*/vitest.config.mjs', 'packages/*/vitest.ssr.config.mjs'],
    coverage: {
      clean: false,
      enabled: true,
      provider: 'istanbul',
      reporter: ['text', ['cobertura', { file: 'core.xml' }]],
      reportsDirectory: './.nyc_output',
      include: ['packages/*'],
      exclude: ['packages/*/test/*', 'packages/shared'],
    },
    onConsoleLog(log) {
      if (log.includes('a is not defined')) {
        return false;
      }

      return true;
    },
  },
});
