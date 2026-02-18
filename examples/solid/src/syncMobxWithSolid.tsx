import { Reaction } from 'mobx';
import { enableExternalSource } from 'solid-js';

export function syncMobxWithSolid() {
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
