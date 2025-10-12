import { TypeAdapters } from '../core';
import { TypeOptions } from './types';

export async function getAdapters(options: TypeOptions) {
  let adapters = {} as TypeAdapters;
  if (options.reactivity === 'mobx') {
    if (options.renderer === 'react')
      adapters = await import('../adapters/mobx-react').then((m) => m.adapters);
    if (options.renderer === 'preact')
      adapters = await import('../adapters/mobx-preact').then((m) => m.adapters);
    if (options.renderer === 'solid')
      adapters = await import('../adapters/mobx-solid').then((m) => m.adapters);
  }
  if (options.reactivity === 'solid')
    adapters = await import('../adapters/solid').then((m) => m.adapters);
  if (options.reactivity === 'vue')
    adapters = await import('../adapters/vue').then((m) => m.adapters);
  if (options.reactivity === 'kr-observable') {
    if (options.renderer === 'react')
      adapters = await import('../adapters/kr-observable-react').then((m) => m.adapters);
    if (options.renderer === 'preact')
      adapters = await import('../adapters/kr-observable-preact').then((m) => m.adapters);
    if (options.renderer === 'solid')
      adapters = await import('../adapters/kr-observable-solid').then((m) => m.adapters);
  }

  return adapters;
}
