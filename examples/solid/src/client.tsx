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

async function renderSSR() {
  console.log('renderSSR');

  await router.hydrateFromState({ state: unescapeAllStrings((window as any).ROUTER_STATE) });

  hydrate(
    () => (
      <RouterContext.Provider value={{ router }}>
        <App />
      </RouterContext.Provider>
    ),
    document.getElementById('app')!
  );
}

async function renderCSR() {
  console.log('renderCSR');

  await router.hydrateFromURL(location.pathname + location.search);

  render(
    () => (
      <RouterContext.Provider value={{ router }}>
        <App />
      </RouterContext.Provider>
    ),
    document.getElementById('app')!
  );
}

if (SSR_ENABLED) void renderSSR();
else void renderCSR();
