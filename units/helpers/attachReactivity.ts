import { TypeOptions } from './types';

export async function attachReactivity(options: TypeOptions) {
  if (options.renderer === 'solid') {
    if (options.reactivity === 'mobx') {
      const { enableExternalSource } = await import('solid-js');
      const { Reaction } = await import('mobx');

      let id = 0;

      enableExternalSource((fn, trigger) => {
        const reaction = new Reaction(`mobx@${++id}`, trigger);

        return {
          track: (x) => {
            let next: any;

            reaction.track(() => (next = fn(x)));

            return next;
          },
          dispose: () => reaction.dispose(),
        };
      });
    }

    if (options.reactivity === 'kr-observable') {
      const { enableObservable } = await import('kr-observable/solidjs');

      enableObservable();
    }
  }
}
