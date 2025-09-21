import { useContext } from 'solid-js';

import { StoreContext } from '../../components/StoreContext';

const Query = () => {
  const { router } = useContext(StoreContext);

  return (
    <>
      <div>Query {JSON.stringify(router.currentRoute.query)}</div>
      <button
        type={'button'}
        style={{ 'margin-top': '20px' }}
        onClick={() => {
          void router.redirectTo({
            route: 'query',
            query: { foo: String(Math.random()).slice(2) },
          });
        }}
      >
        Go to random query value
      </button>
      <div style={{ 'margin-top': '20px' }}>
        Click button and see raw page markup. With SSR we don't even look at URL on frontend during
        hydration, just restore from the server
      </div>
    </>
  );
};

export default Query;
