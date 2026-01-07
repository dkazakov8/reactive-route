import { createApp, createSSRApp } from 'vue';

import App from './components/App.vue';
import { getRouter, routerStoreKey } from './router';

const router = getRouter();

await router.init(location.href, { skipLifecycle: Boolean(SSR_ENABLED) });

if (SSR_ENABLED) {
  createSSRApp(App, { router }).provide(routerStoreKey, { router }).mount('#example-app');

  console.log('SSR: App has been hydrated, no lifecycle called');
} else {
  createApp(App, { router }).provide(routerStoreKey, { router }).mount('#example-app');

  console.log('CSR: App has been rendered and lifecycle called');
}
