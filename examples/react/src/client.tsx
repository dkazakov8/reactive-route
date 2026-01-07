import { createRoot, hydrateRoot } from 'react-dom/client';

import { App } from './components/App';
import { getRouter, RouterContext } from './router';

const router = getRouter();

await router.init(location.href, { skipLifecycle: Boolean(SSR_ENABLED) });

if (SSR_ENABLED) {
  hydrateRoot(
    document.getElementById('example-app')!,
    <RouterContext.Provider value={{ router }}>
      <App />
    </RouterContext.Provider>
  );

  console.log('SSR: App has been hydrated, no lifecycle called');
} else {
  createRoot(document.getElementById('example-app')!).render(
    <RouterContext.Provider value={{ router }}>
      <App />
    </RouterContext.Provider>
  );

  console.log('CSR: App has been rendered and lifecycle called');
}
