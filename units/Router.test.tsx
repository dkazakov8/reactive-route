import { routerTests } from './helpers/routerTests';
import type { TypeOptions } from './helpers/types';

// biome-ignore lint/correctness/noUndeclaredVariables: false
routerTests(OPTIONS as TypeOptions, async (options) => {
  if (options.renderer === 'solid') {
    if (options.reactivity === 'mobx') {
      const { enableExternalSource } = await import('solid-js');
      const { Reaction } = await import('mobx');

      let id = 0;

      enableExternalSource((fn, trigger) => {
        const reaction = new Reaction(`mobx@${++id}`, trigger);

        return {
          track: (x) => {
            let next;

            reaction.track(() => (next = fn(x)));

            return next;
          },
          dispose: () => reaction.dispose(),
        };
      });
    }

    if (options.reactivity === 'kr-observable') {
      // @ts-ignore
      const { enableObservable } = await import('kr-observable/solidjs');

      enableObservable();
    }
  }
});
