import { hydrate, render } from 'solid-js/web';

import './style.css';

import { enableObservable } from 'kr-observable/solidjs';
import { Reaction } from 'mobx';
import { enableExternalSource } from 'solid-js';

import { App } from './components/App';
import { getRouter, RouterContext } from './router';

if (REACTIVITY_SYSTEM === 'kr-observable') {
  enableObservable(false);
}

if (REACTIVITY_SYSTEM === 'mobx') {
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

const router = getRouter();

await router.init(location.pathname + location.search, { skipLifecycle: Boolean(SSR_ENABLED) });

if (SSR_ENABLED) {
  hydrate(
    () => (
      <RouterContext.Provider value={{ router }}>
        <App />
      </RouterContext.Provider>
    ),
    document.getElementById('app')!
  );

  console.log('SSR: App has been hydrated, no lifecycle called');
} else {
  render(
    () => (
      <RouterContext.Provider value={{ router }}>
        <App />
      </RouterContext.Provider>
    ),
    document.getElementById('app')!
  );

  console.log('CSR: App has been rendered and lifecycle called');
}
