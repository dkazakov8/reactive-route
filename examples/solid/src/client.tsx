import { hydrate, render } from 'solid-js/web';

import './style.css';

import { enableObservable } from 'kr-observable/solidjs';
import { Reaction } from 'mobx';
import { enableExternalSource } from 'solid-js';

import { App } from './components/App';
import { getRouter, RouterContext } from './router';
import { unescapeAllStrings } from './utils/unescapeAllStrings';

if (REACTIVITY_SYSTEM === 'kr-observable') {
  enableObservable(false);
}

if (REACTIVITY_SYSTEM === 'mobx') {
  let id = 0;

  enableExternalSource((fn, trigger) => {
    const reaction = new Reaction(`mobx@${++id}`, trigger);

    return {
      track: (x) => {
        let next;

        reaction.track(() => (next = fn(x)));

        return next;
      },
      dispose: () => reaction.dispose(),
    };
  });
}

const router = await getRouter();

const contextValue = { router };

const initialData = unescapeAllStrings((window as any).INITIAL_DATA as any);

async function renderSSR() {
  console.log('renderSSR');

  await contextValue.router.hydrateFromState(initialData.router);

  function AppToRender() {
    return (
      <RouterContext.Provider value={contextValue}>
        <App />
      </RouterContext.Provider>
    );
  }

  hydrate(AppToRender, document.getElementById('app')!);
}

async function renderCSR() {
  console.log('renderCSR');

  await contextValue.router.hydrateFromURL(location.pathname + location.search);

  render(
    () => (
      <RouterContext.Provider value={contextValue}>
        <App />
      </RouterContext.Provider>
    ),
    document.getElementById('app')!
  );
}

if (SSR_ENABLED) void renderSSR();
else void renderCSR();
