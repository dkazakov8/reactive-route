// @ts-ignore
import { enableObservable } from 'kr-observable/solidjs';
import { Reaction } from 'mobx';
import { enableExternalSource } from 'solid-js';

import { routerTests } from '../../../testHelpers/routerTests';

routerTests(
  [
    {
      renderer: 'solid',
      reactivity: 'mobx',
    },
    {
      renderer: 'solid',
      reactivity: 'solid',
    },
    {
      renderer: 'solid',
      reactivity: 'kr-observable',
    },
  ],
  (options) => {
    if (options.reactivity === 'mobx') {
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
      enableObservable();
    }
  }
);
