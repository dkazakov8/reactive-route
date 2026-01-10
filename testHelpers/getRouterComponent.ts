import { TypeOptions } from './types';

export async function getRouterComponent(options: TypeOptions) {
  let Router: any;

  if (options.renderer === 'react') Router = (await import('../packages/react')).Router;
  if (options.renderer === 'preact') Router = (await import('../packages/preact')).Router;
  if (options.renderer === 'solid') Router = (await import('../packages/solid')).Router;
  if (options.renderer === 'vue') Router = (await import('../packages/vue')).Router;

  return Router;
}
