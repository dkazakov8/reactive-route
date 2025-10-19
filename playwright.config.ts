import { defineConfig, devices } from '@playwright/test';

const csrVariants: Array<{ name: string; scriptName: string }> = [
  { name: '[React+Mobx]', scriptName: './examples/react mobx' },
  { name: '[React+Observable]', scriptName: './examples/react observable' },
  { name: '[Preact+Mobx]', scriptName: './examples/preact mobx' },
  { name: '[Preact+Observable]', scriptName: './examples/preact observable' },
  { name: '[Solid+Mobx]', scriptName: './examples/solid mobx' },
  { name: '[Solid+Observable]', scriptName: './examples/solid observable' },
  { name: '[Solid+Solid]', scriptName: './examples/solid solid' },
];

const ssrVariants: Array<{ name: string; scriptName: string }> = [
  { name: '[React+Mobx+SSR]', scriptName: './examples/react ssr-mobx' },
  { name: '[React+Observable+SSR]', scriptName: './examples/react ssr-observable' },
  { name: '[Preact+Mobx+SSR]', scriptName: './examples/preact ssr-mobx' },
  { name: '[Preact+Observable+SSR]', scriptName: './examples/preact ssr-observable' },
  { name: '[Solid+Mobx+SSR]', scriptName: './examples/solid ssr-mobx' },
  { name: '[Solid+Observable+SSR]', scriptName: './examples/solid ssr-observable' },
  { name: '[Solid+Solid+SSR]', scriptName: './examples/solid ssr-solid' },
];

const variants: Array<{ name: string; port: number; scriptName: string }> = [
  ...csrVariants,
  ...ssrVariants,
].map((variant, i) => ({ ...variant, port: 8002 + i * 2 }));

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: false,
  retries: 0,
  // workers: 10,
  reporter: [['list']],
  webServer: variants.map((variant) => ({
    name: variant.name,
    command: `pnpm --filter ${variant.scriptName} ${variant.port} test`,
    port: variant.port,
    reuseExistingServer: false,
    timeout: 10000,
    cwd: __dirname,
    stdout: 'pipe',
  })),
  projects: variants.map((variant) => ({
    name: variant.name,
    use: {
      baseURL: `http://localhost:${variant.port}`,
      ...devices['Desktop Chrome'],
    },
  })),
  globalTeardown: require.resolve('./e2e/teardown'),
});
