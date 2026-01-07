```ts
import { Reaction } from 'mobx';
import { enableExternalSource } from 'solid-js';

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
```