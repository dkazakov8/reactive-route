import { useContext } from 'preact/hooks';

import { Router } from './Router';
import { StoreContext } from './StoreContext';

export function App() {
  const { router } = useContext(StoreContext);

  return (
    <>
      <div className={'topnav'}>
        <a
          onClick={(event) => {
            event.preventDefault();

            void router.redirectTo({ route: 'home' });
          }}
          className={router.currentRoute.name === 'home' ? 'active' : ''}
        >
          Home
        </a>
        <a
          onClick={(event) => {
            event.preventDefault();

            void router.redirectTo({ route: 'static' });
          }}
          className={router.currentRoute.name === 'static' ? 'active' : ''}
        >
          Static
        </a>
        <a
          onClick={(event) => {
            event.preventDefault();

            void router.redirectTo({
              route: 'dynamic',
              params: { foo: 'dynamic-value' },
            });
          }}
          className={router.currentRoute.name === 'dynamic' ? 'active' : ''}
        >
          Dynamic
        </a>
        <a
          onClick={(event) => {
            event.preventDefault();

            void router.redirectTo({
              route: 'query',
              query: { foo: 'value' },
            });
          }}
          className={router.currentRoute.name === 'query' ? 'active' : ''}
        >
          Query
        </a>
        <a
          onClick={(event) => {
            event.preventDefault();

            void router.redirectTo({
              route: 'preventRedirect',
            });
          }}
          className={router.currentRoute.name === 'preventRedirect' ? 'active' : ''}
        >
          Prevent redirect
        </a>
        <a href={'/not-existing-path'}>Not existing</a>
      </div>
      <div className={'pageContent'}>
        <Router />
      </div>
    </>
  );
}
