import { hydrate, render } from 'preact';

import '../../shared/style.css';

import { unescapeAllStrings } from '../../shared/utils/unescapeAllStrings';
import { App } from './components/App';
import { StoreContext } from './components/StoreContext';
import { getRouterStore } from './routerStore';

const routerStore = await getRouterStore();

const initialData = unescapeAllStrings((window as any).INITIAL_DATA as any);

async function renderSSR() {
  console.log('renderSSR');

  await routerStore.restoreFromServer(initialData.routerStore);

  hydrate(
    <StoreContext.Provider value={{ routerStore }}>
      <App />
    </StoreContext.Provider>,
    document.getElementById('app')!
  );
}

async function renderCSR() {
  console.log('renderCSR');

  await routerStore.restoreFromURL({ pathname: location.pathname + location.search });

  render(
    <StoreContext.Provider value={{ routerStore }}>
      <App />
    </StoreContext.Provider>,
    document.getElementById('app')!
  );
}

if (SSR_ENABLED) void renderSSR();
else void renderCSR();
