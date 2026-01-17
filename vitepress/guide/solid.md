# Solid.js Integration

## Solid.js native reactivity

The relevant imports are as follows

```ts
import { Router } from 'reactive-route/solid';
import { adapters } from 'reactive-route/adapters/solid';
```

No extra packages or configuration needed.

## Mobx

The relevant imports are as follows

```ts
import { Router } from 'reactive-route/solid';
import { adapters } from 'reactive-route/adapters/mobx-solid';
```

You should ensure that package `mobx` is installed.

Actually Solid.js has no native integration with MobX. So if you use MobX with Solid.js you probably
use something like this:

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

... or has better alternatives. Anyway, something like this should be included in your entry file.

## Observable

The relevant imports are as follows

```ts
import { Router } from 'reactive-route/solid';
import { adapters } from 'reactive-route/adapters/kr-observable-solid';
```

You should ensure that package `kr-observable` is installed.

Be sure to enable integration in your entry file

```ts
import { enableObservable } from 'kr-observable/solidjs';

enableObservable();
```

