import { hydrate, render } from 'preact';

import './style.css';

import { App } from './components/App';
import { getRouter, RouterContext } from './router';

const router = getRouter();

await router.init(location.pathname + location.search, { skipLifecycle: Boolean(SSR_ENABLED) });

if (SSR_ENABLED) {
  hydrate(
    <RouterContext.Provider value={{ router }}>
      <App />
    </RouterContext.Provider>,
    document.getElementById('app')!
  );

  console.log('SSR: App has been hydrated, no lifecycle called');
} else {
  render(
    <RouterContext.Provider value={{ router }}>
      <App />
    </RouterContext.Provider>,
    document.getElementById('app')!
  );
  console.log('CSR: App has been rendered and lifecycle called');
}
