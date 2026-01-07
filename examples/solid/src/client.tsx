import { enableObservable } from 'kr-observable/solidjs';
import { hydrate, render } from 'solid-js/web';

import { App } from './components/App';
import { getRouter, RouterContext } from './router';
import { syncMobxWithSolid } from './syncMobxWithSolid';

if (REACTIVITY_SYSTEM === 'kr-observable') {
  enableObservable(false);
}

if (REACTIVITY_SYSTEM === 'mobx') {
  syncMobxWithSolid();
}

const router = getRouter();

await router.init(location.href, { skipLifecycle: Boolean(SSR_ENABLED) });

if (SSR_ENABLED) {
  hydrate(
    () => (
      <RouterContext.Provider value={{ router }}>
        <App />
      </RouterContext.Provider>
    ),
    document.getElementById('example-app')!
  );

  console.log('SSR: App has been hydrated, no lifecycle called');
} else {
  render(
    () => (
      <RouterContext.Provider value={{ router }}>
        <App />
      </RouterContext.Provider>
    ),
    document.getElementById('example-app')!
  );

  console.log('CSR: App has been rendered and lifecycle called');
}
