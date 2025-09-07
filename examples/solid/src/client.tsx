import { hydrate, render } from 'solid-js/web';

import './style.css';

import { App } from './components/App';
import { StoreContext } from './components/StoreContext';
import { getRouterStore } from './routerStore';

const contextValue = { routerStore: getRouterStore() };

const initialData = (window as any).INITIAL_DATA as typeof contextValue;

async function renderSSR() {
  console.log('renderSSR');

  await contextValue.routerStore.restoreFromServer(initialData.routerStore);

  const ApToRender = () => (
    <StoreContext.Provider value={contextValue}>
      <App />
    </StoreContext.Provider>
  );

  hydrate(ApToRender, document.getElementById('app')!);
}

async function renderCSR() {
  console.log('renderCSR');

  await contextValue.routerStore.restoreFromURL({
    pathname: location.pathname + location.search,
    fallback: 'error404',
  });
  render(
    () => (
      <StoreContext.Provider value={contextValue}>
        <App />
      </StoreContext.Provider>
    ),
    document.getElementById('app')!
  );
}

if (SSR_ENABLED) void renderSSR();
else void renderCSR();
