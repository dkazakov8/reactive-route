import path from 'node:path';

import { defineConfig, devices } from '@playwright/test';

import { handleProcessExit } from './e2e/addons/handleProcessExit';

type TypeVariant = { folder: string; script: string; port?: number; name?: string };

const csrVariants: Array<TypeVariant> = [
  { folder: 'react', script: 'mobx' },
  { folder: 'react', script: 'observable' },
  { folder: 'preact', script: 'mobx' },
  { folder: 'preact', script: 'observable' },
  { folder: 'solid', script: 'mobx' },
  { folder: 'solid', script: 'observable' },
  { folder: 'solid', script: 'solid' },
  { folder: 'vue', script: 'vue' },
];

const ssrVariants: Array<TypeVariant> = [
  { folder: 'react', script: 'ssr-mobx' },
  { folder: 'react', script: 'ssr-observable' },
  { folder: 'preact', script: 'ssr-mobx' },
  { folder: 'preact', script: 'ssr-observable' },
  { folder: 'solid', script: 'ssr-mobx' },
  { folder: 'solid', script: 'ssr-observable' },
  { folder: 'solid', script: 'ssr-solid' },
  { folder: 'vue', script: 'ssr-vue' },
];

const variants: Array<TypeVariant> = [...csrVariants, ...ssrVariants].map((variant, i) => ({
  ...variant,
  name: `${variant.folder}+${variant.script.split('-').reverse().join('+')}`,
  port: 8002 + i * 2,
}));

export default defineConfig({
  testDir: './e2e',
  outputDir: './tmp',
  fullyParallel: true,
  forbidOnly: false,
  retries: 0,
  reporter: [['list'], ['./e2e/addons/playwrightReporter.ts']],
  webServer: variants.map((variant) => ({
    name: variant.name,
    command: `pnpm --filter ./examples/${variant.folder} ${variant.script} ${variant.port} test`,
    port: variant.port,
    reuseExistingServer: false,
    timeout: 10000,
    cwd: process.cwd(),
    stdout: 'pipe',
    wait: { stdout: /started/ },
  })),
  projects: variants.map((variant) => ({
    name: variant.name,
    use: {
      baseURL: `http://localhost:${variant.port}`,
      ...devices['Desktop Chrome'],
    },
  })),
  globalTeardown: path.resolve('./e2e/addons/globalTeardown'),
});

handleProcessExit();
