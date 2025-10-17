import { defineConfig, devices } from '@playwright/test';

const variants: Array<{ name: string; port: number; scriptName: string }> = [
  { name: '[React+Mobx]', port: 0, scriptName: './examples/react mobx' },
  { name: '[React+Mobx+SSR]', port: 0, scriptName: './examples/react ssr-mobx' },
  { name: '[React+Observable]', port: 0, scriptName: './examples/react observable' },
  { name: '[React+Observable+SSR]', port: 0, scriptName: './examples/react ssr-observable' },
  { name: '[Preact+Mobx]', port: 0, scriptName: './examples/preact mobx' },
  { name: '[Preact+Mobx+SSR]', port: 0, scriptName: './examples/preact ssr-mobx' },
  { name: '[Preact+Observable]', port: 0, scriptName: './examples/preact observable' },
  { name: '[Preact+Observable+SSR]', port: 0, scriptName: './examples/preact ssr-observable' },
  { name: '[Solid+Mobx]', port: 0, scriptName: './examples/solid mobx' },
  { name: '[Solid+Mobx+SSR]', port: 0, scriptName: './examples/solid ssr-mobx' },
  { name: '[Solid+Observable]', port: 0, scriptName: './examples/solid observable' },
  { name: '[Solid+Observable+SSR]', port: 0, scriptName: './examples/solid ssr-observable' },
  { name: '[Solid+Solid]', port: 0, scriptName: './examples/solid solid' },
  { name: '[Solid+Solid+SSR]', port: 0, scriptName: './examples/solid ssr-solid' },
].map((variant, i) => ({ ...variant, port: 8000 + i * 2 }));

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
