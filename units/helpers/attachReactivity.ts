import type { TypeOptions } from './types';

export async function attachReactivity(options: TypeOptions) {
  if (options.renderer === 'solid') {
    if (options.reactivity === 'mobx') {
      const { enableObservableTracking } = await import('mobx-solid');

      enableObservableTracking();
    }

    if (options.reactivity === 'kr-observable') {
      const { enableObservable } = await import('kr-observable/solidjs');

      enableObservable();
    }
  }

  if (options.renderer === 'solid2') {
    if (options.reactivity === 'mobx') {
      const { enableObservableTracking } = await import('mobx-solid');

      enableObservableTracking();
    }

    if (options.reactivity === 'kr-observable') {
      const { enableObservable } = await import('kr-observable/solidjs');

      enableObservable();
    }
  }
}
