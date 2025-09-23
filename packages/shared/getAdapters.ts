import { TypeAdapters } from '../core';
import { TypeOptions } from './types';

export async function getAdapters(options: TypeOptions) {
  let adapters = {} as TypeAdapters;
  if (options.reactivity === 'mobx') {
    if (options.renderer === 'react')
      adapters = await import('reactive-route/adapters/mobx-react').then((m) => m.adapters);
    if (options.renderer === 'preact')
      adapters = await import('reactive-route/adapters/mobx-preact').then((m) => m.adapters);
    if (options.renderer === 'solid')
      adapters = await import('reactive-route/adapters/mobx-solid').then((m) => m.adapters);
  }
  if (options.reactivity === 'solid')
    adapters = await import('reactive-route/adapters/solid').then((m) => m.adapters);
  if (options.reactivity === 'kr-observable') {
    if (options.renderer === 'react')
      adapters = await import('reactive-route/adapters/kr-observable-react').then(
        (m) => m.adapters
      );
    if (options.renderer === 'preact')
      adapters = await import('reactive-route/adapters/kr-observable-preact').then(
        (m) => m.adapters
      );
    if (options.renderer === 'solid')
      adapters = await import('reactive-route/adapters/kr-observable-solid').then(
        (m) => m.adapters
      );
  }

  return adapters;
}
