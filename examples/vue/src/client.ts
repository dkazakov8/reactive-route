import { createApp, createSSRApp } from 'vue';

import './style.css';

import App from './components/App.vue';
import { getRouter } from './router';
import { unescapeAllStrings } from './utils/unescapeAllStrings';

const router = await getRouter();

const initialData = unescapeAllStrings((window as any).INITIAL_DATA as any);

async function renderSSR() {
  console.log('renderSSR');

  await router.hydrateFromState(initialData.router);

  createSSRApp(App, { router }).mount('#app');
}

async function renderCSR() {
  console.log('renderCSR');

  await router.hydrateFromURL({ pathname: location.pathname + location.search });

  createApp(App, { router }).mount('#app');
}

if (SSR_ENABLED) void renderSSR();
else void renderCSR();
