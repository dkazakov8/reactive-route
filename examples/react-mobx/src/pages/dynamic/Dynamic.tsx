import { useContext } from 'react';

import { StoreContext } from '../../components/StoreContext';

export default function Dynamic() {
  const { routerStore } = useContext(StoreContext);

  return (
    <>
      <div>Dynamic {JSON.stringify(routerStore.currentRoute.params)}</div>
      <button
        type={'button'}
        style={{ marginTop: 20 }}
        onClick={() => {
          void routerStore.redirectTo({
            route: 'dynamic',
            params: { foo: String(Math.random()).slice(2) },
          });
        }}
      >
        Go to random dynamic value
      </button>
      <div style={{ marginTop: 20 }}>
        Click button and see raw page markup. With SSR we don't even look at URL on frontend during
        hydration, just restore from the server
      </div>
    </>
  );
}
