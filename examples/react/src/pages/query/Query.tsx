import { useContext } from 'react';

import { StoreContext } from '../../components/StoreContext';

export default function Query() {
  const { router } = useContext(StoreContext);

  return (
    <>
      <div>Query {JSON.stringify(router.currentRoute.query)}</div>
      <button
        type={'button'}
        style={{ marginTop: 20 }}
        onClick={() => {
          void router.redirectTo({
            route: 'query',
            query: { foo: String(Math.random()).slice(2) },
          });
        }}
      >
        Go to random query value
      </button>
      <div style={{ marginTop: 20 }}>
        Click button and see raw page markup. With SSR we don't even look at URL on frontend during
        hydration, just restore from the server
      </div>
    </>
  );
}
