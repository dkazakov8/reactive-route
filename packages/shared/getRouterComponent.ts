import { TypeOptions } from './types';

export async function getRouterComponent(options: TypeOptions) {
  let Router: any;

  if (options.renderer === 'react') Router = (await import('../react')).Router;
  if (options.renderer === 'preact') Router = (await import('../preact')).Router;
  if (options.renderer === 'solid') Router = (await import('../solid')).Router;
  if (options.renderer === 'vue') Router = (await import('../vue')).Router;

  return Router;
}
