import { createRoot, hydrateRoot } from 'react-dom/client';

import '../../shared/style.css';

import { unescapeAllStrings } from '../../shared/utils/unescapeAllStrings';
import { App } from './components/App';
import { StoreContext } from './components/StoreContext';
import { getRouter } from './router';

const router = await getRouter();

const initialData = unescapeAllStrings((window as any).INITIAL_DATA as any);

async function renderSSR() {
  console.log('renderSSR');

  await router.restoreFromServer(initialData.router);

  hydrateRoot(
    document.getElementById('app')!,
    <StoreContext.Provider value={{ router }}>
      <App />
    </StoreContext.Provider>
  );
}

async function renderCSR() {
  console.log('renderCSR');

  await router.restoreFromURL({ pathname: location.pathname + location.search });

  createRoot(document.getElementById('app')!).render(
    <StoreContext.Provider value={{ router }}>
      <App />
    </StoreContext.Provider>
  );
}

if (SSR_ENABLED) void renderSSR();
else void renderCSR();
