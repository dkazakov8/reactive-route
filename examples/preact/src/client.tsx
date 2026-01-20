import { hydrate, render } from 'preact';

import './style.css';

import { App } from './components/App';
import { getRouter, RouterContext } from './router';
import { unescapeAllStrings } from './utils/unescapeAllStrings';

const router = await getRouter();

async function renderSSR() {
  console.log('renderSSR');

  await router.hydrateFromState({ state: unescapeAllStrings((window as any).ROUTER_STATE) });

  hydrate(
    <RouterContext.Provider value={{ router }}>
      <App />
    </RouterContext.Provider>,
    document.getElementById('app')!
  );
}

async function renderCSR() {
  console.log('renderCSR');

  await router.hydrateFromURL(location.pathname + location.search);

  render(
    <RouterContext.Provider value={{ router }}>
      <App />
    </RouterContext.Provider>,
    document.getElementById('app')!
  );
}

if (SSR_ENABLED) void renderSSR();
else void renderCSR();
