import { createApp, createSSRApp } from 'vue';

import '../../shared/style.css';

import { unescapeAllStrings } from '../../shared/utils/unescapeAllStrings';
import App from './components/App.vue';
import { getRouter } from './router';

const router = await getRouter();

const initialData = unescapeAllStrings((window as any).INITIAL_DATA as any);

async function renderSSR() {
  console.log('renderSSR');

  await router.restoreFromServer(initialData.router);

  createSSRApp(App, { router }).mount('#app');
}

async function renderCSR() {
  console.log('renderCSR');

  await router.restoreFromURL({ pathname: location.pathname + location.search });

  createApp(App, { router }).mount('#app');
}

if (SSR_ENABLED) void renderSSR();
else void renderCSR();
