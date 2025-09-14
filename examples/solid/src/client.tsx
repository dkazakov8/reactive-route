import { hydrate, render } from 'solid-js/web';

import '../../shared/style.css';

import { enableObservable } from 'kr-observable/solidjs';

import { unescapeAllStrings } from '../../shared/utils/unescapeAllStrings';
import { App } from './components/App';
import { StoreContext } from './components/StoreContext';
import { getRouterStore } from './routerStore';

if (REACTIVITY_SYSTEM === 'kr-observable') {
  enableObservable(false);
}

const routerStore = await getRouterStore();

const contextValue = { routerStore };

const initialData = unescapeAllStrings((window as any).INITIAL_DATA as any);

async function renderSSR() {
  console.log('renderSSR');

  await contextValue.routerStore.restoreFromServer(initialData.routerStore);

  function AppToRender() {
    return (
      <StoreContext.Provider value={contextValue}>
        <App />
      </StoreContext.Provider>
    );
  }

  hydrate(AppToRender, document.getElementById('app')!);
}

async function renderCSR() {
  console.log('renderCSR');

  await contextValue.routerStore.restoreFromURL({ pathname: location.pathname + location.search });

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
