import { createConfigs } from '../../packages/core';

const loader = async () => ({ default: null });

createConfigs({
  static: {
    path: '/',
    loader,
    async beforeEnter({ currentState, nextState, reason, redirect }) {
      currentState?.name;
      currentState?.params;
      currentState?.query;
      // @ts-expect-error unknown "currentState" property is not available
      currentState?.unknown;

      nextState.name;
      nextState.params;
      nextState.query;
      // @ts-expect-error unknown "nextState" property is not available
      nextState.unknown;

      reason satisfies 'unmodified' | 'new_query' | 'new_params' | 'new_config';
      // @ts-expect-error unknown reason is not assignable
      reason satisfies 'unknown';

      redirect({ name: 'static' });
      // @ts-expect-error "replace" is controlled by the original router.redirect call, not by beforeEnter
      redirect({ name: 'static', replace: true });
      redirect({ name: 'unknown' });
      // @ts-expect-error redirect params values must be strings
      redirect({ name: 'dynamic', params: { id: 1 } });
    },
    async beforeLeave({ currentState, nextState, reason }) {
      currentState.name;
      currentState.params;
      currentState.query;
      // @ts-expect-error unknown "currentState" property is not available
      currentState.unknown;

      nextState.name;
      nextState.params;
      nextState.query;
      // @ts-expect-error unknown "nextState" property is not available
      nextState.unknown;

      reason satisfies 'unmodified' | 'new_query' | 'new_params' | 'new_config';
      // @ts-expect-error unknown reason is not assignable
      reason satisfies 'unknown';
    },
  },
  notFound: { path: '/404', loader },
  internalError: { path: '/500', loader },
});
