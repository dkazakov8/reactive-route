import { TypeOptions } from './types';

export async function getRouterContext(options: TypeOptions) {
  let context: any;

  if (options.renderer === 'react') {
    context = await import('../pages/react/RouterContext').then((m) => m.RouterContext);
  }

  if (options.renderer === 'preact') {
    context = await import('../pages/preact/RouterContext').then((m) => m.RouterContext);
  }

  if (options.renderer === 'solid') {
    context = await import('../pages/solid/RouterContext').then((m) => m.RouterContext);
  }

  if (options.renderer === 'vue') {
    context = await import('../pages/vue/useRouterStore').then((m) => m.provideRouterStore);
  }

  return context;
}
