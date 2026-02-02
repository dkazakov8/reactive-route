import { createConfigs, createRouter } from 'reactive-route';
import { adapters } from 'reactive-route/adapters/{reactive-system}';

export function getRouter() {
  const configs = createConfigs({
    home: {
      path: '/',
      loader: () => import('./pages/home'),
    },
    user: {
      path: '/user/:id',
      params: {
        id: (value) => /^\d+$/.test(value)
      },
      query: {
        phone: (value) => value.length < 15
      },
      loader: () => import('./pages/user'),
    },
    notFound: {
      path: '/not-found',
      props: { errorCode: 404 },
      loader: () => import('./pages/error'),
    },
    internalError: {
      path: '/internal-error',
      props: { errorCode: 500 },
      loader: () => import('./pages/error'),
    }
  });
  
  return createRouter({ adapters, configs });
}