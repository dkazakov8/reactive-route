import { createRoot, hydrateRoot } from 'react-dom/client';

import './style.css';

import { App } from './components/App';
import { StoreContext } from './components/StoreContext';
import { getRouterStore } from './routerStore';

const contextValue = { routerStore: getRouterStore() };

const initialData = (window as any).INITIAL_DATA as typeof contextValue;

async function renderSSR() {
  console.log('renderSSR');

  await contextValue.routerStore.restoreFromServer(initialData.routerStore);

  hydrateRoot(
    document.getElementById('app')!,
    <StoreContext.Provider value={contextValue}>
      <App />
    </StoreContext.Provider>
  );
}

async function renderCSR() {
  console.log('renderCSR');

  await contextValue.routerStore.restoreFromURL({
    pathname: location.pathname + location.search,
    fallback: 'error404',
  });

  createRoot(document.getElementById('app')!).render(
    <StoreContext.Provider value={contextValue}>
      <App />
    </StoreContext.Provider>
  );
}

if (SSR_ENABLED) void renderSSR();
else void renderCSR();
