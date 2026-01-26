import { createRoot, hydrateRoot } from 'react-dom/client';

import './style.css';

import { App } from './components/App';
import { getRouter, RouterContext } from './router';

const router = await getRouter();

await router.init(location.pathname + location.search, { skipLifecycle: Boolean(SSR_ENABLED) });

if (SSR_ENABLED) {
  hydrateRoot(
    document.getElementById('app')!,
    <RouterContext.Provider value={{ router }}>
      <App />
    </RouterContext.Provider>
  );

  console.log('SSR: App has been hydrated, no lifecycle called');
} else {
  createRoot(document.getElementById('app')!).render(
    <RouterContext.Provider value={{ router }}>
      <App />
    </RouterContext.Provider>
  );

  console.log('CSR: App has been rendered and lifecycle called');
}
