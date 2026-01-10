import { createRoot, hydrateRoot } from 'react-dom/client';

import './style.css';

import { App } from './components/App';
import { getRouter, RouterContext } from './router';
import { unescapeAllStrings } from './utils/unescapeAllStrings';

const router = await getRouter();

const initialData = unescapeAllStrings((window as any).INITIAL_DATA as any);

async function renderSSR() {
  console.log('renderSSR');

  await router.hydrateFromState(initialData.router);

  hydrateRoot(
    document.getElementById('app')!,
    <RouterContext.Provider value={{ router }}>
      <App />
    </RouterContext.Provider>
  );
}

async function renderCSR() {
  console.log('renderCSR');

  await router.hydrateFromURL(location.pathname + location.search);

  createRoot(document.getElementById('app')!).render(
    <RouterContext.Provider value={{ router }}>
      <App />
    </RouterContext.Provider>
  );
}

if (SSR_ENABLED) void renderSSR();
else void renderCSR();
