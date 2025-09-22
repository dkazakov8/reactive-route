# Advanced

## Redirects chain

This library fully supports unlimited redirects in SPA / SSR.

```typescript
const routes = createRoutes({
  one: {
    path: '/1',
    oader: () => import('./pages/one'),
  },
  two: {
    path: '/2',
    loader: () => import('./pages/two'),
    async beforeEnter(config) {
      return config.redirect({ route: 'one' });
    },
  },
  three: {
    path: '/3',
    loader: () => import('./pages/three'),
    async beforeEnter(config) {
      return config.redirect({ route: 'two' });
    },
  },
  four: {
    path: '/4',
    loader: () => import('./pages/four'),
    async beforeEnter(config) {
      return config.redirect({ route: 'three' });
    },
  },
  
  // Other routes
});
```

In this case if user goes to `/4` he will be redirected to `/3` then `/2` then `/1`. 
Browser's history and `router.routesHistory` will only have `['/1']`. 
Also, chunks for pages four, three, two will not be loaded if you configured async chunks in your Bundler.

## Mobx

The relevant imports are as follows

```typescript
import { Router } from 'reactive-route/solid';
import { adapters } from 'reactive-route/adapters/mobx-solid';
```

You should ensure that package `mobx` is installed.

Actually Solid.js has no native integration with MobX. So if you use MobX with Solid.js you probably
use something like this:

```typescript
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

```typescript
import { Router } from 'reactive-route/solid';
import { adapters } from 'reactive-route/adapters/kr-observable-solid';
```

You should ensure that package `kr-observable` is installed.

Be sure to enable integration in your entry file

```typescript
import { enableObservable } from 'kr-observable/solidjs';

enableObservable();
```

