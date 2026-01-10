import { hydrate, render } from 'preact';

import './style.css';

import { App } from './components/App';
import { getRouterStore, RouterContext } from './router';
import { unescapeAllStrings } from './utils/unescapeAllStrings';

const router = await getRouterStore();

const initialData = unescapeAllStrings((window as any).INITIAL_DATA as any);

async function renderSSR() {
  console.log('renderSSR');

  await router.hydrateFromState(initialData.router);

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
