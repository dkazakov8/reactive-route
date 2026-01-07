```ts
import { createConfigs, createRouter } from 'reactive-route';
import { adapters } from 'reactive-route/adapters/{reactive-system}';

const configs = createConfigs({
  home: {
    path: '/',
    loader: () => import('./pages/home'),
  }
});

export const router = createRouter({ configs, adapters });

// somewhere
await router.redirect({ name: 'home' });
```
